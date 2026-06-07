from __future__ import annotations

import json
import sys
import time
from pathlib import Path

from fastapi.testclient import TestClient

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app.main import app

ASSET_DIR = ROOT / "tests" / "assets"
OUTPUT_DIR = ROOT / "artifacts" / "test_output"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def run_single(client: TestClient, path: Path, content_type: str) -> dict:
    started = time.perf_counter()
    with path.open("rb") as handle:
        response = client.post(
            "/ocr/parse",
            files={"file": (path.name, handle, content_type)},
        )
    elapsed_ms = int((time.perf_counter() - started) * 1000)
    payload = response.json()
    payload["http_status"] = response.status_code
    payload["request_elapsed_ms"] = elapsed_ms
    return payload


def contains_expected_text(text: str, expectations: list[str]) -> tuple[int, list[str]]:
    normalized_text = "".join(text.lower().split())
    hits = [item for item in expectations if "".join(item.lower().split()) in normalized_text]
    return len(hits), hits


def main() -> None:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    client = TestClient(app)

    printed_image_result = run_single(client, ASSET_DIR / "printed_text.png", "image/png")
    printed_pdf_result = run_single(client, ASSET_DIR / "printed_text.pdf", "application/pdf")
    complex_image_result = run_single(client, ASSET_DIR / "mixed_layout.png", "image/png")
    complex_pdf_result = run_single(client, ASSET_DIR / "mixed_layout.pdf", "application/pdf")

    printed_expectations = [
        "上海 Shanghai",
        "外滩 The Bund",
        "The Bund",
        "Metro Line 2",
        "People Square Business Hotel",
        "Crab Soup Dumpling",
        "RMB 120 per person",
        "Avoid weekend crowd",
    ]
    complex_expectations = [
        "The Bund",
        "Metro Line 2",
        "People Square Business Hotel",
        "crab soup dumpling",
        "中文 + English",
    ]

    printed_text = "\n".join(
        page["text"]
        for item in [printed_image_result, printed_pdf_result]
        for page in item.get("pages", [])
    )
    complex_text = "\n".join(
        page["text"]
        for item in [complex_image_result, complex_pdf_result]
        for page in item.get("pages", [])
    )

    printed_hit_count, printed_hits = contains_expected_text(printed_text, printed_expectations)
    complex_hit_count, complex_hits = contains_expected_text(complex_text, complex_expectations)
    printed_accuracy = round(printed_hit_count / len(printed_expectations) * 100, 2)
    complex_accuracy = round(complex_hit_count / len(complex_expectations) * 100, 2)

    report = {
        "printed_text_image_result": printed_image_result,
        "printed_text_pdf_result": printed_pdf_result,
        "complex_layout_image_result": complex_image_result,
        "complex_layout_pdf_result": complex_pdf_result,
        "printed_text_expected_terms": printed_expectations,
        "printed_text_matched_terms": printed_hits,
        "printed_text_matched_count": printed_hit_count,
        "printed_text_expected_count": len(printed_expectations),
        "printed_text_accuracy_percent": printed_accuracy,
        "complex_layout_expected_terms": complex_expectations,
        "complex_layout_matched_terms": complex_hits,
        "complex_layout_matched_count": complex_hit_count,
        "complex_layout_expected_count": len(complex_expectations),
        "complex_layout_match_rate_percent": complex_accuracy,
        "printed_text_passed": printed_accuracy >= 95.0,
    }

    report_path = OUTPUT_DIR / "verification_report.json"
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(
        json.dumps(
            {
                "printed_text_accuracy_percent": printed_accuracy,
                "complex_layout_match_rate_percent": complex_accuracy,
                "printed_text_passed": printed_accuracy >= 95.0,
                "report_path": str(report_path),
            },
            ensure_ascii=False,
            indent=2,
        )
    )
    print(f"Saved report to: {report_path}")


if __name__ == "__main__":
    main()
