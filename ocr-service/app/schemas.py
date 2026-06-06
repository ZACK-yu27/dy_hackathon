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


class KimiExtractionResult(BaseModel):
    extracted_text: str
    file_id: str | None = None


class UploadIngestResponse(BaseModel):
    status: Literal["success"]
    file_name: str
    file_type: Literal["image", "pdf"]
    extracted_text: str
    item_count: int
    items: list[StructuredItemRecord] = Field(default_factory=list)


class ListStructuredItemsResponse(BaseModel):
    total: int
    items: list[StructuredItemRecord] = Field(default_factory=list)
