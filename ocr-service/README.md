# Travel Structured Ingestion Service

当前服务提供一条面向本工作区的 MVP 旅游攻略导入链路：

- 图片 / PDF 上传
- 本地 Tesseract 完成 OCR / 文本抽取
- DeepSeek 二次结构化生成 `类别 / 名称 / 详细地点 / 一句话描述`
- 字段清洗与入库去重
- warning 源表匹配与 warning 结果落库
- MySQL 查询与导出

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
│  ├─ data/
│  │  └─ warning_sources_seed.json
│  ├─ routers/
│  │  └─ ingest.py
│  └─ services/
│     ├─ ingest_service.py
│     ├─ warning_service.py
│     └─ kimi_client.py
├─ tests/
│  └─ test_ingest_api.py
├─ WARNING_API.md
├─ .env.example
└─ pyproject.toml
```

## 快速启动

1. 补齐 `.env` 中的 `OCR_DATABASE_URL`
2. 确认 `API_keys.md` 中存在可用的 DeepSeek 配置，或直接在 `.env` 中填写 `OCR_DEEPSEEK_API_KEY`
3. 确认本机已安装 Tesseract，并在 `.env` 中配置 `OCR_TESSERACT_CMD` 与 `OCR_TESSDATA_PREFIX`
4. 安装依赖并启动服务

```powershell
cd d:\Dev\projects\dy-hackathon\ocr-service
python -m venv .venv
.\.venv\Scripts\python -m pip install -e .[dev]
Copy-Item .env.example .env
.\.venv\Scripts\python -m uvicorn app.main:app --host 0.0.0.0 --port 8011
```

## 接口

- `GET /health`：健康检查
- `POST /ingest/upload`：上传单个图片或 PDF，执行 OCR、结构化、清洗、去重、warning 匹配和入库
- `GET /ingest/items`：查看结构化结果，支持 `category` / `keyword`
- `GET /ingest/export`：导出结构化结果，支持 `json` / `csv`
- `GET /ingest/warnings`：查看 warning 结果，支持 `category` / `keyword`
- `GET /ingest/export-warnings`：导出 warning 结果，支持 `json` / `csv`

## 上传返回结构

```json
{
  "status": "success",
  "file_name": "travel.pdf",
  "file_type": "pdf",
  "extracted_text": "...",
  "item_count": 1,
  "saved_count": 1,
  "deduplicated_count": 0,
  "warning_count": 1,
  "warning_saved_count": 1,
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
  ],
  "warnings": [
    {
      "id": 1,
      "structured_item_id": 1,
      "warning_source_id": 10,
      "category": "景点",
      "name": "灵隐寺",
      "location": "杭州市西湖区灵隐路",
      "summary": "灵隐寺是杭州热门景点之一。",
      "warning_summary": "灵隐寺已命中避雷库，建议出行前核实人流、交通和近期评价。",
      "avoid_reasons": ["热门时段排队较久"],
      "execution_tips": ["尽量工作日早到"],
      "alternatives": ["可改去附近冷门寺院"],
      "confirm_before_go": ["是否限流"],
      "matched_by": "category+name",
      "created_at": "2026-06-06T12:00:00",
      "updated_at": "2026-06-06T12:00:00"
    }
  ]
}
```

## 关键配置

- `OCR_DATABASE_URL`：MySQL 连接串
- `OCR_DEEPSEEK_API_KEY`：若不填，服务会尝试从根目录 `API_keys.md` 自动读取
- `OCR_DEEPSEEK_BASE_URL`：默认 `https://api.deepseek.com`
- `OCR_DEEPSEEK_MODEL`：默认 `deepseek-v4-flash`
- `OCR_TESSERACT_CMD`：本地 `tesseract.exe` 路径
- `OCR_TESSDATA_PREFIX`：本地 `tessdata` 目录
- `OCR_OCR_LANGUAGE`：默认 `chi_sim+eng`
- `OCR_TESSERACT_CONFIG`：默认 `--oem 3 --psm 6`

## 注意事项

- 当前 MVP 已打通 `图片 / PDF -> 本地 OCR -> DeepSeek -> MySQL -> warning 匹配`
- 去重基于 `类别 + 名称 + 地点` 的清洗后组合键
- warning 命中基于 `类别 + 名称`
- 启动时会自动同步 `app/data/warning_sources_seed.json` 到 warning 源表
- MySQL 未配置时，服务可以启动，但上传接口会返回配置错误
- PowerShell 控制台可能出现中文显示乱码，这不代表数据库实际存储乱码
