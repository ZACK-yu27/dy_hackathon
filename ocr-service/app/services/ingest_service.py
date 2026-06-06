from __future__ import annotations

import logging
from pathlib import Path

from sqlalchemy.orm import Session

from app.models import TravelStructuredItem
from app.schemas import StructuredItemInput, StructuredItemRecord, UploadIngestResponse
from app.services.kimi_client import KimiClient

logger = logging.getLogger(__name__)


class IngestService:
    def __init__(self) -> None:
        self.kimi_client = KimiClient()

    def ingest_file(
        self,
        *,
        db: Session,
        file_path: Path,
        file_name: str,
        file_type: str,
        context_text: str | None = None,
    ) -> UploadIngestResponse:
        extraction = self.kimi_client.extract_file_text(file_path)
        structured_items = self.kimi_client.structure_text(
            extracted_text=extraction.extracted_text,
            context_text=context_text,
        )

        saved_items = self._persist_items(db=db, items=structured_items)
        logger.info(
            "Ingested file=%s file_id=%s item_count=%s",
            file_name,
            extraction.file_id,
            len(saved_items),
        )
        return UploadIngestResponse(
            status="success",
            file_name=file_name,
            file_type=file_type,  # type: ignore[arg-type]
            extracted_text=extraction.extracted_text,
            item_count=len(saved_items),
            items=saved_items,
        )

    def list_items(self, db: Session, limit: int = 100) -> list[StructuredItemRecord]:
        records = (
            db.query(TravelStructuredItem)
            .order_by(TravelStructuredItem.id.desc())
            .limit(limit)
            .all()
        )
        return [StructuredItemRecord.model_validate(record) for record in records]

    @staticmethod
    def _persist_items(db: Session, items: list[StructuredItemInput]) -> list[StructuredItemRecord]:
        records: list[TravelStructuredItem] = []
        for item in items:
            record = TravelStructuredItem(
                category=item.category,
                name=item.name,
                location=item.location,
                summary=item.summary,
            )
            db.add(record)
            records.append(record)

        db.commit()
        for record in records:
            db.refresh(record)

        return [StructuredItemRecord.model_validate(record) for record in records]
