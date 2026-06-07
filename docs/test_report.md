# OCR Service 实测报告

## 1. 目标

按“方案二”将链路改为：

`图片/PDF -> 本地 Tesseract OCR -> DeepSeek 结构化 -> MySQL`

并使用 `d:\Dev\projects\dy-hackathon\mock_pics\` 下的 9 张图片做真实上传测试，记录运行结果并验证是否成功入库。

## 2. 最终方案

本轮最终采用如下实现：

1. 文件文本提取：本地 `Tesseract OCR`
2. 结构化抽取：`DeepSeek API`
3. 存储：`MySQL`
4. 服务：`FastAPI`

核心代码调整：

- `d:\Dev\projects\dy-hackathon\ocr-service\app\services\kimi_client.py`
  - `extract_file_text()` 改为本地 OCR，不再调用 Kimi 文件接口
  - `structure_text()` 改为调用 DeepSeek `chat/completions`
- `d:\Dev\projects\dy-hackathon\ocr-service\app\config.py`
  - 增加 DeepSeek、本地 Tesseract 配置
- `d:\Dev\projects\dy-hackathon\ocr-service\app\main.py`
  - 健康检查返回当前实际后端信息
- `d:\Dev\projects\dy-hackathon\ocr-service\pyproject.toml`
  - 补充 `pytesseract`、`pillow`、`pymupdf`
- `d:\Dev\projects\dy-hackathon\ocr-service\.env`
- `d:\Dev\projects\dy-hackathon\ocr-service\.env.example`

## 3. 环境信息

- 项目根目录：`d:\Dev\projects\dy-hackathon`
- 服务目录：`d:\Dev\projects\dy-hackathon\ocr-service`
- 测试图片目录：`d:\Dev\projects\dy-hackathon\mock_pics`
- 本地 Tesseract：`D:\software\Tesseract-OCR\tesseract.exe`
- Tesseract 语言包：`chi_sim`、`eng`、`osd`
- 服务地址：`http://127.0.0.1:8015`
- 原始结果文件：`d:\Dev\projects\dy-hackathon\ocr-service\artifacts\test_runs\mock_pics_test_results.json`

健康检查结果：

```json
{
  "status": "ok",
  "service": "Travel Structured Ingestion Service",
  "port": 8015,
  "extraction_backend": "local_tesseract",
  "ocr_language": "chi_sim+eng",
  "structuring_model": "deepseek-v4-flash",
  "database_configured": true
}
```

## 4. 过程记录

### 4.1 前置问题

此前尝试过：

1. Kimi Code 接口直接做文件抽取，返回 `404`
2. 切到开放平台文件接口后，返回 `401`

结论是：当前提供的 Kimi Code key 不能直接用于开放平台文件 OCR，所以改为方案二。

### 4.2 本地 OCR 验证

先直接调用类方法验证本地 OCR 与 DeepSeek 结构化：

- 本地 OCR 成功抽出文本，首张图片识别文本长度为 `681`
- DeepSeek 结构化成功返回多个 `items`

随后再做单张接口测试：

- 文件：`微信图片_20260606194611_493_141.jpg`
- 接口返回：`200`
- 单张入库条数：`9`

说明本地 OCR + DeepSeek + MySQL 主链路已打通。

### 4.3 全量 9 张图片实测

使用脚本：

- `d:\Dev\projects\dy-hackathon\ocr-service\scripts\run_mock_pics_test.py`

对 `mock_pics` 中 9 张图片顺序调用 `POST /ingest/upload`，并在结束后回查数据库。

## 5. 最终结果

- 测试图片数：`9`
- 请求成功数：`9`
- 请求失败数：`0`
- 平均单张耗时：`15.669s`
- 批量测试前数据库：`60` 行
- 批量测试后数据库：`109` 行
- 本轮批量测试新增入库：`49` 行

说明：

