# 前端整合交付文档

> 适用对象：前端开发工程师、联调工程师、测试工程师
>
> 适用范围：基于当前仓库**已存在代码、已验证接口、现有技术架构与文档规划**，完成前后端全链路整合，交付一个可正常运行的旅游攻略导入与结构化展示 MVP 应用。

---

## 0. 交付结论

当前仓库中，**可直接联调并已实测通过的核心后端能力**为：

1. 图片 / PDF 上传
2. 本地 Tesseract OCR 文本提取
3. DeepSeek 结构化抽取
4. 字段清洗
5. 入库去重
6. MySQL 存储
7. 结果查询
8. 结果导出

当前仓库中，**前端代码本身尚未提供完整实现**，但已有以下可作为前端落地依据的规划文档：

1. `页面规划.md`
2. `旅搭-产品需求文档.md`
3. `agent_train.md`

因此，本交付文档采用如下原则：

1. 对“**已实现后端能力**”给出可直接联调的前端方案
2. 对“**仅有产品规划、尚无后端接口支撑**”的功能明确标注边界
3. 以前端可在当前阶段**真正完成上线联调**为目标，定义一个当前可运行的 MVP App 范围

**当前可交付 MVP App 范围建议定义为：**

1. 攻略文件上传页
2. OCR 与结构化处理状态页
3. 结构化结果列表页
4. 分类筛选与关键词查询
5. JSON / CSV 导出
6. 基础错误提示、重试与联调日志展示

**不建议在本轮前端交付中承诺“已完成”的内容：**

1. 旅游项目创建与项目管理后端
2. 拖拽拼装画布
3. 智能路线推荐
4. 地图联动
5. 用户账号体系
6. 行程分享与多人协作
7. “探索 / 我的”完整业务后端

---

## 1. 现有功能清单

本节按“现状是否已实现”拆分，避免前端误判边界。

### 1.1 已实现的后端功能

#### F-BE-01 健康检查

- 功能说明：用于前端启动时检测服务是否可用、OCR 后端是否正确挂载、数据库是否已配置。
- 接口：`GET /health`
- 前端交互要求：
  - App 启动后自动请求一次
  - 若失败，首页显示“服务不可用，请检查后端启动状态”
  - 若 `database_configured=false`，上传按钮置灰或提示不可用
- 输入规则：
  - 无请求体
- 输出规则：
  - JSON
  - 字段包括：`status`、`service`、`port`、`extraction_backend`、`ocr_language`、`structuring_model`、`database_configured`
- 已完成边界：
  - 仅返回服务状态与运行配置摘要
  - 不返回数据库连接详情

#### F-BE-02 文件上传并结构化入库

- 功能说明：上传单个图片或 PDF，后端完成 OCR、结构化、字段清洗、去重和 MySQL 入库。
- 接口：`POST /ingest/upload`
- 前端交互要求：
  - 支持文件选择器或拍照 / 相册选择
  - 支持附加 `context_text`
  - 上传中显示进度态、禁止重复点击
  - 成功后跳转结果页或原地展示结构化结果
- 后端依赖：
  - 本地 `Tesseract OCR`
  - `DeepSeek API`
  - `MySQL`
- 输入规则：
  - `Content-Type: multipart/form-data`
  - `file` 为必填
  - `context_text` 为可选文本字段
  - 支持文件类型：
    - `image/png`
    - `image/jpeg`
    - `image/jpg`
    - `image/webp`
    - `application/pdf`
  - 文件大小上限：默认 `50MB`
- 输出规则：
  - JSON
  - 返回字段：
    - `status`
    - `file_name`
    - `file_type`
    - `extracted_text`
    - `item_count`
    - `saved_count`
    - `deduplicated_count`
    - `items`
  - `items` 中每项字段：
    - `id`
    - `category`
    - `name`
    - `location`
    - `summary`
    - `created_at`
    - `updated_at`
- 已完成边界：
  - 只支持单文件上传
  - 不支持视频上传
  - 不支持任务队列与异步轮询
  - 不支持断点续传
  - 不支持多文件批量一次性提交

