from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class TravelStructuredItem(Base):
    __tablename__ = "travel_structured_items"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    category: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    location: Mapped[str] = mapped_column(String(500), nullable=False, index=True)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )


class TravelWarningSource(Base):
    __tablename__ = "travel_warning_sources"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    source_id: Mapped[str] = mapped_column(String(100), nullable=False, unique=True, index=True)
    category: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    city: Mapped[str] = mapped_column(String(100), nullable=False, default="")
    area: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    title: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    avoid_reasons: Mapped[str] = mapped_column(Text, nullable=False, default="[]")
    recommend_reasons: Mapped[str] = mapped_column(Text, nullable=False, default="[]")
    execution_tips: Mapped[str] = mapped_column(Text, nullable=False, default="[]")
    alternatives: Mapped[str] = mapped_column(Text, nullable=False, default="[]")
    confirm_before_go: Mapped[str] = mapped_column(Text, nullable=False, default="[]")
    budget_info: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    traffic_info: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    subcategory: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    evidence: Mapped[str] = mapped_column(Text, nullable=False, default="")
    source_platform: Mapped[str] = mapped_column(String(50), nullable=False, default="")
    source_keyword: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    source_url: Mapped[str] = mapped_column(String(1000), nullable=False, default="")
    source_type: Mapped[str] = mapped_column(String(100), nullable=False, default="")
    confidence: Mapped[str] = mapped_column(String(50), nullable=False, default="")
    source_summary: Mapped[str] = mapped_column(Text, nullable=False, default="")
    evidence_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )


class TravelWarningItem(Base):
    __tablename__ = "travel_warning_items"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    structured_item_id: Mapped[int] = mapped_column(
        ForeignKey("travel_structured_items.id"),
        nullable=False,
        index=True,
    )
    warning_source_id: Mapped[int] = mapped_column(
        ForeignKey("travel_warning_sources.id"),
        nullable=False,
        index=True,
    )
    category: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    location: Mapped[str] = mapped_column(String(500), nullable=False, default="")
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    warning_summary: Mapped[str] = mapped_column(Text, nullable=False)
    avoid_reasons: Mapped[str] = mapped_column(Text, nullable=False, default="[]")
    execution_tips: Mapped[str] = mapped_column(Text, nullable=False, default="[]")
    alternatives: Mapped[str] = mapped_column(Text, nullable=False, default="[]")
    confirm_before_go: Mapped[str] = mapped_column(Text, nullable=False, default="[]")
    matched_by: Mapped[str] = mapped_column(String(50), nullable=False, default="name")
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )
