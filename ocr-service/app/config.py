from __future__ import annotations

import re
from functools import lru_cache
from pathlib import Path

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


def _load_kimi_defaults(api_keys_path: Path) -> dict[str, str]:
    if not api_keys_path.exists():
        return {}

    content = api_keys_path.read_text(encoding="utf-8")
    kimi_match = re.search(
        r"#\s*KIMI Code\s+API Key:(?P<key>\S+)\s+base URL:\s*(?P<base>\S+)\s+model:\s*(?P<model>\S+)",
        content,
        re.IGNORECASE,
    )
    if not kimi_match:
        return {}
    return {
        "kimi_api_key": kimi_match.group("key").strip(),
        "kimi_base_url": kimi_match.group("base").strip(),
        "kimi_model": kimi_match.group("model").strip(),
    }


def _load_deepseek_defaults(api_keys_path: Path) -> dict[str, str]:
    if not api_keys_path.exists():
        return {}

    content = api_keys_path.read_text(encoding="utf-8")
    deepseek_match = re.search(
        r"#\s*Deepseek\s+API Key:(?P<key>\S+)\s+base URL:\s*(?P<base>\S+)\s+model:\s*(?P<model>\S+)",
        content,
        re.IGNORECASE,
    )
    if not deepseek_match:
        return {}
    return {
        "deepseek_api_key": deepseek_match.group("key").strip(),
        "deepseek_base_url": deepseek_match.group("base").strip(),
        "deepseek_model": deepseek_match.group("model").strip(),
    }


class Settings(BaseSettings):
    app_name: str = "Travel Structured Ingestion Service"
    app_host: str = "0.0.0.0"
    app_port: int = 8011
    cors_origins: list[str] = ["*"]
    log_level: str = "INFO"
    api_keys_file: str = str(Path(__file__).resolve().parents[2] / "API_keys.md")
    kimi_api_key: str = ""
    kimi_base_url: str = "https://api.kimi.com/coding/v1"
    kimi_file_base_url: str = "https://api.moonshot.cn/v1"
    kimi_model: str = "kimi-for-coding"
    deepseek_api_key: str = ""
    deepseek_base_url: str = "https://api.deepseek.com"
    deepseek_model: str = "deepseek-v4-flash"
    tesseract_cmd: str = r"D:\software\Tesseract-OCR\tesseract.exe"
    tessdata_prefix: str = r"D:\software\Tesseract-OCR\tessdata"
    ocr_language: str = "chi_sim+eng"
    tesseract_config: str = "--oem 3 --psm 6"
    database_url: str = ""
    database_echo: bool = False
    upload_dir: str = "./artifacts/uploads"
    max_upload_mb: int = 50

    model_config = SettingsConfigDict(
        env_prefix="OCR_",
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @model_validator(mode="after")
    def apply_kimi_defaults(self) -> "Settings":
        kimi_defaults = _load_kimi_defaults(Path(self.api_keys_file))
        deepseek_defaults = _load_deepseek_defaults(Path(self.api_keys_file))
        if not self.kimi_api_key:
            self.kimi_api_key = kimi_defaults.get("kimi_api_key", "")
        if not self.kimi_base_url:
            self.kimi_base_url = kimi_defaults.get("kimi_base_url", "https://api.kimi.com/coding/v1")
        if not self.kimi_model:
            self.kimi_model = kimi_defaults.get("kimi_model", "kimi-for-coding")
        if not self.deepseek_api_key:
            self.deepseek_api_key = deepseek_defaults.get("deepseek_api_key", "")
        if not self.deepseek_base_url:
            self.deepseek_base_url = deepseek_defaults.get("deepseek_base_url", "https://api.deepseek.com")
        if not self.deepseek_model:
            self.deepseek_model = deepseek_defaults.get("deepseek_model", "deepseek-v4-flash")
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
