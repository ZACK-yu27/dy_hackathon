from __future__ import annotations

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, declarative_base, sessionmaker

from app.config import get_settings

Base = declarative_base()

_engine: Engine | None = None
_session_factory: sessionmaker[Session] | None = None


def get_engine() -> Engine:
    global _engine, _session_factory
    settings = get_settings()
    if not settings.database_url:
        raise RuntimeError("OCR_DATABASE_URL is not configured.")
    if _engine is None:
        _engine = create_engine(
            settings.database_url,
            echo=settings.database_echo,
            pool_pre_ping=True,
        )
        _session_factory = sessionmaker(bind=_engine, autoflush=False, autocommit=False)
    return _engine


def create_tables() -> None:
    engine = get_engine()
    Base.metadata.create_all(bind=engine)


def create_db_session() -> Session:
    global _session_factory
    if _session_factory is None:
        get_engine()
    assert _session_factory is not None
    return _session_factory()


def get_db_session() -> Generator[Session, None, None]:
    session = create_db_session()
    try:
        yield session
    finally:
        session.close()