#### F-BE-03 结果查询

- 功能说明：获取已入库结构化结果，支持分类和关键词过滤。
- 接口：`GET /ingest/items`
- 前端交互要求：
  - 支持默认加载最近数据
  - 支持分类 Tab 或下拉选择
  - 支持关键词搜索
  - 支持手动刷新
- 输入规则：
  - Query 参数：
    - `limit`：默认 `100`，范围 `1-500`
    - `category`：可选，建议值 `景点/饮食/交通/住宿`
    - `keyword`：可选，模糊匹配 `name/location/summary`
- 输出规则：
  - JSON
  - 字段：`total`、`items`
- 已完成边界：
  - 当前为列表查询，不含分页页码语义
  - 排序固定为 `id desc`
  - 未提供聚合统计接口

#### F-BE-04 结果导出

- 功能说明：将当前查询结果导出为 JSON 或 CSV。
- 接口：`GET /ingest/export`
- 前端交互要求：
  - 提供“导出 JSON”和“导出 CSV”两个按钮
  - 导出时沿用当前筛选条件
  - App/H5 端分别做文件下载或分享落盘
- 输入规则：
  - Query 参数：
    - `format=json|csv`
    - `limit`
    - `category`
    - `keyword`
- 输出规则：
  - `format=json`：返回 JSON
  - `format=csv`：返回 `text/csv; charset=utf-8`
- 已完成边界：
  - 仅导出当前查询结果
  - 不支持异步导出任务
  - 不支持 Excel 原生格式

#### F-BE-05 字段清洗

- 功能说明：后端在入库前对模型输出字段做标准化清洗。
- 处理规则：
  - 清理中文词间异常空格
  - 统一引号与标点空格
  - `summary` 自动补句号
  - 类别别名归一：
    - `餐饮 -> 饮食`
    - `美食 -> 饮食`
    - `吃喝 -> 饮食`
- 前端交互要求：
  - 前端不需要重复做强清洗
  - 前端可做轻展示清洗，如换行折叠、超长省略
- 已完成边界：
  - 为规则清洗，不是语义纠错
  - OCR 噪声依然可能存在

#### F-BE-06 入库去重

- 功能说明：后端按清洗后的 `category + name + location` 组合键去重。
- 前端交互要求：
  - 上传结果页需展示：
    - 总抽取数 `item_count`
    - 实际入库数 `saved_count`
    - 去重数 `deduplicated_count`
  - 若 `saved_count=0` 且 `deduplicated_count>0`，前端提示“识别成功，但本次内容已存在”
- 已完成边界：
  - 当前是规则去重
  - 不是模糊语义去重
  - 同名不同地点会视为不同记录
  - 同地点不同粒度描述仍可能重复

### 1.2 前端已具备的文档级能力，不等同于代码已实现

以下内容存在于需求或页面规划文档中，但**当前仓库没有对应可联调后端接口**，前端不能按“已实现功能”处理：

#### F-FE-DOC-01 主页面结构规划

- 来源：`页面规划.md`
- 规划内容：
  - 顶部搜索栏
  - 主体内容区域
  - 底部导航区域
- 当前开发边界：
  - 可作为前端页面布局参考
  - 但“项目列表”“容器列表”没有对应后端接口

#### F-FE-DOC-02 项目详情页与拖拽拼装

- 来源：`页面规划.md`、`旅搭-产品需求文档.md`
- 规划内容：
  - 景点 / 餐饮 / 交通 / 住宿模块拖拽拼装
  - 日程组合画布
- 当前开发边界：
  - 当前后端只输出结构化条目
  - 没有项目实体、行程实体、拖拽排序保存接口

#### F-FE-DOC-03 视频解析与抖音链接输入

- 来源：`旅搭-产品需求文档.md`
- 规划内容：
  - 视频链接解析
  - 视频上传
- 当前开发边界：
  - 当前代码链路只支持图片 / PDF
  - 不支持视频链接解析和视频文件 OCR/ASR

