# 前端整合交付文档

> 适用对象：前端开发工程师、联调工程师、测试工程师
>
> 适用范围：基于当前仓库已存在代码、已验证接口、现有技术架构与最新 warning 能力，完成前后端全链路整合，交付一个可正常运行的旅游攻略导入与结构化展示 MVP 应用。

---

## 0. 交付结论

当前仓库中，已真实实现且可直接联调的后端能力为：

1. 图片 / PDF 上传
2. 本地 Tesseract OCR 文本提取
3. DeepSeek 结构化抽取
4. 字段清洗
5. 入库去重
6. MySQL 存储
7. 结构化结果查询
8. 结构化结果导出
9. 避雷源表匹配
10. warning 结果写库
11. warning 结果查询
12. warning 结果导出

当前前端代码本身尚未提供完整实现，但已有以下可作为开发依据的文档：

1. `页面规划.md`
2. `旅搭-产品需求文档.md`
3. `agent_train.md`
4. `frontend_development_spec.md`

本轮前端可交付的 MVP App 范围建议定义为：

1. 攻略文件上传页
2. OCR 与结构化处理状态页
3. 结构化结果列表页
4. warning 结果列表页
5. 分类筛选与关键词查询
6. JSON / CSV 导出
7. 基础错误提示、重试与联调日志展示

本轮不应承诺“已完成”的内容：

1. 旅游项目创建与项目管理后端
2. 拖拽拼装画布保存
3. 智能路线推荐
4. 地图联动
5. 用户账号体系
6. 行程分享与多人协作
7. 视频解析

---

## 1. 现有功能清单

### 1.1 已实现的后端功能

#### F-BE-01 健康检查

- 接口：`GET /health`
- 前端要求：应用启动自动请求；若失败则阻止进入上传主流程；若 `database_configured=false` 则上传按钮置灰
- 返回关键字段：`status`、`service`、`port`、`extraction_backend`、`ocr_language`、`structuring_model`、`database_configured`、`warning_seed_file`
- 开发边界：仅返回运行状态摘要，不返回数据库敏感配置

#### F-BE-02 文件上传并结构化入库

- 接口：`POST /ingest/upload`
- 前端要求：支持单文件上传、可选 `context_text`、上传中禁用按钮、成功后展示结构化结果与 warning 结果
- 输入规则：`multipart/form-data`，必填字段 `file`，可选字段 `context_text`
- 支持类型：`png`、`jpg`、`jpeg`、`webp`、`pdf`
- 大小上限：默认 `50MB`
- 返回字段：`status`、`file_name`、`file_type`、`extracted_text`、`item_count`、`saved_count`、`deduplicated_count`、`warning_count`、`warning_saved_count`、`items`、`warnings`
- 开发边界：仅支持单文件上传，不支持视频、不支持批量一次性上传、不支持异步任务轮询

#### F-BE-03 结构化结果查询

- 接口：`GET /ingest/items`
- 前端要求：支持最近结果加载、分类筛选、关键词搜索、手动刷新
- Query 参数：`limit`、`category`、`keyword`
- 返回字段：`total`、`items`
- 开发边界：当前无分页页码语义，排序固定为 `id desc`

#### F-BE-04 结构化结果导出

- 接口：`GET /ingest/export`
- 前端要求：支持 JSON / CSV 导出，并沿用当前筛选条件
- Query 参数：`format`、`limit`、`category`、`keyword`
- 开发边界：仅导出当前查询结果，不支持异步导出任务

#### F-BE-05 warning 结果查询

- 接口：`GET /ingest/warnings`
- 前端要求：支持 warning 列表页或结果页中的 warning 区块；支持分类筛选和关键词搜索
- Query 参数：`limit`、`category`、`keyword`
- 关键词命中字段：`name`、`location`、`summary`、`warning_summary`
- 开发边界：warning 命中规则为 `category + name`，不是语义召回

#### F-BE-06 warning 结果导出

