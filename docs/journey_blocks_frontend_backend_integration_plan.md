# 旅程积木前后端整合落地方案

> 适用对象：项目负责人、前端工程师、后端工程师、联调测试工程师
>
> 目标：在已完成分支保护的前提下，将 `origin/codex/journey-blocks-h5-demo` 前端原型与当前 `warning-card-feature` 后端能力整合为可联调、可部署、可回滚的 MVP 系统。

---

## 1. 分支保护与回滚基线

当前已完成双重保护，可在后续任意阶段回到本次分析起点：

- 后端基线分支：`warning-card-feature`
- 后端保护标签：`protect-warning-card-feature-20260606-230659`
- 后端备份分支：`backup/warning-card-feature-20260606-230659`
- 前端原型来源：`origin/codex/journey-blocks-h5-demo`
- 前端保护标签：`protect-codex-journey-blocks-h5-demo-20260606-230009`
- 前端备份分支：`backup/codex-journey-blocks-h5-demo-20260606-230009`

执行建议：

1. 后续整合开发不要直接在 `warning-card-feature` 上修改。
2. 新建整合分支，例如：`integration/journey-blocks-h5-mvp`
3. 所有整合提交必须按模块拆分，确保可追溯。
4. 整合失败时，直接基于上述 tag 或 backup branch 回退。

---

## 2. 前端分支研究结论

## 2.1 分支定位

`origin/codex/journey-blocks-h5-demo` 当前不是已接后端的业务前端，而是一个用于路演和交互演示的 H5 原型分支。

它的核心作用是：

- 用静态参考图模拟产品页面
- 用热点区域模拟点击跳转
- 用本地 toast 模拟用户反馈
- 快速说明“首页 -> 创建项目 -> 项目详情 -> 避雷详情 -> 探索 -> 我的”的交互路径

它当前不具备以下真实业务能力：

- 文件上传
- 网络请求封装
- API 环境变量
- 路由系统
- 状态管理
- 数据模型定义
- 后端联调逻辑
- 构建后的部署环境区分

## 2.2 文件结构

前端分支文件极少，核心仅包括：

- `index.html`
- `package.json`
- `src/main.jsx`
- `src/styles.css`
- `public/ui/*.png`
- `prd-journey-blocks-revised.md`
- `visual-spec-journey-blocks.md`

## 2.3 技术栈

从 `package.json` 可确认：

- 构建工具：`Vite 7`
- UI 框架：`React 19`
- 渲染入口：`react-dom/client`
- 模块规范：`ESM`
- 运行脚本：
  - `npm run dev`
  - `npm run build`
  - `npm run preview`

当前没有引入：

- `react-router-dom`
- `axios`
- `zustand` / `redux`
- `typescript`
- `eslint`
- `vitest`

这说明该分支仍停留在原型验证阶段。

## 2.4 页面与交互实现方式

`src/main.jsx` 的实现可以概括为：

1. 用 `screens` 常量维护 6 张页面参考图
2. 用 `useState(screen)` 控制当前展示哪一张图
3. 用 `Hotspot` 按百分比坐标覆盖可点击区域
4. 用 `toast` 模拟“预览路线 / 智能优化 / 导出攻略 / 复制模板”等操作反馈

已确认页面：

- `home`
- `create`
- `detail`
- `risk`
- `explore`
- `mine`

结论：

- 当前前端页面结构可保留
- 当前交互热区可作为真实组件拆分的视觉蓝本
- 当前代码不能直接承担业务联调，需要重构为“真实页面组件 + API 层 + 状态层”

## 2.5 样式与视觉体系

`src/styles.css` 显示它当前采用：

- 单屏手机比例画布
- 参考图铺满展示
- 绝对定位热点按钮
- 固定 toast 反馈

这套样式适合：

- 演示视觉方案
- 做第一版组件拆分参照

这套样式不适合直接进入真实业务：

