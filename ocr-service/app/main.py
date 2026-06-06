import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import create_tables
from app.models import TravelStructuredItem  # noqa: F401
from app.routers.ingest import router as ingest_router
from app.utils.logging import configure_logging

settings = get_settings()
configure_logging(settings.log_level)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_: FastAPI):
    if settings.database_url:
        create_tables()
        logger.info("MySQL tables are ready.")
    else:
        logger.warning("OCR_DATABASE_URL is not configured; ingest endpoints will fail until it is set.")
    logger.info("Ingestion service started on port %s", settings.app_port)
    yield


app = FastAPI(title=settings.app_name, version="0.1.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(ingest_router)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": settings.app_name,
        "port": settings.app_port,
        "extraction_backend": "local_tesseract",
        "ocr_language": settings.ocr_language,
        "structuring_model": settings.deepseek_model,
        "database_configured": bool(settings.database_url),
    }
