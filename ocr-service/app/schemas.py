from typing import Literal

from pydantic import BaseModel, Field


class OCRLine(BaseModel):
    text: str
    score: float | None = None
    bbox: list[list[float]] = Field(default_factory=list)


class OCRPage(BaseModel):
    page_number: int
    text: str
    lines: list[OCRLine] = Field(default_factory=list)


class OCRResult(BaseModel):
    status: Literal["success", "partial_success", "failed"]
    file_name: str
    file_type: Literal["image", "pdf"]
    language: str
    elapsed_ms: int
    page_count: int
    pages: list[OCRPage] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)


class BatchOCRResult(BaseModel):
    status: Literal["success", "partial_success", "failed"]
    total_files: int
    success_count: int
    failure_count: int
    elapsed_ms: int
    results: list[OCRResult] = Field(default_factory=list)
