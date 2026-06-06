# 前端开发技术规范

> 适用对象：接手本项目的前端开发工程师
>
> 目标：基于当前仓库已实现的后端能力，在独立分支完成前端开发、联调、自测与提交，最终由项目主负责人拉回本地进行整合。

---

## 1. 开发目标

本轮前端开发的目标是交付一个可联调、可运行、可演示的前端 MVP，结合已有的后端agent能力，实现信息上传、模块化信息、生成卡片等功能。

本轮必须围绕以下真实能力开发：

1. 服务健康检查
2. 图片 / PDF 上传
3. OCR 与结构化结果展示
4. 历史结果查询
5. 分类筛选与关键词检索
6. JSON / CSV 导出
7. 基础异常提示与重试机制
8. 生成卡片功能

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

- 后端当前稳定协作基线分支：`train-agent`
- 前端工程师必须基于 `train-agent` 拉取代码

### 2.2 分支规范

前端工程师不得直接在 `train-agent` 上开发，必须新建个人功能分支。

推荐命名：

```bash
feat/frontend-app
feat/taro-frontend
feat/h5-integration
```

创建方式：

```bash
git checkout train-agent
git pull origin train-agent
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

示例：

```text
feat(frontend): 新增上传页与结果页联调
fix(frontend): 修复CSV导出在H5中的下载问题
docs(frontend): 补充前端启动说明
```

### 2.4 合并规范

- 前端工程师完成开发后，将个人分支 push 到远程
- 不直接覆盖 `train-agent`
- 由项目主负责人拉取该分支，在本地整合、联调和验收

---

## 3. 开发边界

### 3.1 当前可直接联调的接口

仅允许以前述 4 个接口为本轮真实后端依赖：

1. `GET /health`
2. `POST /ingest/upload`
3. `GET /ingest/items`
4. `GET /ingest/export`

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
9. 避雷专用结构字段
10. 封面图、缩略图资源接口

### 3.3 允许的前端占位策略

对于 PRD 中存在但后端未实现的内容，允许采用以下方式：

1. 本地 mock 数据
2. 静态页面占位
3. 功能灰置
4. 文案提示“待后端接口接入”

但不得伪装成“已经接通后端”的真实能力。

---

## 4. 当前后端能力说明

### 4.1 服务能力

当前后端真实链路为：

`图片 / PDF -> 本地 Tesseract OCR -> DeepSeek 结构化 -> 字段清洗 -> 入库去重 -> MySQL`

### 4.2 当前响应特点

上传成功后，后端会返回：

1. OCR 原文 `extracted_text`
2. 模型抽取总数 `item_count`
3. 实际新入库数 `saved_count`
4. 去重数量 `deduplicated_count`
5. 本次新增入库结果 `items`

### 4.3 当前结果特点

前端必须理解以下后端行为：

1. 同一图片重复上传时，可能返回 `saved_count = 0`
2. `saved_count = 0` 不代表失败，可能只是全部命中去重
3. OCR 原文可能存在空格断裂、错字和噪声
4. 地点字段可能由模型补全，不保证绝对精确


---

## 6. 接口接入规范

### 6.1 健康检查

#### 请求

```http
GET /health
```

#### 前端要求

1. 应用启动后自动调用一次
2. 健康检查失败时，禁止进入上传主流程
3. 页面必须展示至少以下字段：
   - `service`
   - `extraction_backend`
   - `structuring_model`
   - `database_configured`

### 6.2 上传接口

#### 请求

```http
POST /ingest/upload
Content-Type: multipart/form-data
```

字段：

1. `file` 必填
2. `context_text` 选填

#### 文件限制

支持类型：

1. `png`
2. `jpg`
3. `jpeg`
4. `webp`
5. `pdf`

默认大小上限：

1. `50MB`

#### 前端要求

1. 必须在前端先做文件类型校验
2. 必须在前端先做文件大小校验
3. 上传中禁止重复点击
4. 必须展示处理中状态
5. 必须展示成功、失败、去重三类结果反馈

### 6.3 历史查询接口

#### 请求

```http
GET /ingest/items?limit=100&category=景点&keyword=博物馆
```

#### Query 规范

1. `limit`：`1-500`
2. `category`：`景点/饮食/交通/住宿`
3. `keyword`：字符串

#### 前端要求

1. 分类筛选和关键词搜索必须共享同一状态源
2. 列表查询默认按最新数据展示
3. 当前没有分页接口，前端不要伪造页码请求

### 6.4 导出接口

#### JSON 导出

```http
GET /ingest/export?format=json&limit=100
```

#### CSV 导出

```http
GET /ingest/export?format=csv&limit=100
```

#### 前端要求

1. 导出必须沿用当前筛选条件
2. JSON 导出可直接下载或展示
3. CSV 导出在 H5 端应触发下载，在小程序端可先下载临时文件

---

## 7. 数据模型规范

前端必须以以下字段结构为准，不得擅自变更字段名。

### 7.1 上传返回模型

```ts
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
```

### 7.2 结构化记录模型

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

### 7.3 历史查询模型

```ts
export interface ListStructuredItemsResponse {
  total: number;
  items: StructuredItemRecord[];
}
```

### 7.4 前端处理约束

1. 所有时间字段按字符串处理
2. 前端不回写 `id / created_at / updated_at`
3. 前端不自己拼接新的结构化记录写回数据库
4. 类别文案必须以接口实际返回为准

---


## 9. 错误处理规范

### 9.1 必须处理的状态码

#### 400

- 含义：上传文件为空
- 前端提示：`上传文件为空，请重新选择文件`

#### 413

- 含义：文件过大
- 前端提示：`文件过大，当前限制为 50MB`

#### 415

- 含义：文件类型不支持
- 前端提示：`仅支持 PNG/JPG/JPEG/WEBP/PDF`

#### 500

- 含义：后端处理失败
- 可能原因：
  - Tesseract 不可用
  - DeepSeek Key 不可用
  - 模型返回异常
  - 数据库异常
- 前端提示：`处理失败，请稍后重试`

#### 网络错误

- 含义：服务未启动、端口不通、跨域失败
- 前端提示：`无法连接后端服务，请检查本地联调环境`

### 9.2 调试模式要求

开发环境下建议：

1. 保留接口失败日志
2. 控制台打印请求 URL、参数和错误体
3. 页面允许显示后端 `detail`

生产展示或演示模式下：

1. 不直接暴露原始错误堆栈
2. 统一使用友好错误文案

---

## 10. 代码组织规范

### 10.1 推荐目录

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

### 10.2 模块职责

- `api/`：统一封装接口请求
- `types/`：统一定义接口数据结构
- `pages/`：页面级容器逻辑
- `components/`：可复用视图组件
- `hooks/`：上传、查询、导出等逻辑复用
- `store/`：筛选状态、结果缓存等
- `utils/`：文件校验、下载工具、错误文案映射

### 10.3 代码要求

1. 不在页面里直接写裸请求
2. 不在多个页面重复定义接口类型
3. 不把接口地址写死在组件中
4. 上传、查询、导出必须走统一 API 层
5. 错误提示必须走统一消息组件或统一错误映射函数

---

## 11. 环境配置规范

### 11.1 前端环境变量

H5 / Vite 建议：

```env
VITE_API_BASE_URL=http://127.0.0.1:8016
```

Taro 建议：

```env
TARO_APP_API_BASE_URL=http://127.0.0.1:8016
```

### 11.2 前端不得提交的内容

严禁提交：

1. `.env.local`
2. 带真实地址或 token 的私有配置
3. 本机缓存文件
4. 打包产物

### 11.3 后端联调前置条件

前端联调前必须由主负责人或后端环境提供方保证：

1. `GET /health` 可访问
2. MySQL 正常
3. Tesseract 正常
4. DeepSeek Key 可用

---

## 12. 联调规范

### 12.1 联调顺序

必须按以下顺序联调：

1. `GET /health`
2. `POST /ingest/upload`
3. `GET /ingest/items`
4. `GET /ingest/export`

### 12.2 联调素材

统一优先使用以下目录中的真实测试图片：

- `mock_pics/`

### 12.3 联调成功判定

#### 上传链路成功

满足以下条件即可判定上传链路联通：

1. 接口返回 `status=success`
2. 返回 `items` 数组
3. 页面可展示统计值

#### 查询链路成功

满足以下条件即可判定查询链路联通：

1. 能加载历史记录
2. 分类筛选有效
3. 关键词查询有效

#### 导出链路成功

满足以下条件即可判定导出链路联通：

1. JSON 可下载或可查看
2. CSV 可下载或可落盘

---

## 13. 自测规范

前端在提交分支前，至少完成以下自测：

### 13.1 功能自测

- [ ] 首页可完成健康检查
- [ ] 上传页可选择图片 / PDF
- [ ] 上传成功后可跳转结果页
- [ ] 结果页可展示 `saved_count`
- [ ] 结果页可展示 `deduplicated_count`
- [ ] OCR 原文可查看
- [ ] 历史页可按分类筛选
- [ ] 历史页可按关键词搜索
- [ ] JSON 导出可用
- [ ] CSV 导出可用

### 13.2 异常自测

- [ ] 非法文件格式会被前端拦截
- [ ] 超大文件会被前端拦截
- [ ] 后端关闭时有错误提示
- [ ] 上传失败时有重试机制或返回入口

### 13.3 分支自测

- [ ] `git status` 干净后再提交
- [ ] 未提交真实密钥
- [ ] 未提交本机私有配置
- [ ] 未修改不必要的后端文件

---

## 14. 提交给项目负责人的交付要求

前端工程师提交代码时，必须同时交付以下内容：

1. 前端分支名称
2. 启动方式
3. 环境变量说明
4. 已完成页面清单
5. 已联调接口清单
6. 未完成项清单
7. 已知问题清单

建议在分支中附带一个简短说明文档，例如：

```text
frontend/README.md
```

内容至少包括：

1. 如何安装依赖
2. 如何启动
3. 如何配置 API 地址
4. 如何联调后端
5. 当前哪些页面可演示

---

## 15. 最终交付标准

只有满足以下条件，才视为前端开发阶段完成：

1. 前端代码在独立分支完成
2. 不污染 `train-agent`
3. 可在本地启动
4. 可联通当前 4 个真实后端接口
5. 页面可以完成上传、结果查看、历史查询、导出
6. 自测清单已完成
7. 交接说明已写明

---

## 16. 参考文档

- [frontend_integration_delivery.md](file:///d:/Dev/projects/dy-hackathon/frontend_integration_delivery.md)
- [README.md](file:///d:/Dev/projects/dy-hackathon/ocr-service/README.md)
- [main.py](file:///d:/Dev/projects/dy-hackathon/ocr-service/app/main.py)
- [ingest.py](file:///d:/Dev/projects/dy-hackathon/ocr-service/app/routers/ingest.py)
- [ingest_service.py](file:///d:/Dev/projects/dy-hackathon/ocr-service/app/services/ingest_service.py)
- [schemas.py](file:///d:/Dev/projects/dy-hackathon/ocr-service/app/schemas.py)
- [页面规划.md](file:///d:/Dev/projects/dy-hackathon/页面规划.md)

---

## 17. 一句话要求

前端工程师必须以 `train-agent` 为基线、新开分支开发，只围绕当前已实现的后端能力交付一个能真实跑通的 MVP 前端，不得按完整 PRD 擅自扩张为未实现的产品范围。
