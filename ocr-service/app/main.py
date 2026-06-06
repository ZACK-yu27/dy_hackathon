import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers.ocr import router as ocr_router
from app.utils.logging import configure_logging

settings = get_settings()
configure_logging(settings.log_level)
logger = logging.getLogger(__name__)

app = FastAPI(title=settings.app_name, version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(ocr_router)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": settings.app_name,
        "port": settings.app_port,
        "lang": settings.model_lang,
    }


@app.on_event("startup")
def on_startup() -> None:
    logger.info("OCR service started on port %s", settings.app_port)