- 没有表单样式体系
- 没有列表/卡片组件体系
- 没有响应式业务布局
- 没有空态/错误态/加载态规范

## 2.6 接口调用规范现状

前端分支当前没有真实接口调用规范，因为它根本没有请求层。

当前缺失项包括：

- `baseURL` 规范
- 请求超时
- 上传封装
- 统一错误处理
- 查询参数构造
- 导出文件处理
- 开发/生产环境配置

## 2.7 数据交互格式现状

前端分支当前没有真实数据模型，只存在静态图片和本地状态。

因此整合时必须补齐：

- 上传响应类型
- 结构化结果类型
- warning 结果类型
- 分类枚举
- 导出参数类型
- 筛选状态类型

## 2.8 部署配置现状

前端分支当前只有 Vite 默认开发/构建脚本，说明：

- 本地开发可直接跑 H5
- 可以构建静态产物
- 没有反向代理配置
- 没有 `.env.*` 环境文件
- 没有和后端部署联动的配置说明

因此它适合作为前端视觉原型起点，但不适合作为直接上线分支。

---

## 3. 后端基线研究结论

当前真实后端基线为 `warning-card-feature`，能力已经闭环。

## 3.1 技术架构

- 框架：`FastAPI`
- ORM：`SQLAlchemy`
- 数据库：`MySQL`
- OCR：本地 `Tesseract OCR`
- 结构化：`DeepSeek API`
- 部署方式：本机 Python 服务启动

## 3.2 数据表

当前核心表有 3 张：

1. `travel_structured_items`
2. `travel_warning_sources`
3. `travel_warning_items`

## 3.3 已开放 API

- `GET /health`
- `POST /ingest/upload`
- `GET /ingest/items`
- `GET /ingest/export`
- `GET /ingest/warnings`
- `GET /ingest/export-warnings`

## 3.4 已实现行为

- 单文件上传
- 文件类型校验
- 上传大小校验
- OCR 提取
- LLM 结构化
- 字段清洗
- 去重
- warning 匹配
- JSON / CSV 导出

## 3.5 后端关键约束

- 上传使用 `multipart/form-data`
- 文件字段名固定为 `file`
- `context_text` 可选
- 分类只允许：`景点 / 饮食 / 交通 / 住宿`
- 去重规则：`category + name + location`
- warning 命中规则：`category + name`
- 当前不是异步任务模式
- 当前无用户体系和项目体系

## 3.6 部署现状

当前后端运行前提：

- 配置 MySQL 连接串
- 配置 DeepSeek Key
- 本机安装 Tesseract
- 通过 `uvicorn app.main:app` 启动

后端已内置 CORS 中间件，但具体 `allow_origins` 依赖环境配置。

---

## 4. 前后端整合核心判断

本次整合不是“把一个已有前端接到后端”，而是：

1. 保留前端原型分支的产品页面结构和视觉方向
2. 在新的整合分支里把静态原型重构成真实业务页面
3. 用当前后端 6 个真实接口承接 MVP 的上传、查询、warning、导出能力
4. 对 PRD 中超出后端现状的内容采用 mock、灰置或说明性占位

整合后的 MVP 建议边界：

- 接入：健康检查、单文件上传、结构化结果、warning 结果、结构化导出、warning 导出
- 保留展示：首页、创建项目、项目详情、避雷详情、探索、我的
- 仅做前端占位：项目管理、路线拖拽保存、智能优化、探索模板复制、我的项目资产沉淀

---

## 5. 推荐整合架构

建议前端整合后按下述方式重构：

