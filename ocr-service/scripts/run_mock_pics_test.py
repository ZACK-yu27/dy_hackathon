from __future__ import annotations

import json
import mimetypes
import sys
from datetime import datetime
from pathlib import Path
from time import perf_counter

import httpx
from sqlalchemy import text

from app.database import get_engine


ROOT = Path(__file__).resolve().parents[2]
MOCK_PICS_DIR = ROOT / "mock_pics"
OUTPUT_DIR = ROOT / "ocr-service" / "artifacts" / "test_runs"
OUTPUT_FILE = OUTPUT_DIR / "mock_pics_test_results.json"
BASE_URL = "http://127.0.0.1:8012"


def get_db_baseline() -> dict[str, int]:
    engine = get_engine()
    with engine.connect() as conn:
        row = conn.execute(
            text(
                "SELECT COALESCE(MAX(id), 0) AS max_id, COUNT(*) AS total "
                "FROM travel_structured_items"
            )
        ).mappings().first()
    return {"max_id": int(row["max_id"]), "total": int(row["total"])}


def get_new_rows(previous_max_id: int) -> list[dict]:
    engine = get_engine()
    with engine.connect() as conn:
        rows = conn.execute(
            text(
                "SELECT id, category, name, location, summary "
                "FROM travel_structured_items "
                "WHERE id > :previous_max_id "
                "ORDER BY id ASC"
            ),
            {"previous_max_id": previous_max_id},
        ).mappings().all()
    return [dict(row) for row in rows]


def upload_file(client: httpx.Client, file_path: Path) -> dict:
    content_type = mimetypes.guess_type(file_path.name)[0] or "application/octet-stream"
    started_at = datetime.now().isoformat(timespec="seconds")
    with file_path.open("rb") as file_obj:
        started = perf_counter()
        response = client.post(
            f"{BASE_URL}/ingest/upload",
            files={"file": (file_path.name, file_obj, content_type)},
        )
        elapsed_seconds = round(perf_counter() - started, 3)

    result = {
        "file_name": file_path.name,
        "started_at": started_at,
        "elapsed_seconds": elapsed_seconds,
        "status_code": response.status_code,
    }

    try:
        payload = response.json()
    except json.JSONDecodeError:
        payload = None

    if isinstance(payload, dict):
        result["response"] = payload
        result["detail"] = payload.get("detail", "")
        result["item_count"] = int(payload.get("item_count", 0) or 0)
        extracted_text = payload.get("extracted_text", "") or ""
        result["extracted_text_length"] = len(extracted_text)
        result["extracted_text_preview"] = extracted_text.replace("\r", " ").replace("\n", " ")[:120]
    else:
        result["response_text"] = response.text
        result["detail"] = response.text[:300]
        result["item_count"] = 0
        result["extracted_text_length"] = 0
        result["extracted_text_preview"] = ""

    return result


def main() -> int:
    if not MOCK_PICS_DIR.exists():
        raise SystemExit(f"Mock pics directory does not exist: {MOCK_PICS_DIR}")

    files = sorted(path for path in MOCK_PICS_DIR.iterdir() if path.is_file())
    if not files:
        raise SystemExit(f"No files found in: {MOCK_PICS_DIR}")

    before = get_db_baseline()
    health = {}
    results = []

    with httpx.Client(timeout=httpx.Timeout(180.0, connect=30.0)) as client:
        health_response = client.get(f"{BASE_URL}/health")
        health = {
            "status_code": health_response.status_code,
            "body": health_response.json() if health_response.headers.get("content-type", "").startswith("application/json") else health_response.text,
        }

        for file_path in files:
            try:
                results.append(upload_file(client, file_path))
            except Exception as exc:  # noqa: BLE001
                results.append(
                    {
                        "file_name": file_path.name,
                        "started_at": datetime.now().isoformat(timespec="seconds"),
                        "elapsed_seconds": 0,
                        "status_code": 0,
                        "detail": str(exc),
                        "item_count": 0,
                        "extracted_text_length": 0,
                        "extracted_text_preview": "",
                    }
                )

    after = get_db_baseline()
    inserted_rows = get_new_rows(before["max_id"])
    success_count = sum(1 for item in results if item["status_code"] == 200)

    report = {
        "base_url": BASE_URL,
        "health": health,
        "before_db": before,
        "after_db": after,
        "inserted_rows": inserted_rows,
        "request_count": len(results),
        "success_count": success_count,
        "failure_count": len(results) - success_count,
        "results": results,
    }

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    OUTPUT_FILE.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    json.dump(report, sys.stdout, ensure_ascii=False, indent=2)
    sys.stdout.write("\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
