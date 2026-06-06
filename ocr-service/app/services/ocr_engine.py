from __future__ import annotations

import io
import logging
import os
import time
from pathlib import Path

import fitz
import pytesseract
from PIL import Image, ImageOps
from pytesseract import Output

from app.config import get_settings
from app.schemas import OCRLine, OCRPage, OCRResult

logger = logging.getLogger(__name__)


class OCREngine:
    def __init__(self) -> None:
        settings = get_settings()
        self.language = settings.model_lang
        self.tesseract_config = settings.tesseract_config
        if not Path(settings.tesseract_cmd).exists():
            raise FileNotFoundError(f"Tesseract executable not found: {settings.tesseract_cmd}")
        pytesseract.pytesseract.tesseract_cmd = settings.tesseract_cmd
        os.environ["TESSDATA_PREFIX"] = settings.tessdata_prefix

    def parse_upload(self, file_name: str, raw_bytes: bytes, content_type: str) -> OCRResult:
        started = time.perf_counter()
        suffix = Path(file_name).suffix.lower()
        if content_type == "application/pdf" or suffix == ".pdf":
            result = self._parse_pdf(file_name, raw_bytes)
        else:
            result = self._parse_image(file_name, raw_bytes)
        result.elapsed_ms = int((time.perf_counter() - started) * 1000)
        return result

    def _parse_image(self, file_name: str, raw_bytes: bytes) -> OCRResult:
        image = Image.open(io.BytesIO(raw_bytes)).convert("RGB")
        page = self._recognize_page(image, page_number=1)
        return OCRResult(
            status="success" if page.lines else "failed",
            file_name=file_name,
            file_type="image",
            language=self.language,
            elapsed_ms=0,
            page_count=1,
            pages=[page],
            warnings=[] if page.lines else ["No text was recognized from the image."],
        )

    def _parse_pdf(self, file_name: str, raw_bytes: bytes) -> OCRResult:
        pages: list[OCRPage] = []
        warnings: list[str] = []
        document = fitz.open(stream=raw_bytes, filetype="pdf")
        for index, page in enumerate(document, start=1):
            pixmap = page.get_pixmap(dpi=200, alpha=False)
            image = Image.open(io.BytesIO(pixmap.tobytes("png"))).convert("RGB")
            ocr_page = self._recognize_page(image, page_number=index)
            pages.append(ocr_page)
            if not ocr_page.lines:
                warnings.append(f"Page {index} returned no recognized text.")
        status = "success"
        if warnings and len(warnings) < len(pages):
            status = "partial_success"
        elif warnings and len(warnings) == len(pages):
            status = "failed"
        return OCRResult(
            status=status,
            file_name=file_name,
            file_type="pdf",
            language=self.language,
            elapsed_ms=0,
            page_count=len(pages),
            pages=pages,
            warnings=warnings,
        )

    def _recognize_page(self, image: Image.Image, page_number: int) -> OCRPage:
        prepared = ImageOps.autocontrast(image.convert("L"))
        result = pytesseract.image_to_data(
            prepared,
            lang=self.language,
            config=self.tesseract_config,
            output_type=Output.DICT,
        )
        grouped: dict[tuple[int, int, int], list[dict[str, float | str]]] = {}
        total = len(result.get("text", []))
        for idx in range(total):
            text = (result["text"][idx] or "").strip()
            if not text:
                continue
            score_raw = result["conf"][idx]
            score = None
            if score_raw not in ("-1", -1, None, ""):
                score = float(score_raw) / 100.0
            left = float(result["left"][idx])
            top = float(result["top"][idx])
            width = float(result["width"][idx])
            height = float(result["height"][idx])
            bbox = [
                [left, top],
                [left + width, top],
                [left + width, top + height],
                [left, top + height],
            ]
            key = (
                int(result.get("block_num", [0] * total)[idx]),
                int(result.get("par_num", [0] * total)[idx]),
                int(result.get("line_num", [0] * total)[idx]),
            )
            grouped.setdefault(key, []).append({"text": text, "score": score or 0.0, "bbox": bbox})

        lines: list[OCRLine] = []
        for key in sorted(grouped):
            items = grouped[key]
            texts = [str(item["text"]) for item in items]
            scores = [float(item["score"]) for item in items if item["score"] is not None]
            xs = [point[0] for item in items for point in item["bbox"]]  # type: ignore[index]
            ys = [point[1] for item in items for point in item["bbox"]]  # type: ignore[index]
            bbox = [
                [min(xs), min(ys)],
                [max(xs), min(ys)],
                [max(xs), max(ys)],
                [min(xs), max(ys)],
            ]
            lines.append(
                OCRLine(
                    text=" ".join(texts),
                    score=round(sum(scores) / len(scores), 4) if scores else None,
                    bbox=bbox,
                )
            )

        merged_text = "\n".join(line.text for line in lines)
        logger.info("Recognized %s lines on page %s", len(lines), page_number)
        return OCRPage(page_number=page_number, text=merged_text, lines=lines)
