# 前端开发技术规范

> 适用对象：接手本项目的前端开发工程师
>
> 目标：基于当前仓库已实现的后端能力，在独立分支完成前端开发、联调、自测与提交，最终由项目主负责人拉回本地进行整合。

---

## 1. 开发目标

本轮前端开发的目标是交付一个可联调、可运行、可演示的前端 MVP，围绕当前真实能力实现：

1. 服务健康检查
2. 图片 / PDF 上传
3. OCR 与结构化结果展示
4. warning 结果展示
5. 历史结构化结果查询
6. 历史 warning 结果查询
7. JSON / CSV 导出
8. 基础异常提示与重试机制

本轮不纳入正式交付范围：

1. 视频解析
2. 登录注册
3. 项目管理
4. 地图路线
5. 分享协作
6. 探索 / 我的正式业务页

---

## 2. Git 协作规范

### 2.1 基线分支

- 当前后端稳定协作基线分支：`warning-card-feature`
- 前端工程师必须基于 `warning-card-feature` 拉取代码

### 2.2 分支规范

前端工程师不得直接在 `warning-card-feature` 上开发，必须新建个人功能分支。

推荐命名：

```bash
feat/frontend-app
feat/taro-frontend
feat/h5-integration
```

创建方式：

```bash
git checkout warning-card-feature
git pull origin warning-card-feature
git checkout -b feat/frontend-app
```

### 2.3 提交规范

建议采用以下提交前缀：

```text
feat(frontend):
fix(frontend):
refactor(frontend):
docs(frontend):
style(frontend):
```

### 2.4 合并规范

- 前端工程师完成开发后，将个人分支 push 到远程
- 不直接覆盖 `warning-card-feature`
- 由项目主负责人拉取该分支，在本地整合、联调和验收

---

## 3. 开发边界

### 3.1 当前可直接联调的接口

本轮真实后端依赖共 6 个接口：

1. `GET /health`
2. `POST /ingest/upload`
3. `GET /ingest/items`
4. `GET /ingest/export`
5. `GET /ingest/warnings`
6. `GET /ingest/export-warnings`

### 3.2 当前禁止默认依赖的后端能力

前端不得假设以下能力已经存在：

1. 用户登录态
2. 项目列表接口
3. 项目详情接口
4. 行程保存接口
5. 拖拽排序持久化接口
6. 地图路径规划接口
7. 视频解析接口
8. 预算统计接口
9. 封面图、缩略图资源接口

### 3.3 允许的前端占位策略

对于 PRD 中存在但后端未实现的内容，允许采用：

1. 本地 mock 数据
2. 静态页面占位
3. 功能灰置
4. 文案提示“待后端接口接入”

但不得伪装成已经接通后端的真实能力。

---

## 4. 当前后端能力说明

### 4.1 当前真实链路

`图片 / PDF -> 本地 Tesseract OCR -> DeepSeek 结构化 -> 字段清洗 -> 入库去重 -> warning 匹配 -> MySQL`

### 4.2 上传响应特点

上传成功后，后端会返回：

1. OCR 原文 `extracted_text`
2. 模型抽取总数 `item_count`
3. 实际新入库数 `saved_count`
4. 去重数量 `deduplicated_count`
5. warning 命中数 `warning_count`
6. 新增 warning 数 `warning_saved_count`
7. 本次新增结构化结果 `items`
8. 本次命中的 warning 结果 `warnings`

### 4.3 必须理解的后端行为

1. 同一图片重复上传时，可能返回 `saved_count = 0`
2. `saved_count = 0` 不代表失败，可能只是全部命中去重
3. warning 命中依赖 `category + name`
4. OCR 原文可能存在噪声
5. 地点字段可能由模型补全，不保证绝对精确

---

## 5. 接口接入规范

### 5.1 健康检查

```http
GET /health
```

前端要求：

1. 应用启动后自动调用一次
2. 健康检查失败时，禁止进入上传主流程
3. 页面必须展示：`service`、`extraction_backend`、`structuring_model`、`database_configured`

### 5.2 上传接口

```http
POST /ingest/upload
Content-Type: multipart/form-data
```

字段：

1. `file` 必填
2. `context_text` 选填

前端要求：

1. 前端先做文件类型校验
2. 前端先做文件大小校验
3. 上传中禁止重复点击
4. 必须展示处理中状态
5. 必须展示成功、失败、去重、warning 四类结果反馈

### 5.3 结构化结果查询

```http
GET /ingest/items?limit=100&category=景点&keyword=博物馆
```

规范：

1. `limit`：`1-500`
2. `category`：`景点/饮食/交通/住宿`
3. `keyword`：字符串

### 5.4 结构化结果导出

```http
GET /ingest/export?format=json&limit=100
GET /ingest/export?format=csv&limit=100
```

### 5.5 warning 结果查询

```http
GET /ingest/warnings?limit=100&category=景点&keyword=灵隐寺
```

规范：

1. `limit`：`1-500`
2. `category`：`景点/饮食/交通/住宿`
3. `keyword`：可命中 `name/location/summary/warning_summary`

### 5.6 warning 结果导出

```http
GET /ingest/export-warnings?format=json&limit=100
GET /ingest/export-warnings?format=csv&limit=100
```

---

## 6. 数据模型规范

### 6.1 上传返回模型

```ts
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

### 6.2 结构化记录模型

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
```

