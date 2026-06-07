from __future__ import annotations

import logging
import time

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.schemas import BatchOCRResult
from app.services.ocr_engine import OCREngine

router = APIRouter(prefix="/ocr", tags=["ocr"])
logger = logging.getLogger(__name__)
engine = OCREngine()

SUPPORTED_TYPES = {
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
}


@router.post("/parse")
async def parse_document(file: UploadFile = File(...)):
    if file.content_type not in SUPPORTED_TYPES:
        raise HTTPException(status_code=415, detail=f"Unsupported file type: {file.content_type}")

    raw_bytes = await file.read()
    if not raw_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    try:
        result = engine.parse_upload(
            file_name=file.filename or "uploaded-file",
            raw_bytes=raw_bytes,
            content_type=file.content_type or "",
        )
        logger.info("Parsed file=%s status=%s", result.file_name, result.status)
        return result.model_dump()
    except Exception as exc:
        logger.exception("OCR failed for %s", file.filename)
        raise HTTPException(status_code=500, detail=f"OCR processing failed: {exc}") from exc


@router.post("/batch")
async def parse_batch(files: list[UploadFile] = File(...)):
    started = time.perf_counter()
    results = []
    success_count = 0
    failure_count = 0

    for file in files:
        if file.content_type not in SUPPORTED_TYPES:
            failure_count += 1
            continue

        raw_bytes = await file.read()
        if not raw_bytes:
            failure_count += 1
            continue

        try:
            result = engine.parse_upload(
                file_name=file.filename or "uploaded-file",
                raw_bytes=raw_bytes,
                content_type=file.content_type or "",
            )
            results.append(result)
            if result.status == "failed":
                failure_count += 1
            else:
                success_count += 1
        except Exception:
            logger.exception("Batch OCR failed for %s", file.filename)
            failure_count += 1

    status = "success" if failure_count == 0 else "partial_success"
    if success_count == 0:
        status = "failed"

    payload = BatchOCRResult(
        status=status,
        total_files=len(files),
        success_count=success_count,
        failure_count=failure_count,
        elapsed_ms=int((time.perf_counter() - started) * 1000),
        results=results,
    )
    return payload.model_dump()
