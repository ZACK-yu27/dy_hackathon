from __future__ import annotations

import io
import json
import logging
import os
import re
from pathlib import Path

import fitz
import httpx
import pytesseract
from PIL import Image, ImageOps

from app.config import get_settings
from app.schemas import KimiExtractionResult, StructuredItemInput

logger = logging.getLogger(__name__)

STRUCTURED_OUTPUT_PROMPT = """
你是旅游信息结构化助手。请基于我提供的 OCR 文本与补充上下文，抽取旅游相关信息，并只输出 JSON。

抽取规则：
1. 只保留和旅游相关的信息。
2. 类别只能是：景点、饮食、交通、住宿。
3. 每个对象输出四个字段：category、name、location、summary。
4. location 若正文未明确给出，则结合上下文尽量补全到“城市-区域-地点”粒度；仍无法判断时写“未明确地点”。
5. summary 必须是一句中文完整陈述句，20-45字优先。
6. 如果文本中没有可用旅游信息，返回 {"items": []}。

输出格式：
{
  "items": [
    {
      "category": "景点",
      "name": "外滩",
      "location": "上海市黄浦区中山东一路",
      "summary": "外滩适合城市漫步和夜景打卡，黄浦江沿岸景观是最大亮点。"
    }
  ]
}
""".strip()


class KimiClient:
    def __init__(self) -> None:
        settings = get_settings()
        if not settings.deepseek_api_key:
            raise RuntimeError("DeepSeek API key is not configured.")
        tesseract_path = Path(settings.tesseract_cmd)
        if not tesseract_path.exists():
            raise RuntimeError(f"Tesseract executable not found: {tesseract_path}")
        tessdata_path = Path(settings.tessdata_prefix)
        if not tessdata_path.exists():
            raise RuntimeError(f"Tesseract tessdata directory not found: {tessdata_path}")

        self.deepseek_api_key = settings.deepseek_api_key
        self.deepseek_base_url = settings.deepseek_base_url.rstrip("/")
        self.deepseek_model = settings.deepseek_model
        self.ocr_language = settings.ocr_language
        self.tesseract_config = settings.tesseract_config
        self.timeout = httpx.Timeout(120.0, connect=30.0)

        pytesseract.pytesseract.tesseract_cmd = str(tesseract_path)
        os.environ["TESSDATA_PREFIX"] = str(tessdata_path)

    def extract_file_text(self, file_path: Path) -> KimiExtractionResult:
        logger.info("Running local OCR extraction for %s", file_path.name)
        suffix = file_path.suffix.lower()
        if suffix == ".pdf":
            extracted_text = self._extract_pdf_text(file_path)
        else:
            extracted_text = self._extract_image_text(file_path)

        normalized = self._normalize_text(extracted_text)
        logger.info("Local OCR finished for %s with %s characters", file_path.name, len(normalized))
        return KimiExtractionResult(extracted_text=normalized, file_id=None)

    def structure_text(self, extracted_text: str, context_text: str | None = None) -> list[StructuredItemInput]:
        merged_context = extracted_text.strip()
        if context_text:
            merged_context = f"{merged_context}\n\n补充上下文：\n{context_text.strip()}"

        with httpx.Client(timeout=self.timeout) as client:
            response = client.post(
                self._deepseek_api_url("/chat/completions"),
                headers=self._deepseek_headers(),
                json={
                    "model": self.deepseek_model,
                    "temperature": 0.1,
                    "response_format": {"type": "json_object"},
                    "thinking": {"type": "disabled"},
                    "messages": [
                        {"role": "system", "content": STRUCTURED_OUTPUT_PROMPT},
                        {"role": "user", "content": merged_context},
                    ],
                },
            )
            response.raise_for_status()
            content = response.json()["choices"][0]["message"]["content"] or ""
        payload = self._extract_json_payload(content)
        items = payload.get("items", [])
        return [StructuredItemInput.model_validate(item) for item in items]

    def _extract_image_text(self, file_path: Path) -> str:
        image = Image.open(file_path).convert("RGB")
        return self._ocr_image(image)

    def _extract_pdf_text(self, file_path: Path) -> str:
        document = fitz.open(file_path)
        page_texts: list[str] = []
        try:
            for index in range(document.page_count):
                page = document.load_page(index)
                pixmap = page.get_pixmap(dpi=250, alpha=False)
                image = Image.open(io.BytesIO(pixmap.tobytes("png"))).convert("RGB")
                text = self._ocr_image(image)
                if text:
                    page_texts.append(text)
        finally:
            document.close()
        return "\n\n".join(page_texts)

    def _ocr_image(self, image: Image.Image) -> str:
        prepared = self._prepare_image(image)
        candidates = [
            self.tesseract_config,
            f"{self.tesseract_config} --psm 11",
        ]
        results = []
        for config in candidates:
            text = pytesseract.image_to_string(
                prepared,
                lang=self.ocr_language,
                config=config,
            )
            results.append(self._normalize_text(text))
        return max(results, key=len, default="")

    @staticmethod
    def _prepare_image(image: Image.Image) -> Image.Image:
        grayscale = ImageOps.autocontrast(image.convert("L"))
        width, height = grayscale.size
        scaled = grayscale.resize((max(width * 2, 1), max(height * 2, 1)))
        return scaled

    @staticmethod
    def _normalize_text(text: str) -> str:
        lines = [line.strip() for line in text.replace("\r", "\n").split("\n")]
        return "\n".join(line for line in lines if line)

    def _deepseek_headers(self) -> dict[str, str]:
        return {
            "Authorization": f"Bearer {self.deepseek_api_key}",
            "Content-Type": "application/json",
        }

    def _deepseek_api_url(self, path: str) -> str:
        return f"{self.deepseek_base_url}{path}"

    @staticmethod
    def _extract_json_payload(content: str) -> dict:
        text = content.strip()
        fenced_match = re.search(r"```(?:json)?\s*(\{[\s\S]*\})\s*```", text)
        if fenced_match:
            text = fenced_match.group(1).strip()

        try:
            return json.loads(text)
        except json.JSONDecodeError:
            brace_match = re.search(r"(\{[\s\S]*\})", text)
            if not brace_match:
                raise ValueError("DeepSeek did not return valid JSON.")
            return json.loads(brace_match.group(1))
