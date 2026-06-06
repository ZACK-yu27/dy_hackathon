from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "OCR Service"
    app_host: str = "0.0.0.0"
    app_port: int = 8011
    cors_origins: list[str] = ["*"]
    log_level: str = "INFO"
    tesseract_cmd: str = r"D:\software\Tesseract-OCR\tesseract.exe"
    tessdata_prefix: str = r"D:\software\Tesseract-OCR\tessdata"
    model_lang: str = "chi_sim+eng"
    tesseract_config: str = "--oem 1 --psm 3"
    test_output_dir: str = "./artifacts/test_output"

    model_config = SettingsConfigDict(
        env_prefix="OCR_",
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
