from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, field_validator

ALLOWED_CATEGORIES = {"景点", "饮食", "交通", "住宿"}


class StructuredItemInput(BaseModel):
    category: str
    name: str
    location: str
    summary: str

    @field_validator("category")
    @classmethod
    def validate_category(cls, value: str) -> str:
        normalized = value.strip()
        if normalized not in ALLOWED_CATEGORIES:
            raise ValueError(f"Invalid category: {value}")
        return normalized

    @field_validator("name", "location", "summary")
    @classmethod
    def validate_text_fields(cls, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise ValueError("Field cannot be empty.")
        return normalized


class StructuredItemRecord(StructuredItemInput):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class WarningSourceSeed(BaseModel):
    source_id: str
    category: str
    name: str
    city: str = ""
    area: str = ""
    title: str = ""
    summary: str
    avoid_reasons: list[str] = Field(default_factory=list)
    recommend_reasons: list[str] = Field(default_factory=list)
    execution_tips: list[str] = Field(default_factory=list)
    alternatives: list[str] = Field(default_factory=list)
    confirm_before_go: list[str] = Field(default_factory=list)
    budget_info: str = ""
    traffic_info: str = ""
    subcategory: str = ""
    evidence: str = ""
    source_platform: str = ""
    source_keyword: str = ""
    source_url: str = ""
    source_type: str = ""
    confidence: str = ""
    source_summary: str = ""
    evidence_count: int = 0


class WarningRecord(BaseModel):
    id: int
    structured_item_id: int
    warning_source_id: int
    category: str
    name: str
    location: str
    summary: str
    warning_summary: str
    avoid_reasons: list[str] = Field(default_factory=list)
    execution_tips: list[str] = Field(default_factory=list)
    alternatives: list[str] = Field(default_factory=list)
    confirm_before_go: list[str] = Field(default_factory=list)
    matched_by: str
    created_at: datetime
    updated_at: datetime


class KimiExtractionResult(BaseModel):
    extracted_text: str
    file_id: str | None = None


class UploadIngestResponse(BaseModel):
    status: Literal["success"]
    file_name: str
    file_type: Literal["image", "pdf"]
    extracted_text: str
    item_count: int
    saved_count: int
    deduplicated_count: int
    items: list[StructuredItemRecord] = Field(default_factory=list)
    warning_count: int = 0
    warning_saved_count: int = 0
    warnings: list[WarningRecord] = Field(default_factory=list)


class ListStructuredItemsResponse(BaseModel):
    total: int
    items: list[StructuredItemRecord] = Field(default_factory=list)


class ListWarningsResponse(BaseModel):
    total: int
    items: list[WarningRecord] = Field(default_factory=list)