### 1.3 当前前端必须严格遵守的开发边界

前端本轮整合不得默认依赖以下能力：

1. 登录态
2. 用户维度数据隔离
3. 项目管理
4. 行程拖拽保存
5. 地图规划
6. 视频解析
7. 多人协作
8. 避雷专用字段
9. 预算专用字段
10. 项目封面图和详情图接口

如需要展示，可采用：

1. 本地假数据
2. 纯前端状态
3. 文案占位
4. “待后端接口接入”提示

---

## 2. 工作流与技术路径说明

### 2.1 端到端业务流程

当前已实现的真实业务流如下：

1. 前端选择图片或 PDF
2. 前端将文件与可选 `context_text` 通过 `multipart/form-data` 提交给 `/ingest/upload`
3. FastAPI 接收上传文件
4. 后端校验文件类型与大小
5. 后端将上传文件暂存到 `artifacts/uploads`
6. 本地 Tesseract 对图片或 PDF 页面执行 OCR
7. DeepSeek 根据 OCR 文本生成结构化旅游条目
8. 服务层执行字段清洗
9. 服务层执行去重判断
10. 新记录写入 MySQL 表 `travel_structured_items`
11. 后端返回：
   - OCR 原文
   - 总抽取数
   - 实际入库数
   - 去重数
   - 本次新入库记录
12. 前端展示上传结果、结构化卡片和操作反馈

### 2.2 当前技术栈分层

#### 客户端建议层

- 推荐前端框架：
  - `Taro`
  - `React`
  - `Next.js`
  - `uni-app`
  - `React Native`
- 当前后端对前端框架无绑定要求
- 关键要求只有两项：
  - 支持文件上传
  - 支持 JSON / CSV 接口调用

#### 接口层

- 协议：`HTTP/1.1`
- 数据格式：
  - 上传：`multipart/form-data`
  - 查询：`application/json`
  - 导出：`application/json` 或 `text/csv`
- 编码：`UTF-8`
- 跨域：由后端 `CORS` 控制，当前默认允许 `*`

#### 服务层

- 框架：`FastAPI`
- 路由文件：`ocr-service/app/routers/ingest.py`
- 应用入口：`ocr-service/app/main.py`
- 服务编排：`ocr-service/app/services/ingest_service.py`

#### OCR 层

- 工具：`Tesseract OCR`
- 图片处理：
  - 灰度化
  - 自动对比度增强
  - 2 倍缩放
  - 两套 `psm` 配置取更优文本
- PDF 处理：
  - 先通过 `PyMuPDF` 渲染页面为图片
  - 再走图片 OCR

#### LLM 结构化层

- 服务：`DeepSeek API`
- 模式：`/chat/completions`
- 输出：JSON 对象
- 约束：
  - 类别限定为 `景点/饮食/交通/住宿`
  - 输出字段固定为 `category/name/location/summary`

#### 数据层

- 数据库：`MySQL`
- ORM：`SQLAlchemy`
- 表：`travel_structured_items`
- 主字段：
  - `id`
  - `category`
  - `name`
  - `location`
  - `summary`
  - `created_at`
  - `updated_at`

### 2.3 技术调用链路

当前调用链路可描述为：

`前端页面 -> HTTP 请求 -> FastAPI Router -> IngestService -> OCR/LLM Service -> SQLAlchemy -> MySQL`

展开后为：

1. 页面发起上传
2. `app/routers/ingest.py` 接收文件
3. `IngestService.ingest_file()` 编排流程
4. `KimiClient.extract_file_text()` 执行本地 OCR
5. `KimiClient.structure_text()` 调用 DeepSeek
6. `IngestService._clean_item()` 执行字段清洗
7. `IngestService._persist_items()` 执行去重与落库
8. Router 将结果序列化为 JSON 返回给前端

### 2.4 数据通信协议约定

#### 上传接口约定

- 方法：`POST`
- 地址：`/ingest/upload`
- `Content-Type`：`multipart/form-data`
- 请求字段：
  - `file`
  - `context_text`

#### 查询接口约定