- `before_db.total = 60` 不是空库，因为在正式批量测试前已经做了多次单张验证和局部测试。
- 本轮批量脚本自身新增记录数为 `49`，且 `9/9` 图片全部返回 `200`。

## 6. 分图结果

| 图片 | HTTP | 耗时（秒） | 抽取条数 |
| --- | ---: | ---: | ---: |
| `微信图片_20260606194611_493_141.jpg` | `200` | `19.048` | `8` |
| `微信图片_20260606194613_494_141.jpg` | `200` | `16.391` | `3` |
| `微信图片_20260606194617_495_141.jpg` | `200` | `17.353` | `6` |
| `微信图片_20260606194622_496_141.jpg` | `200` | `15.721` | `6` |
| `微信图片_20260606194631_497_141.jpg` | `200` | `12.612` | `2` |
| `微信图片_20260606194637_498_141.jpg` | `200` | `13.792` | `5` |
| `微信图片_20260606194639_499_141.jpg` | `200` | `14.827` | `11` |
| `微信图片_20260606194641_500_141.jpg` | `200` | `15.776` | `4` |
| `微信图片_20260606194643_501_141.jpg` | `200` | `15.498` | `4` |

## 7. 入库核对

批量脚本记录到的数据库变化：

```json
{
  "before_db": {
    "max_id": 60,
    "total": 60
  },
  "after_db": {
    "max_id": 109,
    "total": 109
  }
}
```

本轮新增的部分样例：

```json
[
  {
    "id": 61,
    "category": "景点",
    "name": "广东省博物馆",
    "location": "广州市天河区",
    "summary": "广东省博物馆是了解岭南文化的重要场所，馆藏丰富。"
  },
  {
    "id": 68,
    "category": "交通",
    "name": "珠江夜游",
    "location": "广州市",
    "summary": "珠江夜游是广州特色游览项目，可欣赏两岸灯光夜景。"
  },
  {
    "id": 86,
    "category": "住宿",
    "name": "天河区珠江新城/体育西",
    "location": "广州市天河区珠江新城/体育西",
    "summary": "靠近花城广场、广州塔等商业地标，逛街购物和夜景观赏极为便利。"
  },
  {
    "id": 102,
    "category": "饮食",
    "name": "牛杂店",
    "location": "广州市-未明确区域",
    "summary": "这家牛杂店料足味美，里面满满牛杂，还加新鲜牛肉，非常好吃。"
  }
]
```

## 8. 质量观察

方案二已成功跑通，但仍存在可预期的 OCR 噪声：

1. 原始 `extracted_text` 中仍有较多错字、空格断裂、英文噪声
2. DeepSeek 结构化后整体可用，但个别地点粒度较粗
3. 同类截图可能产生重复记录，当前链路未做去重
4. 个别内容会被模型补全为合理地点或分类，结果偏“可用优先”

换句话说：

- 链路已打通
- 结果可入库
- 精度还有继续优化空间

## 9. 结论

方案二执行成功。

当前 `ocr-service` 已可以在本地完成：

`图片上传 -> 本地 OCR 提取 -> DeepSeek 结构化 -> MySQL 入库`

并且 `mock_pics` 的 9 张真实图片已经全部跑通，HTTP 成功率 `100%`，本轮批量新增入库 `49` 条。

## 10. 交付物

- 测试报告：`d:\Dev\projects\dy-hackathon\test_report.md`
- 批量原始结果：`d:\Dev\projects\dy-hackathon\ocr-service\artifacts\test_runs\mock_pics_test_results.json`
- 单张接口结果：`d:\Dev\projects\dy-hackathon\ocr-service\artifacts\test_runs\single_local_ocr_response.json`

## 11. 后续建议

1. 增加去重逻辑，避免同一景点在多张截图中重复入库
2. 为 OCR 文本增加清洗规则，如去异常空格、统一标点
3. 对 `summary/location` 增加更严格的后校验
4. 如后续需要更高识别率，可考虑对图片做裁剪、锐化或版面分块后再 OCR