- 接口：`GET /ingest/export-warnings`
- 前端要求：支持 warning JSON / CSV 导出，并沿用当前 warning 筛选条件
- Query 参数：`format`、`limit`、`category`、`keyword`
- 开发边界：仅导出命中的 warning 结果，不直接导出 warning 源表

#### F-BE-07 字段清洗与去重

- 字段清洗：清理异常空格、统一引号和标点空格、`summary` 自动补句号、`餐饮/美食/吃喝 -> 饮食`
- 去重规则：按清洗后的 `category + name + location` 组合键去重
- 前端要求：显式展示 `item_count`、`saved_count`、`deduplicated_count`；当 `saved_count=0` 且 `deduplicated_count>0` 时提示“识别成功，但内容已存在”

### 1.2 当前前端必须遵守的边界

前端本轮不得默认依赖以下能力：

1. 登录态
2. 用户维度数据隔离
3. 项目管理
4. 行程拖拽保存
5. 地图规划
6. 视频解析
7. 多人协作
8. 预算统计专用字段
9. 项目封面图和详情图接口

如需展示，可采用：

1. 本地 mock 数据
2. 纯前端状态
3. 文案占位
4. “待后端接口接入”提示

---

## 2. 工作流与技术路径说明

### 2.1 端到端业务流程

当前真实业务流如下：

1. 前端选择图片或 PDF
2. 前端将文件与可选 `context_text` 通过 `multipart/form-data` 提交到 `/ingest/upload`
3. FastAPI 接收上传文件并校验类型与大小
4. 后端将文件临时保存到 `artifacts/uploads`
5. 本地 Tesseract 执行 OCR 文本提取
6. DeepSeek 根据 OCR 文本生成结构化旅游条目
7. 服务层执行字段清洗
8. 服务层执行去重判断
9. 新结构化记录写入 `travel_structured_items`
10. 服务层按 `category + name` 检索 `travel_warning_sources`
11. 命中的 warning 结果写入 `travel_warning_items`
12. 后端返回 OCR 原文、结构化结果统计、warning 统计与 warning 列表
13. 前端展示结构化卡片、warning 卡片和操作反馈

### 2.2 技术栈分层

- 客户端建议：`Taro`、`React`、`Next.js`、`uni-app`、`React Native`
- 协议：`HTTP/1.1`
- 上传数据格式：`multipart/form-data`
- 查询数据格式：`application/json`
- 导出数据格式：`application/json` 或 `text/csv`
- 编码：`UTF-8`
- 后端框架：`FastAPI`
- OCR：`Tesseract OCR`
- 结构化模型：`DeepSeek /chat/completions`
- ORM：`SQLAlchemy`
- 数据库：`MySQL`
- 数据表：`travel_structured_items`、`travel_warning_sources`、`travel_warning_items`

### 2.3 调用链路

当前调用链路为：

`前端页面 -> HTTP 请求 -> FastAPI Router -> IngestService -> OCR / LLM Service -> WarningService -> SQLAlchemy -> MySQL`

展开后为：

1. `app/routers/ingest.py` 接收请求
2. `IngestService.ingest_file()` 编排 OCR、结构化、清洗和入库
3. `WarningService.match_and_persist()` 做避雷匹配和 warning 落库
4. Router 将结构化结果和 warning 结果统一序列化返回前端

### 2.4 数据通信约定

#### 上传接口约定

- 方法：`POST`
- 地址：`/ingest/upload`
- `Content-Type`：`multipart/form-data`
- 字段：`file`、`context_text`

#### 结构化结果接口约定

- `GET /ingest/items`
- `GET /ingest/export`
- 参数：`limit`、`category`、`keyword`、`format`

#### warning 结果接口约定

- `GET /ingest/warnings`
- `GET /ingest/export-warnings`
- 参数：`limit`、`category`、`keyword`、`format`

### 2.5 前后端约定规范