```text
frontend/
├─ src/
│  ├─ app/
│  │  ├─ routes/
│  │  ├─ providers/
│  │  └─ store/
│  ├─ pages/
│  │  ├─ HomePage
│  │  ├─ CreateProjectPage
│  │  ├─ ProjectDetailPage
│  │  ├─ WarningDetailPage
│  │  ├─ ExplorePage
│  │  └─ MinePage
│  ├─ components/
│  │  ├─ upload/
│  │  ├─ cards/
│  │  ├─ warnings/
│  │  ├─ common/
│  │  └─ feedback/
│  ├─ services/
│  │  ├─ http.ts
│  │  ├─ ingest.ts
│  │  └─ exporters.ts
│  ├─ types/
│  │  ├─ ingest.ts
│  │  └─ warning.ts
│  └─ config/
│     └─ env.ts
```

重构原则：

1. 先保页面信息架构，再替换为真实组件
2. 先接通后端主链路，再恢复原型中的体验细节
3. 先保证上传和结果页可跑通，再扩展探索/我的等外围页面

---

## 6. 接口适配改造要点

## 6.1 页面与接口映射

| 页面 | 当前原型状态 | 实际整合动作 | 依赖接口 |
| --- | --- | --- | --- |
| 首页 `home` | 静态入口页 | 增加健康检查、最近结果入口、上传入口 | `GET /health` |
| 创建项目 `create` | 静态弹层 | 改为真实上传表单页 | `POST /ingest/upload` |
| 项目详情 `detail` | 静态详情图 | 改为结构化结果 + warning 汇总页 | `POST /ingest/upload`、`GET /ingest/items`、`GET /ingest/warnings` |
| 避雷详情 `risk` | 静态详情图 | 改为 warning 详情组件 | `GET /ingest/warnings` |
| 探索 `explore` | 静态模板页 | 保留为视觉展示页，数据先 mock | 无强依赖 |
| 我的 `mine` | 静态我的页 | 保留本地态展示，可挂最近一次查询结果 | `GET /ingest/items` |

## 6.2 必须新增的前端能力

- `apiClient`：统一 `baseURL`、超时、错误拦截
- `uploadService`：统一 `FormData` 上传
- `queryService`：统一结构化与 warning 列表查询
- `exportService`：统一 JSON / CSV 下载
- `type definitions`：和后端返回字段对齐
- `loading / empty / error` 组件
- `long task hint`：上传处理中提示 10s-20s 等待

## 6.3 上传接口改造

前端需要从“点热点切详情”改为“真实上传后进入结果页”。

建议交互：

1. 用户选择图片/PDF
2. 可选输入 `context_text`
3. 点击“创建并解析”
4. 前端展示处理中状态
5. 成功后跳转项目详情页，并用本次返回数据渲染

## 6.4 详情页改造

详情页应拆成 4 个真实信息区：

1. 上传结果摘要区
2. 结构化结果区
3. warning 结果区
4. 导出操作区

原型中的“预览路线”“智能优化”“导出攻略”“更多设置”建议处理为：

- `预览路线`：前端本地预览占位
- `智能优化`：标记为待后端接入
- `导出攻略`：真实接 `/ingest/export` 和 `/ingest/export-warnings`
- `更多设置`：仅保留菜单 UI

## 6.5 warning 详情改造

`risk` 页不应再是静态截图，而应支持：

- warning 标题
- `warning_summary`
- `avoid_reasons`
- `execution_tips`
- `alternatives`
- `confirm_before_go`

若没有命中 warning：

- 展示空态
- 提示“当前结果未命中避雷库”

---

## 7. 数据格式统一规则

为避免前后端联调反复返工，必须统一以下规则。

## 7.1 分类枚举

前后端统一只允许：

```ts
type Category = "景点" | "饮食" | "交通" | "住宿";
```

禁止前端继续使用：

- `餐饮`
- `美食`
- `出行`
- `酒店`

如需展示同义词，只允许在 UI 层做文案映射，传输层必须使用标准枚举。

## 7.2 时间字段

- 全部使用 ISO 8601 字符串
- 前端只在展示层做本地格式化
- 前端禁止反向传回格式化后的中文时间串

## 7.3 上传返回结构

前端必须以 `UploadIngestResponse` 为准：

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

## 7.4 结构化记录规则

