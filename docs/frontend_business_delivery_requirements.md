# 前端业务交付要求

> 适用对象：负责重新设计页面的前端工程师
>
> 目标：交付一套可直接接入当前后端、可由项目负责人直接拉取整合、可运行成可用 APP/H5 的业务前端代码。
>
> 说明：本文件**不约束页面设计、功能构成、页面跳转逻辑、视觉风格**，只约束最低交付标准、接口接入要求和整合可用性。

---

## 1. 交付目标

前端交付必须满足以下结果：

1. 可以直接连接当前后端服务。
2. 可以完成单文件上传。
3. 可以展示结构化结果卡片。
4. 可以展示 warning 卡片。
5. 可以查询历史结构化结果。
6. 可以查询历史 warning 结果。
7. 可以导出 JSON / CSV。
8. 项目负责人拉取代码后，无需重做接口层，即可继续整合和联调。

---

## 2. 唯一真实后端范围

当前前端只允许依赖以下 6 个真实接口：

1. `GET /health`
2. `POST /ingest/upload`
3. `GET /ingest/items`
4. `GET /ingest/export`
5. `GET /ingest/warnings`
6. `GET /ingest/export-warnings`

前端不得默认依赖以下不存在的接口：

1. 登录
2. 用户信息
3. 项目列表
4. 项目详情
5. 行程保存
6. 拖拽持久化
7. 地图路线
8. 视频解析
9. 预算统计
10. 图片资源服务

如设计稿中包含这些内容，只允许：

1. 纯前端静态展示
2. 本地 mock 占位
3. 灰置
4. 标注“待后端接入”

不得伪装成已经接通真实后端。

---

## 3. 必须实现的业务能力

前端必须真实接通以下能力：

### 3.1 健康检查

- 启动后自动请求 `GET /health`
- 能识别服务可用 / 不可用
- 能识别 `database_configured`
- 健康检查失败时，上传主流程必须被阻止

### 3.2 文件上传

- 上传方式必须使用 `multipart/form-data`
- 文件字段名必须是 `file`
- 可选文本字段名必须是 `context_text`
- 只要求支持单文件上传
- 支持类型：`png`、`jpg`、`jpeg`、`webp`、`pdf`
- 需要基础前端校验：
  - 文件类型
  - 文件大小
  - 重复点击防抖
  - 上传中状态

### 3.3 上传结果展示

上传成功后，前端必须能消费并展示以下字段：

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

### 3.4 结构化结果展示

前端必须能渲染 `items` 和历史 `GET /ingest/items` 返回结果。

每条结构化记录至少正确处理：

- `id`
- `category`
- `name`
- `location`
- `summary`
- `created_at`
- `updated_at`

### 3.5 warning 结果展示

前端必须能渲染上传返回的 `warnings` 和历史 `GET /ingest/warnings` 返回结果。

每条 warning 记录至少正确处理：

- `id`
- `structured_item_id`
- `warning_source_id`
- `category`
- `name`
- `location`
- `summary`
- `warning_summary`
- `avoid_reasons`
- `execution_tips`
- `alternatives`
- `confirm_before_go`
- `matched_by`
- `created_at`
- `updated_at`

### 3.6 历史查询

前端必须支持：

- 结构化结果历史查询
- warning 结果历史查询
- `category` 筛选
- `keyword` 检索

### 3.7 导出

前端必须支持：

- `GET /ingest/export?format=json`
- `GET /ingest/export?format=csv`
- `GET /ingest/export-warnings?format=json`
- `GET /ingest/export-warnings?format=csv`

导出必须沿用当前筛选条件。

---

## 4. 数据协议要求

### 4.1 分类枚举

前后端统一只允许以下类别值：

```ts
type Category = "景点" | "饮食" | "交通" | "住宿";
```

前端不得向后端发送以下值：

- `餐饮`
- `美食`
- `出行`
- `酒店`

如果 UI 需要显示其他文案，只能在展示层映射。

### 4.2 时间字段

前端必须按字符串接收后端时间字段，格式按 ISO 8601 处理。

前端只允许在展示层格式化时间，不得修改原始值结构。

### 4.3 warning 数组字段

以下字段必须按 `string[]` 正确处理：

- `avoid_reasons`
- `execution_tips`
- `alternatives`
- `confirm_before_go`

不得把这些字段当成普通字符串。

### 4.4 去重语义

前端必须正确理解：

- `saved_count = 0` 不一定代表失败
- 若 `deduplicated_count > 0`，可能表示本次识别成功但全部命中去重

不得把这种场景误判为接口错误。

---

## 5. 工程交付最低要求

