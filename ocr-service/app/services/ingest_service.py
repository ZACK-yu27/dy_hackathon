from __future__ import annotations

import logging
import re
from pathlib import Path

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models import TravelStructuredItem
from app.schemas import StructuredItemInput, StructuredItemRecord, UploadIngestResponse
from app.services.kimi_client import KimiClient
from app.services.warning_service import WarningService

logger = logging.getLogger(__name__)


class IngestService:
    def __init__(self) -> None:
        self.kimi_client = KimiClient()
        self.warning_service = WarningService()

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
        cleaned_items = [self._clean_item(item) for item in structured_items]

        saved_items, deduplicated_count = self._persist_items(db=db, items=cleaned_items)
        hydrated_items = self._resolve_items(db=db, items=cleaned_items)
        warnings, warning_saved_count = self.warning_service.match_and_persist(
            db=db,
            items=hydrated_items,
        )
        logger.info(
            "Ingested file=%s file_id=%s item_count=%s saved_count=%s deduplicated_count=%s warning_count=%s warning_saved_count=%s",
            file_name,
            extraction.file_id,
            len(cleaned_items),
            len(saved_items),
            deduplicated_count,
            len(warnings),
            warning_saved_count,
        )
        return UploadIngestResponse(
            status="success",
            file_name=file_name,
            file_type=file_type,  # type: ignore[arg-type]
            extracted_text=extraction.extracted_text,
            item_count=len(cleaned_items),
            saved_count=len(saved_items),
            deduplicated_count=deduplicated_count,
            items=saved_items,
            warning_count=len(warnings),
            warning_saved_count=warning_saved_count,
            warnings=warnings,
        )

    def list_items(
        self,
        db: Session,
        limit: int = 100,
        category: str | None = None,
        keyword: str | None = None,
    ) -> list[StructuredItemRecord]:
        records = self._build_query(
            db=db,
            limit=limit,
            category=category,
            keyword=keyword,
        ).all()
        return [StructuredItemRecord.model_validate(record) for record in records]

    def export_items(
        self,
        db: Session,
        limit: int = 1000,
        category: str | None = None,
        keyword: str | None = None,
    ) -> list[StructuredItemRecord]:
        return self.list_items(
            db=db,
            limit=limit,
            category=category,
            keyword=keyword,
        )

    def _build_query(
        self,
        *,
        db: Session,
        limit: int,
        category: str | None,
        keyword: str | None,
    ):
        query = db.query(TravelStructuredItem)
        if category:
            query = query.filter(TravelStructuredItem.category == self._normalize_category(category))
        if keyword:
            normalized_keyword = self._clean_keyword(keyword)
            like_term = f"%{normalized_keyword}%"
            query = query.filter(
                or_(
                    TravelStructuredItem.name.ilike(like_term),
                    TravelStructuredItem.location.ilike(like_term),
                    TravelStructuredItem.summary.ilike(like_term),
                )
            )
        return query.order_by(TravelStructuredItem.id.desc()).limit(limit)

    def _persist_items(self, db: Session, items: list[StructuredItemInput]) -> tuple[list[StructuredItemRecord], int]:
        existing_keys = {
            self._dedupe_key(record.category, record.name, record.location)
            for record in db.query(
                TravelStructuredItem.category,
                TravelStructuredItem.name,
                TravelStructuredItem.location,
            ).all()
        }
        batch_keys: set[str] = set()
        records: list[TravelStructuredItem] = []
        deduplicated_count = 0
        for item in items:
            dedupe_key = self._dedupe_key(item.category, item.name, item.location)
            if dedupe_key in existing_keys or dedupe_key in batch_keys:
                deduplicated_count += 1
                continue

            record = TravelStructuredItem(
                category=item.category,
                name=item.name,
                location=item.location,
                summary=item.summary,
            )
            db.add(record)
            records.append(record)
            batch_keys.add(dedupe_key)

        db.commit()
        for record in records:
            db.refresh(record)

        return [StructuredItemRecord.model_validate(record) for record in records], deduplicated_count

    def _resolve_items(self, db: Session, items: list[StructuredItemInput]) -> list[StructuredItemRecord]:
        if not items:
            return []

        target_keys = {self._dedupe_key(item.category, item.name, item.location) for item in items}
        records = (
            db.query(TravelStructuredItem)
            .filter(TravelStructuredItem.name.in_([item.name for item in items]))
            .filter(TravelStructuredItem.category.in_([item.category for item in items]))
            .all()
        )
        matched_records = []
        for record in records:
            record_key = self._dedupe_key(record.category, record.name, record.location)
            if record_key in target_keys:
                matched_records.append(record)
        return [StructuredItemRecord.model_validate(record) for record in matched_records]

    @classmethod
    def _clean_item(cls, item: StructuredItemInput) -> StructuredItemInput:
        return StructuredItemInput(
            category=cls._normalize_category(item.category),
            name=cls._clean_name(item.name),
            location=cls._clean_location(item.location),
            summary=cls._clean_summary(item.summary),
        )

    @classmethod
    def _normalize_category(cls, category: str) -> str:
        normalized = re.sub(r"\s+", "", category.strip())
        aliases = {
            "餐饮": "饮食",
            "美食": "饮食",
            "吃喝": "饮食",
        }
        return aliases.get(normalized, normalized)

    @classmethod
    def _clean_name(cls, value: str) -> str:
        text = cls._clean_text(value)
        return text.strip(" ,.;:!?，。；：！？()（）[]【】\"'“”‘’")

    @classmethod
    def _clean_location(cls, value: str) -> str:
        text = cls._clean_text(value)
        text = text.replace(" / ", "/").replace(" - ", "-")
        return text.strip(" ,.;:!?，。；：！？")

    @classmethod
    def _clean_summary(cls, value: str) -> str:
        text = cls._clean_text(value)
        if text and text[-1] not in "。！？!?":
            text = f"{text}。"
        return text

    @staticmethod
    def _clean_keyword(value: str) -> str:
        return " ".join(value.strip().split())

    @staticmethod
    def _clean_text(value: str) -> str:
        text = value.replace("\u3000", " ").strip()
        text = text.replace("“", '"').replace("”", '"').replace("‘", "'").replace("’", "'")
        text = re.sub(r"\s+", " ", text)
        text = re.sub(r"(?<=[\u4e00-\u9fff])\s+(?=[\u4e00-\u9fff])", "", text)
        text = re.sub(r"\s+([，。！？；：、,.!?:;)）】》])", r"\1", text)
        text = re.sub(r"([（【《(])\s+", r"\1", text)
        return text.strip()

    @classmethod
    def _dedupe_key(cls, category: str, name: str, location: str) -> str:
        return "||".join(
            [
                cls._normalize_category(category),
                cls._clean_name(name).casefold(),
                cls._clean_location(location).casefold(),
            ]
        )