- `name`、`location`、`summary` 一律按字符串处理
- `summary` 允许前端截断展示，但详情必须展示全文
- 前端不自行推断是否重复，以服务端统计为准

## 7.5 warning 记录规则

- `warning_summary` 作为主展示文案
- `avoid_reasons`、`execution_tips`、`alternatives`、`confirm_before_go` 一律按字符串数组处理
- 若数组为空，前端显示为空态而不是隐藏整个 warning 卡片

## 7.6 导出规则

- `format=json`：按 JSON 响应处理
- `format=csv`：按文件下载处理
- 导出筛选参数必须与当前列表筛选一致

---

## 8. 跨域问题解决方案

当前后端已接入 `CORSMiddleware`，但整合时必须把环境区分清楚。

## 8.1 开发环境推荐方案

优先方案：

1. 前端 Vite dev server 端口固定，例如 `5173`
2. 后端 FastAPI 端口固定 `8011`
3. 后端 `.env` 中配置：
   - `OCR_CORS_ORIGINS=http://127.0.0.1:5173,http://localhost:5173`

这样前端可以直接跨域访问后端。

## 8.2 更稳的本地联调方案

如需减少浏览器跨域问题，前端开发环境可增加 Vite 代理：

```ts
server: {
  proxy: {
    "/api": {
      target: "http://127.0.0.1:8011",
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, "")
    }
  }
}
```

此时前端统一请求 `/api/health`、`/api/ingest/upload`。

## 8.3 生产环境方案

生产建议使用同域反向代理：

- `Nginx` 代理 `/api/*` 到 FastAPI
- 前端静态资源和 API 共用一个主域

优点：

- 减少跨域和 Cookie 策略复杂度
- 便于后续扩展鉴权
- 导出下载更稳定

## 8.4 上传接口特别注意

对于 `multipart/form-data`：

- 前端不要手动写死 `Content-Type`
- 让浏览器自动附带 boundary
- 否则 FastAPI 会无法解析文件

---

## 9. 联调测试流程

## 9.1 联调前准备

后端先确认：

1. `GET /health` 返回 `status=ok`
2. `database_configured=true`
3. warning 种子表已自动同步

前端先确认：

1. `npm install` 成功
2. `npm run dev` 正常启动
3. `VITE_API_BASE_URL` 或代理已配置

## 9.2 联调顺序

建议严格按以下顺序推进：

1. 健康检查联通
2. 文件上传成功
3. 上传返回结果页渲染
4. 结构化历史查询联通
5. warning 历史查询联通
6. JSON 导出联通
7. CSV 导出联通
8. 空态、错误态、去重态验证

## 9.3 联调测试清单

### 用例 A：健康检查

- 输入：打开首页
- 期望：显示服务可用、模型名称、OCR 后端、数据库已配置

### 用例 B：正常上传图片

- 输入：一张有效旅游截图
- 期望：
  - 上传成功
  - 展示 `item_count`
  - 展示 `saved_count`
  - 展示 `warnings`

### 用例 C：重复上传

- 输入：重复上传同一张图
- 期望：
  - `saved_count` 可能为 `0`
  - `deduplicated_count > 0`
  - 页面提示“识别成功但数据已存在”

### 用例 D：未命中 warning

- 输入：不在 warning 源中的地点
- 期望：
  - `warning_count = 0`
  - warning 区显示空态

### 用例 E：CSV 导出

- 输入：点击结构化导出 / warning 导出
- 期望：
  - 浏览器成功下载文件
  - 文件名正确
  - 内容与当前筛选一致

### 用例 F：非法文件

- 输入：上传非图片/PDF
- 期望：
  - 收到 `415`
  - 页面展示明确错误提示

### 用例 G：超大文件

- 输入：超过大小限制的文件
- 期望：
  - 收到 `413`
  - 页面提示文件过大

## 9.4 联调记录要求

每次联调至少记录：

