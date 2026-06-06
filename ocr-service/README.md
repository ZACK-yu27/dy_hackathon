# Travel Structured Ingestion Service

本目录现提供一个面向当前工作区的 MVP 上传服务，处理链路为：

- 图片 / PDF 上传
- Kimi 文件提取能力完成 OCR / 文本抽取
- Kimi 二次结构化生成 `类别 / 名称 / 详细地点 / 一句话描述`
- MySQL 落库

## 技术选型

- 服务框架：FastAPI
- 文件提取 / OCR：Kimi API
- 结构化抽取：Kimi API
- 数据库存储：MySQL
- ORM：SQLAlchemy

## 目录结构

```text
ocr-service/
├─ app/
│  ├─ main.py
│  ├─ config.py
│  ├─ database.py
│  ├─ models.py
│  ├─ schemas.py
│  ├─ routers/ingest.py
│  └─ services/
│     ├─ ingest_service.py
│     └─ kimi_client.py
├─ tests/
│  └─ test_ingest_api.py
├─ .env.example
└─ pyproject.toml
```

## 快速启动

1. 补齐 `.env` 中的 `OCR_DATABASE_URL`
2. 确认 `API_keys.md` 中存在可用的 Kimi 配置，或直接在 `.env` 中填写 `OCR_KIMI_API_KEY`
3. 安装依赖并启动服务

```powershell
cd d:\Dev\projects\dy-hackathon\ocr-service
python -m venv .venv
.\.venv\Scripts\python -m pip install -e .[dev]
Copy-Item .env.example .env
.\.venv\Scripts\python -m uvicorn app.main:app --host 0.0.0.0 --port 8011
```

## 接口

- `GET /health`：健康检查
- `POST /ingest/upload`：上传单个图片或 PDF，执行提取、结构化、入库
- `GET /ingest/items`：查看最近入库结果

## 示例请求

```bash
curl -X POST "http://127.0.0.1:8011/ingest/upload" \
  -F "file=@travel.pdf" \
  -F "context_text=这是一份上海旅游攻略"
```

## 返回结构

```json
{
  "status": "success",
  "file_name": "travel.pdf",
  "file_type": "pdf",
  "extracted_text": "...",
  "item_count": 1,
  "items": [
    {
      "id": 1,
      "category": "景点",
      "name": "外滩",
      "location": "上海市黄浦区中山东一路",
      "summary": "外滩适合城市漫步和夜景打卡，黄浦江沿岸景观是最大亮点。",
      "created_at": "2026-06-06T12:00:00",
      "updated_at": "2026-06-06T12:00:00"
    }
  ]
}
```

## 关键配置

- `OCR_DATABASE_URL`：MySQL 连接串，例如 `mysql+pymysql://root:password@127.0.0.1:3306/dy_hackathon?charset=utf8mb4`
- `OCR_KIMI_API_KEY`：若不填，服务会尝试从工作区根目录的 `API_keys.md` 自动读取
- `OCR_KIMI_BASE_URL`：默认 `https://api.kimi.com/coding/v1`
- `OCR_KIMI_MODEL`：默认 `kimi-for-coding`

## 注意事项

- 当前 MVP 只打通 `图片 / PDF -> Kimi -> MySQL`
- MySQL 未配置时，服务可以启动，但上传接口会返回配置错误
- 若要做真正的“地点补全联网检索”，还需要在后续版本补外部搜索步骤
