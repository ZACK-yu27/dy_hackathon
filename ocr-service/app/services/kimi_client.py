from __future__ import annotations

import json
import logging
import re
from pathlib import Path

import httpx

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
        if not settings.kimi_api_key:
            raise RuntimeError("Kimi API key is not configured.")
        self.api_key = settings.kimi_api_key
        self.base_url = settings.kimi_base_url.rstrip("/")
        self.model = settings.kimi_model
        self.timeout = httpx.Timeout(120.0, connect=30.0)

    def extract_file_text(self, file_path: Path) -> KimiExtractionResult:
        logger.info("Uploading file to Kimi for OCR/file extraction: %s", file_path.name)
        with httpx.Client(timeout=self.timeout) as client:
            with file_path.open("rb") as file_obj:
                upload_response = client.post(
                    self._api_url("/files"),
                    headers=self._headers(),
                    data={"purpose": "file-extract"},
                    files={"file": (file_path.name, file_obj)},
                )
            upload_response.raise_for_status()
            file_id = upload_response.json()["id"]

            content_response = client.get(
                self._api_url(f"/files/{file_id}/content"),
                headers=self._headers(),
            )
            content_response.raise_for_status()
            file_content = content_response.text

        return KimiExtractionResult(extracted_text=file_content.strip(), file_id=file_id)

    def structure_text(self, extracted_text: str, context_text: str | None = None) -> list[StructuredItemInput]:
        merged_context = extracted_text.strip()
        if context_text:
            merged_context = f"{merged_context}\n\n补充上下文：\n{context_text.strip()}"

        with httpx.Client(timeout=self.timeout) as client:
            response = client.post(
                self._api_url("/chat/completions"),
                headers=self._headers(),
                json={
                    "model": self.model,
                    "temperature": 0.1,
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

    def _headers(self) -> dict[str, str]:
        return {
            "Authorization": f"Bearer {self.api_key}",
        }

    def _api_url(self, path: str) -> str:
        return f"{self.base_url}{path}"

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
                raise ValueError("Kimi did not return valid JSON.")
            return json.loads(brace_match.group(1))