1. 时间字段统一按 ISO 8601 字符串处理
2. `category` 只使用 `景点/饮食/交通/住宿`
3. 上传只允许单文件
4. 前端必须展示 `saved_count`、`deduplicated_count`、`warning_count`、`warning_saved_count`
5. 前端需保留 `extracted_text` 查看入口，便于调试 OCR 质量
6. 查询页与导出页必须共用同一套筛选状态模型
7. warning 列表与 warning 导出必须共用同一套筛选状态模型
8. 前端不要自行构造写库请求，当前未开放手工新增接口

### 2.6 跨端适配规则

#### H5

- 采用标准 `multipart/form-data`
- 可直接处理 JSON 与 CSV 下载
- 浏览器跨域环境需确保请求地址与 CORS 配置一致

#### 小程序 / Taro / uni-app

- 需要使用平台文件上传 API
- 上传字段名必须为 `file`
- 若上传 API 不支持普通字段，需单独验证 `context_text` 兼容方式
- CSV 导出通常走本地临时文件或分享流程

#### React Native / Flutter

- 上传使用 `FormData`
- 文件字段显式带 `uri`、`name`、`type`
- 导出建议优先取 JSON，再由客户端转换本地文件

### 2.7 当前实现中的关键风险点

1. OCR 原文可能有噪声
2. 重复上传可能被去重
3. 模型补全地点并非绝对准确
4. 单张处理耗时可能在 `10s-20s`
5. warning 命中依赖 `category + name`，同义词或别名可能无法命中
6. 当前链路不是异步任务，因此上传页需要长等待态

---

## 3. 完整落地实现方案

### 3.1 前端建议交付形态

建议前端至少交付 4 个主页面或主视图：

#### 页面 A：服务状态页 / 首页

- 必接接口：`GET /health`
- 功能：显示服务连接状态、支持文件类型、warning 能力状态、进入上传页

#### 页面 B：文件上传页

- 必接接口：`POST /ingest/upload`
- 功能：选择图片 / PDF、输入补充上下文、提交上传、展示处理中状态

#### 页面 C：上传结果页

- 功能：展示 `extracted_text`、`item_count`、`saved_count`、`deduplicated_count`、`warning_count`、`warning_saved_count`
- 展示内容：结构化结果卡片、warning 卡片、按类别折叠
- 数据来源：上传返回结果

#### 页面 D：历史结果 / 导出页

- 必接接口：`GET /ingest/items`、`GET /ingest/export`、`GET /ingest/warnings`、`GET /ingest/export-warnings`
- 功能：结构化结果查询、warning 查询、分类筛选、关键词搜索、JSON / CSV 导出

### 3.2 前端目录建议

```text
frontend/
├─ src/
│  ├─ api/
│  │  ├─ ingest.ts
│  │  └─ warning.ts
│  ├─ pages/
│  │  ├─ health/
│  │  ├─ upload/
│  │  ├─ result/
│  │  └─ records/
│  ├─ components/
│  │  ├─ upload-form/
│  │  ├─ result-card/
│  │  ├─ warning-card/
│  │  ├─ result-stats/
│  │  └─ filter-bar/
│  ├─ types/
│  │  └─ ingest.ts
│  ├─ store/
│  └─ utils/
└─ .env
```

### 3.3 前端接口模型建议

```ts
export type Category = "景点" | "饮食" | "交通" | "住宿";

export interface StructuredItemRecord {
  id: number;
  category: Category;
  name: string;
  location: string;
  summary: string;
  created_at: string;
  updated_at: string;
}

export interface WarningRecord {
  id: number;
  structured_item_id: number;
  warning_source_id: number;
  category: Category;
  name: string;
  location: string;
  summary: string;
  warning_summary: string;
  avoid_reasons: string[];
  execution_tips: string[];
  alternatives: string[];
  confirm_before_go: string[];
  matched_by: string;
  created_at: string;
  updated_at: string;
}

export interface UploadIngestResponse {
  status: "success";
  file_name: string;
  file_type: "image" | "pdf";
  extracted_text: string;
  item_count: number;
  saved_count: number;
  deduplicated_count: number;
  warning_count: number;
  warning_saved_count: number;
  items: StructuredItemRecord[];
  warnings: WarningRecord[];
}
```

