# chai-travel-ui

旅拆拆前端业务交付版。当前项目在保留原始高保真设计稿视觉风格的基础上，已补齐真实接口层、环境配置、类型定义、上传链路、历史查询、warning 展示与 JSON/CSV 导出能力，可直接对接工作区中的 `ocr-service`。

## 技术栈

- React 19
- TypeScript
- Vite
- Tailwind CSS 4

## 启动

1. 安装依赖

```bash
npm install
```

2. 复制环境变量模板

```bash
cp .env.example .env
```

Windows PowerShell 可用：

```powershell
Copy-Item .env.example .env
```

3. 启动开发环境

```bash
npm run dev
```

## 构建

```bash
npm run build
```

## 环境变量

`.env.example` 提供了最小配置模板：

```env
VITE_API_BASE_URL=http://127.0.0.1:8011
VITE_API_PROXY_TARGET=
VITE_MAX_UPLOAD_MB=50
```

说明：

- `VITE_API_BASE_URL`：前端直接请求的后端基地址，推荐在开发和生产环境都显式配置。
- `VITE_API_PROXY_TARGET`：可选，仅开发环境使用；若配置后，Vite 会把 `/health` 和 `/ingest/*` 代理到该地址。
- `VITE_MAX_UPLOAD_MB`：前端上传前校验的最大文件体积，默认与当前后端 `50 MB` 保持一致。

## 真实已接接口

当前前端真实接入以下 6 个接口：

- `GET /health`
- `POST /ingest/upload`
- `GET /ingest/items`
- `GET /ingest/export`
- `GET /ingest/warnings`
- `GET /ingest/export-warnings`

## 页面说明

### 已真实接入

- `/travel-unpack`
  - 保留原设计稿首页视觉
- `/travel-unpack/new-project`
  - 单文件上传
  - `multipart/form-data`
  - `file` / `context_text` 字段
  - 文件类型、文件大小、重复点击、上传中状态校验
- `/travel-unpack/detail`
  - 展示真实上传返回的摘要、抽取文本、结构化结果、warning 列表
  - 也可从历史查询结果兜底进入
- `/travel-unpack/risk-detail`
  - 展示真实 `WarningRecord`
  - 正确渲染 `avoid_reasons`、`execution_tips`、`alternatives`、`confirm_before_go`

### 静态占位

- `/travel-unpack/explore`
- `/travel-unpack/profile`

以上页面仍保留设计稿内容，但 UI 中已明确标注“静态占位，待后端接入”。

## 工程结构

```text
src/
  api/
    http.ts
    ingest.ts
  components/
    BusinessUi.tsx
    TravelUi.tsx
  config/
    env.ts
  pages/
  types/
    domain.ts
  utils/
    format.ts
    storage.ts
```

## 联调说明

1. 先启动后端 `ocr-service`
2. 确认 `GET /health` 返回 `status = ok`
3. 若 `database_configured = false`，前端会阻止上传主流程
4. 上传支持 `png / jpg / jpeg / webp / pdf`
5. 上传成功后会跳转到详情页，展示：
   - `status`
   - `file_name`
   - `file_type`
   - `extracted_text`
   - `item_count`
   - `saved_count`
   - `deduplicated_count`
   - `warning_count`
   - `warning_saved_count`
   - `items`
   - `warnings`
6. 导出会沿用当前筛选条件

## 已知实现边界

- 当前后端不存在项目详情、用户体系、拖拽持久化、地图路线等接口，因此对应设计稿能力未伪装为真实接通。
- 详情页在没有专门详情接口的前提下，优先消费最近一次上传快照，其次用历史查询结果兜底。
- 探索页和我的页暂未接后端，只做静态展示。

## 自测建议

- 应用启动后请求 `GET /health`
- 服务不可用时首页与上传页能给出明确提示
- 合法图片或 PDF 可正常上传
- 上传成功后详情页可展示结构化条目和 warning 条目
- `saved_count = 0` 且 `deduplicated_count > 0` 时不会误判为失败
- `GET /ingest/items` 与 `GET /ingest/warnings` 查询正常
- JSON / CSV 导出链接正常
- 非法文件类型、超大文件、服务断开时页面不崩溃