- 前端分支名
- 后端分支名
- 后端 tag
- API 基地址
- 测试文件名
- 成功/失败现象
- 请求与响应截图或日志

---

## 10. 部署协同机制

## 10.1 开发环境协同

建议分工：

- 前端工程师：负责 H5 页面、请求层、状态层、展示层
- 后端工程师：负责 API、CORS、环境变量、数据库可用性
- 项目负责人：负责整合验收与最终合并

## 10.2 测试环境协同

建议准备：

- 一套固定 MySQL 测试库
- 一套固定 `.env.test`
- 一批固定测试素材
- 一份固定 warning 命中样例

## 10.3 生产部署建议

推荐部署结构：

```text
Nginx
├─ /           -> 前端静态资源
└─ /api/*      -> FastAPI 8011

FastAPI
└─ MySQL
```

前端部署产物：

- `npm run build` 生成静态文件

后端部署动作：

1. 配置 `.env`
2. 确保 MySQL 可访问
3. 确保 Tesseract 路径可用
4. 启动 `uvicorn`
5. 验证 `/health`

## 10.4 发布前验证

上线前必须完成：

1. 健康检查通过
2. 图片上传通过
3. PDF 上传通过
4. warning 命中样例通过
5. JSON 导出通过
6. CSV 导出通过
7. 跨域验证通过
8. 回滚 tag 已创建

---

## 11. 版本可控与可追溯机制

## 11.1 分支策略

建议后续采用以下协作方式：

1. `warning-card-feature` 继续作为后端稳定基线
2. 新建 `integration/journey-blocks-h5-mvp` 作为整合主分支
3. 前端若需独立开发，再从整合分支切 `feat/frontend-real-pages`
4. 后端如需补接口，从整合分支切 `feat/backend-adapter`

## 11.2 提交规范

建议提交前缀：

- `feat(frontend):`
- `feat(api):`
- `fix(integration):`
- `docs(integration):`
- `test(integration):`

## 11.3 合并规范

- 一次 PR 只解决一类问题
- UI 重构和接口适配尽量分开
- 导出、上传、warning 三条主链路必须分别有提交记录

## 11.4 回滚机制

如整合失败：

1. 代码回滚到 `protect-warning-card-feature-20260606-230659`
2. 前端原型回看 `protect-codex-journey-blocks-h5-demo-20260606-230009`
3. 若数据库结构被破坏，使用备份库恢复
4. 若仅前端页面有问题，保留后端不动，回退整合分支即可

---

## 12. 分阶段实施计划

## 阶段 1：建立整合分支

- 从 `warning-card-feature` 切出 `integration/journey-blocks-h5-mvp`
- 把前端原型关键资源和页面结构引入整合分支
- 不改后端业务逻辑

## 阶段 2：前端真实化重构

- 将热点图页拆成真实 React 页面
- 补请求层、类型层、环境配置
- 打通健康检查和上传

## 阶段 3：结果页接通

- 接通结构化结果
- 接通 warning 结果
- 接通 JSON / CSV 导出

## 阶段 4：联调与稳定性处理

- 处理跨域
- 处理超时、去重、空态、错误态
- 完成联调记录与测试清单

## 阶段 5：发布验收

- 打 tag
- 备份分支
- 交付测试环境
- 完成最终验收

---

## 13. 最终结论

本次研究结论非常明确：

1. 前端新上传分支是静态 H5 原型，不是可直接联后端的成品。
2. 当前后端 `warning-card-feature` 已具备可联调的真实能力。
3. 最合理的落地方式不是直接硬接原型，而是在受保护的新整合分支内，将原型页面重构为真实业务页。
4. 本轮 MVP 完全可以实现“上传 -> OCR -> 结构化 -> warning -> 查询 -> 导出”的顺畅闭环。
5. 只要遵守本方案中的分支策略、数据规则、跨域配置、联调顺序和部署机制，整合过程将保持版本可控、问题可追溯、失败可回滚。