### 3.4 环境配置要求

后端联调前需确认：

1. Python 虚拟环境可正常启动
2. MySQL 已可用
3. Tesseract 已安装
4. DeepSeek Key 已可读取
5. Uvicorn 服务已启动

前端建议配置：

```env
VITE_API_BASE_URL=http://127.0.0.1:8011
```

或：

```env
TARO_APP_API_BASE_URL=http://127.0.0.1:8011
```

### 3.5 联调规则

#### 步骤 1：确认服务可用

1. 请求 `GET /health`
2. 检查 `status=ok`
3. 检查 `database_configured=true`
4. 首页展示 `local_tesseract` 与 `deepseek-v4-flash`

#### 步骤 2：联调上传

1. 使用 `mock_pics` 中任一图片
2. 调用 `POST /ingest/upload`
3. 检查 `status`、`item_count`、`saved_count`、`warning_count`
4. 页面确认 `items`、`warnings` 数组可展示

#### 步骤 3：联调结构化查询

1. 调用 `GET /ingest/items?limit=20`
2. 调用 `GET /ingest/items?limit=20&category=景点`
3. 调用 `GET /ingest/items?limit=20&keyword=博物馆`

#### 步骤 4：联调 warning 查询

1. 调用 `GET /ingest/warnings?limit=20`
2. 调用 `GET /ingest/warnings?limit=20&category=景点`
3. 调用 `GET /ingest/warnings?limit=20&keyword=灵隐寺`

#### 步骤 5：联调导出

1. 调用 `GET /ingest/export?format=json&limit=20`
2. 调用 `GET /ingest/export?format=csv&limit=20`
3. 调用 `GET /ingest/export-warnings?format=json&limit=20`
4. 调用 `GET /ingest/export-warnings?format=csv&limit=20`

### 3.6 错误处理标准

- `400`：上传文件为空，提示“上传文件为空，请重新选择文件”
- `413`：文件超大，提示“文件过大，当前限制为 50MB”
- `415`：文件类型不支持，提示“仅支持 PNG/JPG/JPEG/WEBP/PDF”
- `500`：后端处理失败，默认提示“处理失败，请稍后重试”
- 网络错误：提示“无法连接后端服务，请检查本地联调环境”

### 3.7 页面交互细则

#### 上传页

- 选择文件后展示文件名和大小
- 前端先拦截非法类型和超大文件
- 上传中按钮禁用，并展示处理中状态
- 成功后跳转结果页或原地展示结果

#### 结果页

- 顶部展示文件名、抽取总数、新增入库数、去重数、warning 命中数、新增 warning 数
- 中部展示结构化卡片
- 同页展示 warning 卡片：warning 摘要、避雷原因、出发前确认项
- 底部可展开 OCR 原文

#### 历史页

- 顶部提供结构化 / warning 结果切换
- 提供分类筛选、关键词搜索、查询按钮、导出按钮
- 列表项展示类别、名称、地点、描述、时间

### 3.8 集成测试用例

1. 健康检查成功
2. 图片上传成功
3. 重复上传命中去重
4. 按分类查询结构化结果
5. 按关键词查询结构化结果
6. warning 命中成功
7. CSV 导出成功
8. warning JSON / CSV 导出成功
9. 非法文件类型被拦截或返回 `415`
10. 超大文件被拦截或返回 `413`

### 3.9 全量验证清单

#### 环境

- [ ] 后端 `.env` 配置正确
- [ ] MySQL 可连接
- [ ] Tesseract 可执行
- [ ] DeepSeek Key 可用
- [ ] 后端服务能启动

#### 接口

- [ ] `/health` 正常
- [ ] `/ingest/upload` 正常
- [ ] `/ingest/items` 正常
- [ ] `/ingest/export?format=json` 正常
- [ ] `/ingest/export?format=csv` 正常
- [ ] `/ingest/warnings` 正常
- [ ] `/ingest/export-warnings?format=json` 正常
- [ ] `/ingest/export-warnings?format=csv` 正常

