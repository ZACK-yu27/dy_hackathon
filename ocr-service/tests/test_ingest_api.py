from __future__ import annotations

from datetime import datetime

from fastapi.testclient import TestClient

from app.database import get_db_session
from app.main import app
from app.routers import ingest as ingest_router
from app.schemas import StructuredItemRecord, UploadIngestResponse


def _override_db():
    yield object()


app.dependency_overrides[get_db_session] = _override_db
client = TestClient(app)


def test_upload_endpoint_returns_structured_payload(monkeypatch):
    def fake_ingest_file(**kwargs):
        return UploadIngestResponse(
            status="success",
            file_name=kwargs["file_name"],
            file_type=kwargs["file_type"],
            extracted_text="上海外滩夜景很美。",
            item_count=1,
            items=[
                StructuredItemRecord(
                    id=1,
                    category="景点",
                    name="外滩",
                    location="上海市黄浦区中山东一路",
                    summary="外滩适合城市漫步和夜景打卡，黄浦江沿岸景观是最大亮点。",
                    created_at=datetime(2026, 1, 1, 12, 0, 0),
                    updated_at=datetime(2026, 1, 1, 12, 0, 0),
                )
            ],
        )

    monkeypatch.setattr(ingest_router.service, "ingest_file", fake_ingest_file)
    response = client.post(
        "/ingest/upload",
        files={"file": ("travel.png", b"fake-image", "image/png")},
        data={"context_text": "这是上海旅游攻略"},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "success"
    assert payload["item_count"] == 1
    assert payload["items"][0]["category"] == "景点"
    assert payload["items"][0]["name"] == "外滩"


def test_list_endpoint_returns_items(monkeypatch):
    monkeypatch.setattr(
        ingest_router.service,
        "list_items",
        lambda **kwargs: [
            StructuredItemRecord(
                id=1,
                category="饮食",
                name="阿大葱油饼",
                location="上海市黄浦区瑞金二路附近",
                summary="阿大葱油饼以现做现卖和酥脆口感见长，适合街头小吃打卡。",
                created_at=datetime(2026, 1, 1, 12, 0, 0),
                updated_at=datetime(2026, 1, 1, 12, 0, 0),
            )
        ],
    )

    response = client.get("/ingest/items?limit=10")

    assert response.status_code == 200
    payload = response.json()
    assert payload["total"] == 1
    assert payload["items"][0]["category"] == "饮食"