- 方法：`GET`
- 地址：`/ingest/items`
- 参数：
  - `limit`
  - `category`
  - `keyword`

#### 导出接口约定

- 方法：`GET`
- 地址：`/ingest/export`
- 参数：
  - `format`
  - `limit`
  - `category`
  - `keyword`

### 2.5 前后端约定规范

前端必须遵守以下约定：

1. 所有时间字段按 ISO 8601 字符串处理，不在请求侧回传
2. `category` 只使用以下四类：
   - `景点`
   - `饮食`
   - `交通`
   - `住宿`
3. 上传只允许单文件
4. 文件类型校验前后端都要做
5. 前端不要自行构造结构化条目写库请求，当前后端没有开放“手工新增条目”接口
6. 查询页与导出页必须共用同一套筛选参数模型
7. 前端需保留 `extracted_text` 查看入口，便于调试 OCR 质量
8. 前端对 `saved_count` 与 `deduplicated_count` 要做显式展示

### 2.6 跨端适配规则

#### H5

- 采用标准 `multipart/form-data`
- 可直接处理 JSON 与 CSV 下载
- 若是浏览器跨域环境，确保请求地址与 CORS 配置一致

#### 小程序 / Taro / uni-app

- 需要使用平台文件上传 API
- 上传字段名必须为 `file`
- 如平台上传 API 不支持额外普通字段，需验证 `context_text` 兼容方式
- CSV 导出通常要走“下载到本地临时文件”或“转发分享”

#### React Native / Flutter 容器前端

- 上传需要用 `FormData`
- 文件字段需显式带：
  - `uri`
  - `name`
  - `type`
- 导出建议先请求 JSON，再由客户端转换为本地文件，减少下载适配差异

### 2.7 当前实现中的关键风险点

前端需要预期以下风险并做展示兜底：

1. OCR 原文可能有噪声
2. 同一图片重复上传可能被去重
3. 模型补全地点并非绝对准确
4. 单张处理耗时可能在 `10s-20s`
5. 当前链路不是异步任务，因此上传页需要长等待态

---

## 3. 完整落地实现方案

### 3.1 前端建议交付形态

基于当前后端能力，建议前端交付 4 个页面或 4 个主视图：

#### 页面 A：服务状态页 / 首页

- 功能：
  - 显示服务连接状态
  - 显示支持文件类型
  - 提供“开始上传”入口
- 必接接口：
  - `GET /health`

#### 页面 B：文件上传页

- 功能：
  - 选择图片 / PDF
  - 输入补充上下文
  - 提交上传
  - 展示上传中状态
- 必接接口：
  - `POST /ingest/upload`

#### 页面 C：结构化结果页

- 功能：
  - 展示 `extracted_text`
  - 展示本次 `item_count/saved_count/deduplicated_count`
  - 展示本次新增入库条目列表
  - 支持按类别折叠
- 必接接口：
  - 使用上传返回结果即可

#### 页面 D：历史结果 / 导出页

- 功能：
  - 列表查询
  - 分类筛选
  - 关键词搜索
  - 导出 JSON / CSV
- 必接接口：
  - `GET /ingest/items`
  - `GET /ingest/export`

### 3.2 前端目录建议

如前端尚未初始化，建议目录结构如下：

```text
frontend/
├─ src/
│  ├─ api/
│  │  └─ ingest.ts
│  ├─ pages/
│  │  ├─ health/
│  │  ├─ upload/
│  │  ├─ result/
│  │  └─ records/
│  ├─ components/
│  │  ├─ upload-form/
│  │  ├─ result-card/
│  │  ├─ result-stats/
│  │  └─ filter-bar/
│  ├─ types/
│  │  └─ ingest.ts
│  ├─ store/
│  └─ utils/
└─ .env
```

### 3.3 前端接口模型建议

建议前端统一维护以下类型定义：

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

export interface UploadIngestResponse {
  status: "success";
  file_name: string;
  file_type: "image" | "pdf";
  extracted_text: string;
  item_count: number;
  saved_count: number;
  deduplicated_count: number;
  items: StructuredItemRecord[];
}

