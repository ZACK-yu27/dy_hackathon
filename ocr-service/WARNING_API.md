# Warning 功能接口说明

## 1. 功能说明

当前 warning 能力用于在结构化结果入库后，基于 `category + name` 命中本地避雷源表，并生成独立的 warning 结果记录。

当前涉及两类表：

- `travel_warning_sources`：避雷源表
- `travel_warning_items`：warning 结果表

warning 源数据来自：

- `app/data/warning_sources_seed.json`

服务启动时会自动同步这份种子文件到 `travel_warning_sources`。

---

## 2. 上传接口中的 warning 字段

### 2.1 请求

```http
POST /ingest/upload
Content-Type: multipart/form-data
```

### 2.2 返回新增字段

```json
{
  "warning_count": 1,
  "warning_saved_count": 1,
  "warnings": []
}
```

字段说明：

- `warning_count`：本次上传对应结构化结果中命中的 warning 总数
- `warning_saved_count`：本次新写入 `travel_warning_items` 的数量
- `warnings`：本次命中的 warning 结果列表

---

## 3. 查询 warning 结果

### 3.1 接口

```http
GET /ingest/warnings
```

### 3.2 Query 参数

- `limit`：默认 `100`，范围 `1-500`
- `category`：可选，值为 `景点/饮食/交通/住宿`
- `keyword`：可选，模糊匹配 `name/location/summary/warning_summary`

### 3.3 返回示例

```json
{
  "total": 1,
  "items": [
    {
      "id": 1,
      "structured_item_id": 112,
      "warning_source_id": 12,
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
      "created_at": "2026-06-06T22:55:13",
      "updated_at": "2026-06-06T22:55:13"
    }
  ]
}
```

---

## 4. 导出 warning 结果

### 4.1 JSON 导出

```http
GET /ingest/export-warnings?format=json&limit=100
```

### 4.2 CSV 导出

```http
GET /ingest/export-warnings?format=csv&limit=100
```

### 4.3 可用筛选参数

- `limit`
- `category`
- `keyword`

导出时会沿用当前筛选条件。

---

## 5. 命中规则

当前 warning 命中规则：

- 先拿结构化结果中的 `category`
- 再拿结构化结果中的 `name`
- 以 `category + name` 到 `travel_warning_sources` 中精确匹配

注意：

- 当前不是模糊语义匹配
- 同义词、别名、简称可能无法命中
- 若后续需要更强召回，需要新增别名表或语义匹配层

---

## 6. 前端接入建议

前端应至少处理以下场景：

1. 上传结果页显示 `warning_count` 与 `warning_saved_count`
2. 上传结果页展示 `warnings` 列表
3. 历史页支持切换“结构化结果 / warning 结果”
4. warning 列表支持分类筛选与关键词搜索
5. warning 支持 JSON / CSV 导出

---

## 7. 关键代码

- [main.py](file:///d:/Dev/projects/dy-hackathon/ocr-service/app/main.py)
- [ingest.py](file:///d:/Dev/projects/dy-hackathon/ocr-service/app/routers/ingest.py)
- [ingest_service.py](file:///d:/Dev/projects/dy-hackathon/ocr-service/app/services/ingest_service.py)
- [warning_service.py](file:///d:/Dev/projects/dy-hackathon/ocr-service/app/services/warning_service.py)
- [models.py](file:///d:/Dev/projects/dy-hackathon/ocr-service/app/models.py)
- [schemas.py](file:///d:/Dev/projects/dy-hackathon/ocr-service/app/schemas.py)
- [warning_sources_seed.json](file:///d:/Dev/projects/dy-hackathon/ocr-service/app/data/warning_sources_seed.json)