### 6.3 warning 记录模型

```ts
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
```

### 6.4 前端处理约束

1. 所有时间字段按字符串处理
2. 前端不回写 `id / created_at / updated_at`
3. 前端不自己拼接结构化记录写回数据库
4. warning 列表和 warning 导出必须共用一套筛选状态源

---

## 7. 错误处理规范

必须处理的状态码：

- `400`：上传文件为空
- `413`：文件过大
- `415`：文件类型不支持
- `500`：后端处理失败
- 网络错误：服务未启动、端口不通、跨域失败

建议前端提示：

- `400`：`上传文件为空，请重新选择文件`
- `413`：`文件过大，当前限制为 50MB`
- `415`：`仅支持 PNG/JPG/JPEG/WEBP/PDF`
- `500`：`处理失败，请稍后重试`
- 网络错误：`无法连接后端服务，请检查本地联调环境`

开发环境建议保留接口失败日志，并打印请求 URL、参数和错误体。

---

## 8. 代码组织规范

推荐目录：

```text
frontend/
├─ src/
│  ├─ api/
│  ├─ pages/
│  ├─ components/
│  ├─ types/
│  ├─ hooks/
│  ├─ store/
│  └─ utils/
```

代码要求：

1. 不在页面里直接写裸请求
2. 不在多个页面重复定义接口类型
3. 不把接口地址写死在组件中
4. 上传、查询、导出必须走统一 API 层
5. 结构化结果和 warning 结果必须分别有独立列表组件或独立视图

---

## 9. 环境配置规范

H5 / Vite 建议：

```env
VITE_API_BASE_URL=http://127.0.0.1:8011
```

Taro 建议：

```env
TARO_APP_API_BASE_URL=http://127.0.0.1:8011
```

严禁提交：

1. `.env.local`
2. 带真实地址或 token 的私有配置
3. 本机缓存文件
4. 打包产物

---

## 10. 联调规范

联调顺序：

1. `GET /health`
2. `POST /ingest/upload`
3. `GET /ingest/items`
4. `GET /ingest/warnings`
5. `GET /ingest/export`
6. `GET /ingest/export-warnings`

统一优先使用：

- `mock_pics/`

联调成功判定：

- 上传链路：接口返回 `status=success`，页面展示 `items` 和 `warnings`
- 查询链路：结构化列表与 warning 列表都可筛选
- 导出链路：结构化导出与 warning 导出都可下载或落盘

---

## 11. 自测规范

### 功能自测

- [ ] 首页可完成健康检查
- [ ] 上传页可选择图片 / PDF
- [ ] 上传成功后可跳转结果页
- [ ] 结果页可展示 `saved_count`
- [ ] 结果页可展示 `deduplicated_count`
- [ ] 结果页可展示 `warning_count`
- [ ] 结果页可展示 `warning_saved_count`
- [ ] OCR 原文可查看
- [ ] 历史结构化结果可按分类筛选
- [ ] 历史 warning 结果可按分类筛选
- [ ] JSON 导出可用
- [ ] CSV 导出可用
- [ ] warning JSON / CSV 导出可用

### 异常自测

- [ ] 非法文件格式会被前端拦截
- [ ] 超大文件会被前端拦截
- [ ] 后端关闭时有错误提示
- [ ] 上传失败时有重试机制或返回入口

### 分支自测

- [ ] `git status` 干净后再提交
- [ ] 未提交真实密钥
- [ ] 未提交本机私有配置
- [ ] 未修改不必要的后端文件

---

## 12. 提交给项目负责人的交付要求

前端工程师提交代码时，必须同时交付：

1. 前端分支名称
2. 启动方式
3. 环境变量说明
4. 已完成页面清单
5. 已联调接口清单
6. 未完成项清单
7. 已知问题清单

建议在前端分支附带一个简短说明文档，例如：

```text
frontend/README.md
```

---

## 13. 最终交付标准

只有满足以下条件，才视为前端开发阶段完成：

1. 前端代码在独立分支完成
2. 不污染 `warning-card-feature`
3. 可在本地启动
4. 可联通当前 6 个真实后端接口
5. 页面可以完成上传、结构化结果查看、warning 结果查看、历史查询、导出
6. 自测清单已完成
7. 交接说明已写明

---

## 14. 参考文档

- [frontend_integration_delivery.md](file:///d:/Dev/projects/dy-hackathon/frontend_integration_delivery.md)
- [README.md](file:///d:/Dev/projects/dy-hackathon/ocr-service/README.md)
- [WARNING_API.md](file:///d:/Dev/projects/dy-hackathon/ocr-service/WARNING_API.md)
- [main.py](file:///d:/Dev/projects/dy-hackathon/ocr-service/app/main.py)
- [ingest.py](file:///d:/Dev/projects/dy-hackathon/ocr-service/app/routers/ingest.py)
- [ingest_service.py](file:///d:/Dev/projects/dy-hackathon/ocr-service/app/services/ingest_service.py)
- [warning_service.py](file:///d:/Dev/projects/dy-hackathon/ocr-service/app/services/warning_service.py)

---

## 15. 一句话要求

前端工程师必须以 `warning-card-feature` 为基线、新开分支开发，只围绕当前已实现的后端能力交付一个能真实跑通的 MVP 前端，不得按完整 PRD 擅自扩张为未实现的产品范围。
