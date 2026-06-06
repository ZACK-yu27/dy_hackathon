# Travel Structured Ingestion Service

本目录现提供一个面向当前工作区的 MVP 上传服务，处理链路为：

- 图片 / PDF 上传
- 本地 Tesseract 完成 OCR / 文本抽取
- DeepSeek 二次结构化生成 `类别 / 名称 / 详细地点 / 一句话描述`
- 字段清洗与入库去重
- MySQL 落库

## 技术选型

- 服务框架：FastAPI
- 文件提取 / OCR：Tesseract OCR
- 结构化抽取：DeepSeek API
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
2. 确认 `API_keys.md` 中存在可用的 DeepSeek 配置，或直接在 `.env` 中填写 `OCR_DEEPSEEK_API_KEY`
3. 确认本机已安装 Tesseract，并在 `.env` 中配置 `OCR_TESSERACT_CMD` 与 `OCR_TESSDATA_PREFIX`
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
- `POST /ingest/upload`：上传单个图片或 PDF，执行提取、结构化、字段清洗、去重和入库
- `GET /ingest/items`：查看最近入库结果，支持 `category` / `keyword` 过滤
- `GET /ingest/export`：导出查询结果，支持 `json` / `csv`

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
  "saved_count": 1,
  "deduplicated_count": 0,
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
- `OCR_DEEPSEEK_API_KEY`：若不填，服务会尝试从工作区根目录的 `API_keys.md` 自动读取
- `OCR_DEEPSEEK_BASE_URL`：默认 `https://api.deepseek.com`
- `OCR_DEEPSEEK_MODEL`：默认 `deepseek-v4-flash`
- `OCR_TESSERACT_CMD`：本地 `tesseract.exe` 路径
- `OCR_TESSDATA_PREFIX`：本地 `tessdata` 目录
- `OCR_OCR_LANGUAGE`：默认 `chi_sim+eng`
- `OCR_TESSERACT_CONFIG`：默认 `--oem 3 --psm 6`

## 注意事项

- 当前 MVP 已打通 `图片 / PDF -> 本地 OCR -> DeepSeek -> MySQL`
- 去重基于 `类别 + 名称 + 地点` 的清洗后组合键，重复记录会被跳过
- 字段清洗会自动修正常见空格噪声、标点空格和别名类别
- MySQL 未配置时，服务可以启动，但上传接口会返回配置错误
- 若要做真正的“地点补全联网检索”，还需要在后续版本补外部搜索步骤
