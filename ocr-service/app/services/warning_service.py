from __future__ import annotations

import json
import re
from pathlib import Path

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models import TravelStructuredItem, TravelWarningItem, TravelWarningSource
from app.schemas import StructuredItemRecord, WarningRecord, WarningSourceSeed


class WarningService:
    def __init__(self) -> None:
        self.seed_file_path = Path(__file__).resolve().parents[1] / "data" / "warning_sources_seed.json"

    def seed_sources(self, db: Session) -> int:
        if not self.seed_file_path.exists():
            return 0

        payload = json.loads(self.seed_file_path.read_text(encoding="utf-8"))
        seeds = [WarningSourceSeed.model_validate(item) for item in payload]
        existing_records = {
            record.source_id: record
            for record in db.query(TravelWarningSource).all()
        }
        created = 0

        for seed in seeds:
            record = existing_records.get(seed.source_id)
            if record is None:
                record = TravelWarningSource(source_id=seed.source_id)
                db.add(record)
                created += 1

            record.category = seed.category
            record.name = seed.name
            record.city = seed.city
            record.area = seed.area
            record.title = seed.title
            record.summary = seed.summary
            record.avoid_reasons = self._dump_list(seed.avoid_reasons)
            record.recommend_reasons = self._dump_list(seed.recommend_reasons)
            record.execution_tips = self._dump_list(seed.execution_tips)
            record.alternatives = self._dump_list(seed.alternatives)
            record.confirm_before_go = self._dump_list(seed.confirm_before_go)
            record.budget_info = seed.budget_info
            record.traffic_info = seed.traffic_info
            record.subcategory = seed.subcategory
            record.evidence = seed.evidence
            record.source_platform = seed.source_platform
            record.source_keyword = seed.source_keyword
            record.source_url = seed.source_url
            record.source_type = seed.source_type
            record.confidence = seed.confidence
            record.source_summary = seed.source_summary
            record.evidence_count = seed.evidence_count

        if seeds:
            db.commit()
        return created

    def match_and_persist(
        self,
        *,
        db: Session,
        items: list[StructuredItemRecord],
    ) -> tuple[list[WarningRecord], int]:
        if not items:
            return [], 0

        normalized_items: dict[tuple[str, str], list[StructuredItemRecord]] = {}
        for item in items:
            key = (self._normalize_category(item.category), self._normalize_name(item.name))
            normalized_items.setdefault(key, []).append(item)

        names = sorted({item.name for item in items if item.name})
        categories = sorted({self._normalize_category(item.category) for item in items if item.category})
        sources = (
            db.query(TravelWarningSource)
            .filter(TravelWarningSource.name.in_(names))
            .filter(TravelWarningSource.category.in_(categories))
            .all()
        )
        if not sources:
            return [], 0

        matched_pairs: dict[tuple[int, int], tuple[StructuredItemRecord, TravelWarningSource]] = {}
        for source in sources:
            key = (self._normalize_category(source.category), self._normalize_name(source.name))
            for item in normalized_items.get(key, []):
                matched_pairs[(item.id, source.id)] = (item, source)

        if not matched_pairs:
            return [], 0

        structured_item_ids = sorted({item_id for item_id, _ in matched_pairs})
        warning_source_ids = sorted({source_id for _, source_id in matched_pairs})
        existing_records = (
            db.query(TravelWarningItem)
            .filter(TravelWarningItem.structured_item_id.in_(structured_item_ids))
            .filter(TravelWarningItem.warning_source_id.in_(warning_source_ids))
            .all()
        )
        existing_keys = {(record.structured_item_id, record.warning_source_id) for record in existing_records}
        created_records: list[TravelWarningItem] = []

        for pair, (item, source) in matched_pairs.items():
            if pair in existing_keys:
                continue
            record = TravelWarningItem(
                structured_item_id=item.id,
                warning_source_id=source.id,
                category=item.category,
                name=item.name,
                location=item.location,
                summary=item.summary,
                warning_summary=self._compose_warning_summary(source),
                avoid_reasons=source.avoid_reasons,
                execution_tips=source.execution_tips,
                alternatives=source.alternatives,
                confirm_before_go=source.confirm_before_go,
                matched_by="category+name",
            )
            db.add(record)
            created_records.append(record)

        if created_records:
            db.commit()
            for record in created_records:
                db.refresh(record)

        all_records = existing_records + created_records
        all_records.sort(key=lambda record: record.id)
        return [self._to_warning_record(record) for record in all_records], len(created_records)

    def list_warnings(
        self,
        *,
        db: Session,
        limit: int = 100,
        category: str | None = None,
        keyword: str | None = None,
    ) -> list[WarningRecord]:
        query = db.query(TravelWarningItem)
        if category:
            query = query.filter(TravelWarningItem.category == self._normalize_category(category))
        if keyword:
            normalized_keyword = self._clean_keyword(keyword)
            like_term = f"%{normalized_keyword}%"
            query = query.filter(
                or_(
                    TravelWarningItem.name.ilike(like_term),
                    TravelWarningItem.location.ilike(like_term),
                    TravelWarningItem.summary.ilike(like_term),
                    TravelWarningItem.warning_summary.ilike(like_term),
                )
            )

        records = query.order_by(TravelWarningItem.id.desc()).limit(limit).all()
        return [self._to_warning_record(record) for record in records]

    def export_warnings(
        self,
        *,
        db: Session,
        limit: int = 1000,
        category: str | None = None,
        keyword: str | None = None,
    ) -> list[WarningRecord]:
        return self.list_warnings(
            db=db,
            limit=limit,
            category=category,
            keyword=keyword,
        )

    def hydrate_records_for_items(
        self,
        *,
        db: Session,
        items: list[StructuredItemRecord],
    ) -> list[StructuredItemRecord]:
        if not items:
            return []

        keys = {(self._normalize_category(item.category), self._normalize_name(item.name), self._normalize_location(item.location)) for item in items}
        records = (
            db.query(TravelStructuredItem)
            .filter(TravelStructuredItem.name.in_([item.name for item in items]))
            .filter(TravelStructuredItem.category.in_([item.category for item in items]))
            .all()
        )

        hydrated: list[StructuredItemRecord] = []
        for record in records:
            key = (
                self._normalize_category(record.category),
                self._normalize_name(record.name),
                self._normalize_location(record.location),
            )
            if key in keys:
                hydrated.append(StructuredItemRecord.model_validate(record))
        return hydrated

    @staticmethod
    def _compose_warning_summary(source: TravelWarningSource) -> str:
        snippets = WarningService._load_list(source.avoid_reasons)
        reason = snippets[0] if snippets else ""
        if reason:
            return f"{source.name}已命中避雷库：{reason}"
        return f"{source.name}已命中避雷库，建议出行前核实排队、人流、交通和近期评价。"

    @staticmethod
    def _to_warning_record(record: TravelWarningItem) -> WarningRecord:
        return WarningRecord(
            id=record.id,
            structured_item_id=record.structured_item_id,
            warning_source_id=record.warning_source_id,
            category=record.category,
            name=record.name,
            location=record.location,
            summary=record.summary,
            warning_summary=record.warning_summary,
            avoid_reasons=WarningService._load_list(record.avoid_reasons),
            execution_tips=WarningService._load_list(record.execution_tips),
            alternatives=WarningService._load_list(record.alternatives),
            confirm_before_go=WarningService._load_list(record.confirm_before_go),
            matched_by=record.matched_by,
            created_at=record.created_at,
            updated_at=record.updated_at,
        )

    @staticmethod
    def _dump_list(values: list[str]) -> str:
        return json.dumps(values, ensure_ascii=False)

    @staticmethod
    def _load_list(raw_value: str) -> list[str]:
        try:
            payload = json.loads(raw_value or "[]")
        except json.JSONDecodeError:
            return []
        return [str(item).strip() for item in payload if str(item).strip()]

    @staticmethod
    def _normalize_category(value: str) -> str:
        return re.sub(r"\s+", "", value.strip())

    @staticmethod
    def _normalize_name(value: str) -> str:
        return re.sub(r"\s+", "", value.strip()).casefold()

    @staticmethod
    def _normalize_location(value: str) -> str:
        return re.sub(r"\s+", "", value.strip()).casefold()

    @staticmethod
    def _clean_keyword(value: str) -> str:
        return " ".join(value.strip().split())
