from __future__ import annotations

import logging
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db_session
from app.schemas import ListStructuredItemsResponse
from app.services.ingest_service import IngestService

router = APIRouter(prefix="/ingest", tags=["ingest"])
logger = logging.getLogger(__name__)
service = IngestService()

SUPPORTED_TYPES = {
    "application/pdf": "pdf",
    "image/png": "image",
    "image/jpeg": "image",
    "image/jpg": "image",
    "image/webp": "image",
}


@router.post("/upload")
async def upload_and_ingest(
    file: UploadFile = File(...),
    context_text: str | None = Form(default=None),
    db: Session = Depends(get_db_session),
):
    content_type = file.content_type or ""
    if content_type not in SUPPORTED_TYPES:
        raise HTTPException(status_code=415, detail=f"Unsupported file type: {content_type}")

    raw_bytes = await file.read()
    if not raw_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    settings = get_settings()
    max_size_bytes = settings.max_upload_mb * 1024 * 1024
    if len(raw_bytes) > max_size_bytes:
        raise HTTPException(status_code=413, detail=f"Uploaded file exceeds {settings.max_upload_mb} MB.")

    upload_dir = Path(settings.upload_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)

    suffix = Path(file.filename or "upload").suffix or (".pdf" if content_type == "application/pdf" else ".png")
    temp_path = upload_dir / f"{uuid4().hex}{suffix}"
    temp_path.write_bytes(raw_bytes)

    try:
        response = service.ingest_file(
            db=db,
            file_path=temp_path,
            file_name=file.filename or temp_path.name,
            file_type=SUPPORTED_TYPES[content_type],
            context_text=context_text,
        )
        return response.model_dump(mode="json")
    except RuntimeError as exc:
        logger.exception("Upload failed due to configuration error.")
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Upload and ingest failed for %s", file.filename)
        raise HTTPException(status_code=500, detail=f"Ingest processing failed: {exc}") from exc
    finally:
        temp_path.unlink(missing_ok=True)


@router.get("/items", response_model=ListStructuredItemsResponse)
def list_structured_items(
    limit: int = Query(default=100, ge=1, le=500),
    db: Session = Depends(get_db_session),
):
    items = service.list_items(db=db, limit=limit)
    return ListStructuredItemsResponse(total=len(items), items=items)