前端交付必须满足以下工程条件：

### 5.1 必须可本地启动

交付代码后，项目负责人需要能在本地执行：

```bash
npm install
npm run dev
```

或等价命令。

如果不是 `npm`，必须在文档中明确写出替代启动方式。

### 5.2 必须可构建

交付代码后，项目负责人需要能执行：

```bash
npm run build
```

或等价命令。

### 5.3 必须有环境配置说明

至少需要提供：

1. `.env.example` 或同等配置模板
2. 后端 API 基地址配置方式
3. 开发环境和生产环境的区分说明

### 5.4 必须有统一请求层

前端必须存在明确的接口封装层，而不是把 `fetch / axios` 散落在页面文件里。

至少要统一处理：

1. `baseURL`
2. 请求错误
3. 上传请求
4. 查询请求
5. 导出链接构造

### 5.5 必须有明确类型定义

必须提供前端侧的数据模型定义，至少覆盖：

1. `UploadIngestResponse`
2. `StructuredItemRecord`
3. `WarningRecord`
4. 列表查询返回结构
5. 分类枚举

可以使用 `TypeScript`，也可以使用 `JSDoc` / 单独类型文件，但不能完全没有类型约束。

---

## 6. 目录与交付物要求

前端最终至少需要交付以下内容：

1. 可运行前端工程目录
2. `README` 或单独接入说明文档
3. 环境变量模板
4. 接口封装文件
5. 类型定义文件
6. 启动方式说明
7. 构建方式说明
8. 联调说明

建议至少能清晰看到以下层次：

```text
src/
  api/ 或 services/
  types/
  pages/ 或 views/
  components/
  config/ 或 env/
```

文件名和组织方式可自行决定，但必须能让项目负责人快速定位：

- 接口层在哪
- 类型在哪
- 环境配置在哪
- 上传逻辑在哪
- 结构化卡片渲染在哪
- warning 卡片渲染在哪

---

## 7. 联调自测最低标准

前端工程师交付前，必须至少自测以下项目：

### 7.1 健康检查

- 应用启动后能正确请求 `GET /health`
- 服务不可用时前端能给出明确提示

### 7.2 正常上传

- 选择一张合法图片或 PDF 后能正常上传
- 成功后能看到上传返回的结构化条目和 warning 条目

### 7.3 重复上传

- 重复上传相同文件时，前端不会把 `saved_count = 0` 误判为失败

### 7.4 历史查询

- `GET /ingest/items` 查询正常
- `GET /ingest/warnings` 查询正常

### 7.5 导出

- 结构化 JSON 导出正常
- 结构化 CSV 导出正常
- warning JSON 导出正常
- warning CSV 导出正常

### 7.6 错误处理

- 非法文件类型
- 超大文件
- 服务断开
- 后端返回错误信息

以上场景至少要能做到：

1. 不崩溃
2. 有明确提示
3. 可继续操作

---

## 8. 交付给项目负责人的内容

前端工程师交付时，必须一次性提供：

1. 分支名称
2. 启动命令
3. 构建命令
4. 环境变量说明
5. 已接通的真实接口清单
6. 未接通但被静态占位的内容清单
7. 自测结果摘要

建议交付说明采用以下模板：

```md
分支：
启动：
构建：
环境变量：
真实已接接口：
静态占位内容：
已完成功能：
已知问题：
```

---

## 9. 明确禁止项

为避免后续无法整合，前端交付禁止出现以下问题：

1. 只交静态图，不交可运行工程
2. 只有页面，没有接口层
3. 只有 mock，没有真实 API 对接
4. 真实接口和 mock 混用但没有明确隔离
5. 缺少启动方式说明
6. 缺少环境变量说明
7. 缺少上传链路
8. 缺少结构化结果渲染
9. 缺少 warning 结果渲染
10. 依赖未说明的本地私有资源或私有服务

---

## 10. 最终验收标准

只有同时满足以下条件，才视为“业务前端交付合格”：

1. 项目负责人本地拉取代码后可启动
2. 能连接当前后端真实接口
3. 能完成上传
4. 能展示结构化卡片
5. 能展示 warning 卡片
6. 能查询历史结果
7. 能导出 JSON / CSV
8. 对不存在的后端能力没有伪装成真实联通
9. 项目负责人无需重做接口层即可继续整合

---

## 11. 当前后端真实返回模型

前端至少按以下结构接入：

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

---

## 12. 一句话要求

前端工程师只需要保证一件事：

**交付的不是“视觉原型”，而是“项目负责人拉下来就能直接接当前后端继续整合”的业务前端工程。**