#### 页面

- [ ] 首页状态可展示
- [ ] 上传页可选择图片 / PDF
- [ ] 上传中状态可见
- [ ] 结果页可展示结构化统计值
- [ ] 结果页可展示 warning 统计值
- [ ] OCR 原文可查看
- [ ] 历史查询可按类别和关键词过滤
- [ ] 结构化导出可用
- [ ] warning 导出可用

#### 数据

- [ ] 新上传数据可入库
- [ ] 重复上传可命中去重
- [ ] warning 命中结果与上传返回 / 数据库一致
- [ ] JSON / CSV 导出与页面筛选条件一致

### 3.10 当前“完整 App”定义

在当前后端能力不继续扩展的前提下，前端可交付的完整 App 定义为：

1. 用户能上传旅游攻略图片 / PDF
2. 用户能等待 OCR 和结构化完成
3. 用户能查看结构化结果
4. 用户能知道哪些内容新入库、哪些被去重
5. 用户能查看命中的避雷结果
6. 用户能检索历史结构化结果和 warning 结果
7. 用户能导出历史结构化结果和 warning 结果

这是一套完整可运行的“攻略导入、结构化管理与避雷提醒 MVP App”，不是完整旅游行程拼装平台。

---

## 4. 建议前端实现优先级

1. `health` 服务检测
2. 文件上传
3. 结构化结果展示
4. warning 结果展示
5. 历史查询
6. 导出能力
7. 统一错误处理
8. 跨端适配
9. 视觉与交互优化

---

## 5. 交接时建议重点阅读的代码与文档

### 核心代码

- [main.py](file:///d:/Dev/projects/dy-hackathon/ocr-service/app/main.py)
- [ingest.py](file:///d:/Dev/projects/dy-hackathon/ocr-service/app/routers/ingest.py)
- [ingest_service.py](file:///d:/Dev/projects/dy-hackathon/ocr-service/app/services/ingest_service.py)
- [warning_service.py](file:///d:/Dev/projects/dy-hackathon/ocr-service/app/services/warning_service.py)
- [schemas.py](file:///d:/Dev/projects/dy-hackathon/ocr-service/app/schemas.py)
- [warning_sources_seed.json](file:///d:/Dev/projects/dy-hackathon/ocr-service/app/data/warning_sources_seed.json)
- [config.py](file:///d:/Dev/projects/dy-hackathon/ocr-service/app/config.py)

### 测试与实测材料

- [test_ingest_api.py](file:///d:/Dev/projects/dy-hackathon/ocr-service/tests/test_ingest_api.py)
- [test_report.md](file:///d:/Dev/projects/dy-hackathon/test_report.md)
- [mock_pics_test_results.json](file:///d:/Dev/projects/dy-hackathon/ocr-service/artifacts/test_runs/mock_pics_test_results.json)
- [dedupe_check.json](file:///d:/Dev/projects/dy-hackathon/ocr-service/artifacts/test_runs/dedupe_check.json)

### 产品与页面规划

- [页面规划.md](file:///d:/Dev/projects/dy-hackathon/页面规划.md)
- [旅搭-产品需求文档.md](file:///d:/Dev/projects/dy-hackathon/旅搭-产品需求文档.md)
- [agent_train.md](file:///d:/Dev/projects/dy-hackathon/agent_train.md)

---

## 6. 最终交付建议

建议前端工程师不要按完整 PRD 全量开工，而是按“两层目标”推进：

### 第一层：本周必须联通的真实能力

1. 上传
2. 结构化结果查看
3. warning 结果查看
4. 查询
5. 导出

### 第二层：后续版本扩展位

1. 项目化管理
2. 画布拖拽
3. 地图与路线
4. 视频输入
5. 分享与账户

这样可以确保：

1. 当前版本前后端能真实跑通
2. 不会因为等待未实现接口阻塞前端交付
3. 后续新能力加入时，现有前端结构不需要推翻重做
