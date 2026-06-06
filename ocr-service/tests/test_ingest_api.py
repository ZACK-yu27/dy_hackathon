from __future__ import annotations

from datetime import datetime

from fastapi.testclient import TestClient

from app.database import get_db_session
from app.main import app
from app.routers import ingest as ingest_router
from app.schemas import StructuredItemInput, StructuredItemRecord, UploadIngestResponse
from app.services.ingest_service import IngestService


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
            saved_count=1,
            deduplicated_count=0,
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
    assert payload["saved_count"] == 1
    assert payload["deduplicated_count"] == 0
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


def test_export_endpoint_returns_json(monkeypatch):
    monkeypatch.setattr(
        ingest_router.service,
        "export_items",
        lambda **kwargs: [
            StructuredItemRecord(
                id=9,
                category="住宿",
                name="外滩酒店",
                location="上海市黄浦区",
                summary="外滩酒店临近核心景点，适合城市观光住宿。",
                created_at=datetime(2026, 1, 1, 12, 0, 0),
                updated_at=datetime(2026, 1, 1, 12, 0, 0),
            )
        ],
    )

    response = client.get("/ingest/export?format=json&category=住宿&keyword=外滩")

    assert response.status_code == 200
    payload = response.json()
    assert payload["total"] == 1
    assert payload["items"][0]["name"] == "外滩酒店"


def test_export_endpoint_returns_csv(monkeypatch):
    monkeypatch.setattr(
        ingest_router.service,
        "export_items",
        lambda **kwargs: [
            StructuredItemRecord(
                id=10,
                category="交通",
                name="广州塔地铁站",
                location="广州市海珠区",
                summary="广州塔地铁站可便捷前往广州塔和珠江夜游码头。",
                created_at=datetime(2026, 1, 1, 12, 0, 0),
                updated_at=datetime(2026, 1, 1, 12, 0, 0),
            )
        ],
    )

    response = client.get("/ingest/export?format=csv")

    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/csv")
    assert "广州塔地铁站" in response.text


def test_clean_item_and_dedupe_key_normalize_text():
    cleaned = IngestService._clean_item(
        StructuredItemInput.model_construct(
            category=" 餐 饮 ",
            name=' " 陈 家 祠 " ',
            location=" 广 州 市 / 荔 湾 区 ",
            summary=" 适 合 打 卡 的 岭 南 建 筑 代 表 ",
        )
    )

    assert cleaned.category == "饮食"
    assert cleaned.name == "陈家祠"
    assert cleaned.location == "广州市/荔湾区"
    assert cleaned.summary == "适合打卡的岭南建筑代表。"
    assert (
        IngestService._dedupe_key("景点", " 陈 家 祠 ", "广州 市 荔湾区")
        == IngestService._dedupe_key("景点", "陈家祠", "广州市荔湾区")
    )