export interface ListStructuredItemsResponse {
  total: number;
  items: StructuredItemRecord[];
}
```

### 3.4 环境配置要求

#### 后端运行环境

前端联调前需确认后端满足：

1. Python 虚拟环境可正常启动
2. MySQL 已可用
3. `Tesseract` 已安装
4. DeepSeek Key 已可读取
5. `uvicorn` 服务已启动

后端当前关键配置来源：

1. `ocr-service/.env`
2. `ocr-service/.env.example`
3. 根目录 `API_keys.md`

#### 前端运行环境

建议前端配置：

```env
VITE_API_BASE_URL=http://127.0.0.1:8016
```

或小程序 / Taro 中配置：

```env
TARO_APP_API_BASE_URL=http://127.0.0.1:8016
```

### 3.5 联调规则

#### 联调步骤 1：确认服务可用

1. 请求 `GET /health`
2. 检查返回：
   - `status=ok`
   - `database_configured=true`
3. 前端首页展示：
   - OCR 后端：`local_tesseract`
   - 结构化模型：`deepseek-v4-flash`

#### 联调步骤 2：先联调图片上传

1. 使用 `mock_pics` 中任一图片
2. 调用 `POST /ingest/upload`
3. 前端确认返回：
   - `status=success`
   - `item_count` 存在
   - `saved_count` 存在
   - `items` 为数组

#### 联调步骤 3：联调查询

1. 调用 `GET /ingest/items?limit=20`
2. 再调用 `GET /ingest/items?limit=20&category=景点`
3. 再调用 `GET /ingest/items?limit=20&keyword=博物馆`
4. 前端确认筛选条件可联动结果

#### 联调步骤 4：联调导出

1. 调用 `GET /ingest/export?format=json&limit=20`
2. 调用 `GET /ingest/export?format=csv&limit=20`
3. 前端确认 JSON 可展示、CSV 可下载

### 3.6 错误处理标准

前端必须统一处理以下错误：

#### 400

- 场景：文件为空
- 建议提示：`上传文件为空，请重新选择文件`

#### 413

- 场景：文件超出大小上限
- 建议提示：`文件过大，当前限制为 50MB`

#### 415

- 场景：不支持文件类型
- 建议提示：`仅支持 PNG/JPG/JPEG/WEBP/PDF`

#### 500

- 场景：
  - Tesseract 未配置
  - DeepSeek Key 不可用
  - 模型返回异常
  - 数据库异常
- 建议提示：
  - 默认：`处理失败，请稍后重试`
  - 调试模式可附带后端 `detail`

#### 网络错误

- 场景：服务未启动、端口错误、跨域失败
- 建议提示：`无法连接后端服务，请检查本地联调环境`

### 3.7 前端页面交互细则

#### 上传页

- 选择文件后显示文件名和大小
- 大于 50MB 前端直接拦截
- 非支持类型前端直接拦截
- 点击上传后：
  - 按钮禁用
  - 展示处理中
  - 最长等待建议 30 秒后提示“仍在处理中，请耐心等待”

#### 结果页

- 顶部展示上传摘要：
  - 文件名
  - 抽取总数
  - 新增入库数
  - 去重数
- 中部展示结构化卡片
- 底部可展开 OCR 原文

#### 历史页

- 顶部：
  - 分类筛选
  - 关键词输入框
  - 查询按钮
  - 导出按钮
- 列表项展示：
  - 类别标签
  - 名称
  - 地点
  - 一句话描述
  - 创建时间

### 3.8 集成测试用例

前端联调至少执行以下测试：

#### 用例 1：健康检查成功

- 步骤：
  - 打开首页
  - 自动请求 `/health`
- 期望：
  - 页面显示“服务可用”
  - 显示 OCR 与模型信息

#### 用例 2：图片上传成功

- 输入：
  - `mock_pics` 任一 JPG
- 期望：
  - 请求成功
  - 返回 `status=success`
  - 页面展示至少 1 条结构化结果

#### 用例 3：重复上传命中去重

- 步骤：
  - 连续上传同一张图两次
- 期望：
  - 第二次 `saved_count` 明显下降，或为 `0`
  - `deduplicated_count` 增加

#### 用例 4：按分类查询

- 步骤：
  - 请求 `category=景点`
- 期望：
  - 返回列表仅展示景点类数据

#### 用例 5：按关键词查询

- 步骤：
  - 搜索 `博物馆`
- 期望：
  - 返回结果中 `name/location/summary` 命中关键词

#### 用例 6：CSV 导出

- 步骤：
  - 点击导出 CSV
- 期望：
  - 浏览器下载成功或客户端落盘成功
  - 文件首行包含表头

#### 用例 7：非法文件类型

- 输入：
  - `.mp4` 或 `.txt`
- 期望：
  - 前端优先拦截
  - 若仍发起请求，后端返回 `415`

#### 用例 8：超大文件

- 输入：
  - `>50MB`
- 期望：
  - 前端直接阻止上传
  - 后端兜底返回 `413`

### 3.9 全量验证清单

交付前请逐项确认：

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

#### 页面

- [ ] 首页状态可展示
- [ ] 上传页可选择图片 / PDF
- [ ] 上传中状态可见
- [ ] 结果页可展示统计值
- [ ] OCR 原文可查看
- [ ] 历史查询可按类别和关键词过滤
- [ ] 导出按钮可用

#### 数据

- [ ] 新上传数据可入库
- [ ] 重复上传可命中去重
- [ ] 查询结果与数据库一致
- [ ] JSON / CSV 导出与页面筛选条件一致

#### 错误处理

- [ ] 空文件提示正确
- [ ] 非法格式提示正确
- [ ] 超大文件提示正确
- [ ] 后端异常提示正确
- [ ] 网络失败提示正确

### 3.10 当前可交付的“完整 App”定义

在当前后端能力不继续扩展的前提下，前端可交付的“完整 App”应定义为：

1. 用户能上传旅游攻略图片 / PDF
2. 用户能等待 OCR 和结构化完成
3. 用户能查看结构化结果
4. 用户能知道哪些内容新入库、哪些被去重
5. 用户能检索历史数据
6. 用户能导出历史数据

这是一套**完整可运行的“攻略导入与结构化管理 MVP App”**，不是“完整旅游行程拼装平台”。

如果要交付“拖拽拼装、项目管理、地图路线、视频解析”的完整产品版 App，后端仍需继续新增接口与数据模型。

---

## 4. 建议前端实现优先级

建议前端按以下顺序开发：

1. `health` 服务检测
2. 文件上传
3. 结果展示
4. 历史查询
5. 导出能力
6. 统一错误处理
7. 跨端适配
8. 视觉与交互优化

---

## 5. 交接时建议前端重点阅读的代码与文档

### 核心代码

- [main.py](file:///d:/Dev/projects/dy-hackathon/ocr-service/app/main.py)
- [ingest.py](file:///d:/Dev/projects/dy-hackathon/ocr-service/app/routers/ingest.py)
- [ingest_service.py](file:///d:/Dev/projects/dy-hackathon/ocr-service/app/services/ingest_service.py)
- [kimi_client.py](file:///d:/Dev/projects/dy-hackathon/ocr-service/app/services/kimi_client.py)
- [schemas.py](file:///d:/Dev/projects/dy-hackathon/ocr-service/app/schemas.py)
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

前端工程师拿到本项目后，建议不要直接按完整 PRD 全量开工，而是按“两层目标”推进：

### 第一层：本周必须能联通的真实能力

1. 上传
2. 结构化结果查看
3. 查询
4. 导出

### 第二层：后续版本扩展位

1. 项目化管理
2. 画布拖拽
3. 地图与路线
4. 视频输入
5. 分享与账户

这样可以确保：

1. 当前版本前后端能真正跑通
2. 不会因为等待未实现接口而阻塞前端交付
3. 后续新能力加入时，现有前端结构不需要推翻重做
