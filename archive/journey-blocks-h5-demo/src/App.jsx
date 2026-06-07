import { useEffect, useMemo, useState } from "react";
import { buildExportUrl, CATEGORY_OPTIONS, fetchHealth, fetchItems, fetchWarnings, uploadFile } from "./api";
import { formatTime, getErrorMessage, INITIAL_FILTERS } from "./utils";

const MAX_FILE_SIZE = 20 * 1024 * 1024;

const SCREENS = {
  home: { src: "/ui/home.png", alt: "旅程积木首页" },
  create: { src: "/ui/create.png", alt: "新建旅行项目" },
  detail: { src: "/ui/detail.png", alt: "项目详情" },
  risk: { src: "/ui/risk.png", alt: "避雷详情" },
  explore: { src: "/ui/explore.png", alt: "探索页" },
  mine: { src: "/ui/mine.png", alt: "我的页" },
};

const HOTSPOTS = {
  home: [
    { label: "打开项目", rect: [5, 21, 90, 41], action: { type: "screen", target: "detail" } },
    { label: "创建项目", rect: [83, 81, 13, 9], action: { type: "screen", target: "create" } },
    { label: "首页", rect: [8, 92, 26, 7], action: { type: "screen", target: "home" } },
    { label: "探索", rect: [37, 92, 26, 7], action: { type: "screen", target: "explore" } },
    { label: "我的", rect: [66, 92, 26, 7], action: { type: "screen", target: "mine" } },
  ],
  create: [
    { label: "关闭创建页", rect: [87, 37, 8, 6], action: { type: "screen", target: "home" } },
    { label: "取消", rect: [7, 86, 31, 7], action: { type: "screen", target: "home" } },
    { label: "创建并解析", rect: [42, 86, 52, 7], action: { type: "upload" } },
  ],
  detail: [
    { label: "返回首页", rect: [4, 6, 8, 6], action: { type: "screen", target: "home" } },
    { label: "打开避雷详情", rect: [48, 43, 30, 7], action: { type: "screen", target: "risk" } },
    { label: "模块避雷详情", rect: [48, 69, 31, 7], action: { type: "screen", target: "risk" } },
    { label: "预览路线", rect: [4, 91, 23, 8], action: { type: "toast", message: "当前仅保留静态预览提示" } },
    { label: "智能优化", rect: [28, 91, 23, 8], action: { type: "toast", message: "智能优化待后端能力接入" } },
    { label: "导出攻略", rect: [52, 91, 23, 8], action: { type: "toast", message: "请使用上方 JSON / CSV 导出" } },
    { label: "更多设置", rect: [76, 91, 20, 8], action: { type: "toast", message: "更多设置暂未接入" } },
  ],
  risk: [
    { label: "关闭避雷详情", rect: [84, 36, 8, 6], action: { type: "screen", target: "detail" } },
    { label: "知道了", rect: [10, 85, 80, 6], action: { type: "screen", target: "detail" } },
    { label: "查看同类避雷", rect: [27, 92, 46, 5], action: { type: "toast", message: "已按当前分类筛选 warning" } },
  ],
  explore: [
    { label: "复制上海模板", rect: [32, 35, 18, 5], action: { type: "toast", message: "模板复制功能暂未接入" } },
    { label: "复制底部模板", rect: [25, 87, 12, 5], action: { type: "toast", message: "模板复制功能暂未接入" } },
    { label: "首页", rect: [8, 94, 26, 6], action: { type: "screen", target: "home" } },
    { label: "探索", rect: [37, 94, 26, 6], action: { type: "screen", target: "explore" } },
    { label: "我的", rect: [66, 94, 26, 6], action: { type: "screen", target: "mine" } },
  ],
  mine: [
    { label: "打开我的项目", rect: [6, 31, 45, 14], action: { type: "screen", target: "detail" } },
    { label: "继续拼路线", rect: [72, 54, 20, 6], action: { type: "screen", target: "detail" } },
    { label: "首页", rect: [8, 94, 26, 6], action: { type: "screen", target: "home" } },
    { label: "探索", rect: [37, 94, 26, 6], action: { type: "screen", target: "explore" } },
    { label: "我的", rect: [66, 94, 26, 6], action: { type: "screen", target: "mine" } },
  ],
};

export default function App() {
  const [activeScreen, setActiveScreen] = useState("home");
  const [toast, setToast] = useState("");

  const [health, setHealth] = useState(null);
  const [healthError, setHealthError] = useState("");
  const [loadingHealth, setLoadingHealth] = useState(true);

  const [selectedFile, setSelectedFile] = useState(null);
  const [contextText, setContextText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadResult, setUploadResult] = useState(null);

  const [itemFilters, setItemFilters] = useState(INITIAL_FILTERS);
  const [warningFilters, setWarningFilters] = useState(INITIAL_FILTERS);
  const [itemsData, setItemsData] = useState({ total: 0, items: [] });
  const [warningsData, setWarningsData] = useState({ total: 0, items: [] });
  const [itemsError, setItemsError] = useState("");
  const [warningsError, setWarningsError] = useState("");
  const [loadingItems, setLoadingItems] = useState(true);
  const [loadingWarnings, setLoadingWarnings] = useState(true);

  function flash(message) {
    setToast(message);
    window.clearTimeout(window.__journeyToast);
    window.__journeyToast = window.setTimeout(() => setToast(""), 1500);
  }

  async function loadHealth() {
    setLoadingHealth(true);
    setHealthError("");
    try {
      const result = await fetchHealth();
      setHealth(result);
    } catch (error) {
      setHealthError(getErrorMessage(error, "服务状态获取失败"));
    } finally {
      setLoadingHealth(false);
    }
  }

  async function loadItems(filters = itemFilters) {
    setLoadingItems(true);
    setItemsError("");
    try {
      const result = await fetchItems(filters);
      setItemsData(result);
    } catch (error) {
      setItemsError(getErrorMessage(error, "结构化结果获取失败"));
    } finally {
      setLoadingItems(false);
    }
  }

  async function loadWarnings(filters = warningFilters) {
    setLoadingWarnings(true);
    setWarningsError("");
    try {
      const result = await fetchWarnings(filters);
      setWarningsData(result);
    } catch (error) {
      setWarningsError(getErrorMessage(error, "避雷结果获取失败"));
    } finally {
      setLoadingWarnings(false);
    }
  }

  useEffect(() => {
    loadHealth();
  }, []);

  useEffect(() => {
    loadItems(itemFilters);
  }, [itemFilters]);

  useEffect(() => {
    loadWarnings(warningFilters);
  }, [warningFilters]);

  async function submitUpload() {
    if (uploading) {
      return;
    }

    if (!selectedFile) {
      setUploadError("请先选择图片或 PDF 文件。");
      setActiveScreen("create");
      return;
    }

    if (!selectedFile.type.includes("image") && selectedFile.type !== "application/pdf") {
      setUploadError("仅支持 png、jpg、jpeg、webp 或 pdf。");
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setUploadError("文件不能超过 20MB。");
      return;
    }

    if (!health?.database_configured) {
      setUploadError("后端服务或数据库未就绪，暂时无法上传。");
      flash("请先确认服务状态正常");
      return;
    }

    setUploading(true);
    setUploadError("");

    try {
      const result = await uploadFile({ file: selectedFile, contextText });
      setUploadResult(result);
      await Promise.all([loadItems(itemFilters), loadWarnings(warningFilters)]);
      flash(`已处理 ${result.item_count} 条内容`);
      setActiveScreen("detail");
    } catch (error) {
      setUploadError(getErrorMessage(error, "上传失败"));
      flash("上传失败");
    } finally {
      setUploading(false);
    }
  }

  function handleUploadSubmit(event) {
    event.preventDefault();
    void submitUpload();
  }

  function handleHotspot(action) {
    if (!action) {
      return;
    }

    if (action.type === "screen") {
      setActiveScreen(action.target);
      return;
    }

    if (action.type === "toast") {
      flash(action.message);
      return;
    }

    if (action.type === "upload") {
      void submitUpload();
    }
  }

  const latestItems = uploadResult?.items?.length ? uploadResult.items : itemsData.items.slice(0, 4);
  const latestWarnings = uploadResult?.warnings?.length ? uploadResult.warnings : warningsData.items.slice(0, 4);

  const itemExportJsonUrl = useMemo(
    () => buildExportUrl("items", { ...itemFilters, format: "json" }),
    [itemFilters],
  );
  const itemExportCsvUrl = useMemo(
    () => buildExportUrl("items", { ...itemFilters, format: "csv" }),
    [itemFilters],
  );
  const warningExportJsonUrl = useMemo(
    () => buildExportUrl("warnings", { ...warningFilters, format: "json" }),
    [warningFilters],
  );
  const warningExportCsvUrl = useMemo(
    () => buildExportUrl("warnings", { ...warningFilters, format: "csv" }),
    [warningFilters],
  );

  return (
    <main className="demo-stage">
      <div className="demo-meta">
        <p className="meta-tag">旅程积木 / 复刻开发版</p>
        <h1>保留原型页面结构，接入真实上传与卡片数据</h1>
        <p className="meta-copy">
          当前版本只开发核心能力：文件上传、结构化卡片、warning 卡片。探索和我的保持静态展示。
        </p>
      </div>

      <ReferenceScreen screen={activeScreen}>
        {activeScreen === "home" ? (
          <HomeOverlay
            health={health}
            healthError={healthError}
            loadingHealth={loadingHealth}
            itemsTotal={itemsData.total}
            warningsTotal={warningsData.total}
            onRefresh={loadHealth}
            onCreate={() => setActiveScreen("create")}
          />
        ) : null}

        {activeScreen === "create" ? (
          <CreateOverlay
            selectedFile={selectedFile}
            contextText={contextText}
            uploadError={uploadError}
            uploading={uploading}
            onFileChange={setSelectedFile}
            onContextChange={setContextText}
            onCancel={() => setActiveScreen("home")}
            onSubmit={handleUploadSubmit}
          />
        ) : null}

        {activeScreen === "detail" ? (
          <DetailOverlay
            uploadResult={uploadResult}
            items={latestItems}
            warnings={latestWarnings}
            itemFilters={itemFilters}
            itemExportJsonUrl={itemExportJsonUrl}
            itemExportCsvUrl={itemExportCsvUrl}
            itemsError={itemsError}
            onItemFilterChange={setItemFilters}
            onOpenRisk={() => setActiveScreen("risk")}
          />
        ) : null}

        {activeScreen === "risk" ? (
          <RiskOverlay
            warnings={warningsData.items}
            warningsTotal={warningsData.total}
            warningFilters={warningFilters}
            warningExportJsonUrl={warningExportJsonUrl}
            warningExportCsvUrl={warningExportCsvUrl}
            warningsError={warningsError}
            loadingWarnings={loadingWarnings}
            onFilterChange={setWarningFilters}
          />
        ) : null}

        {activeScreen === "explore" ? <StaticOverlay title="探索页静态保留" message="当前仅保留设计展示，不接真实业务接口。" /> : null}
        {activeScreen === "mine" ? <StaticOverlay title="我的页静态保留" message="当前仅保留项目入口展示，后续如需接登录与资产体系再扩展。" /> : null}

        {HOTSPOTS[activeScreen].map((hotspot) => (
          <Hotspot
            key={`${activeScreen}-${hotspot.label}`}
            label={hotspot.label}
            rect={hotspot.rect}
            onClick={() => handleHotspot(hotspot.action)}
          />
        ))}
      </ReferenceScreen>

      {toast ? <div className="toast">{toast}</div> : null}
    </main>
  );
}

function ReferenceScreen({ screen, children }) {
  const item = SCREENS[screen];

  return (
    <section className="reference-screen" aria-label={item.alt}>
      <img src={item.src} alt={item.alt} draggable="false" />
      <div className="screen-overlay">{children}</div>
    </section>
  );
}

function HomeOverlay({ health, healthError, loadingHealth, itemsTotal, warningsTotal, onRefresh, onCreate }) {
  return (
    <div className="overlay-card overlay-home">
      <div className="overlay-header">
        <div>
          <span className="overlay-kicker">服务状态</span>
          <h2>{loadingHealth ? "正在检查服务..." : "当前可以直接联调"}</h2>
        </div>
        <button type="button" className="ghost-button" onClick={onRefresh}>
          刷新
        </button>
      </div>
      <div className="mini-stats">
        <Metric label="接口" value={health?.status || "-"} />
        <Metric label="OCR" value={health?.extraction_backend || "-"} />
        <Metric label="数据库" value={health?.database_configured ? "已连通" : "未就绪"} />
      </div>
      {healthError ? <p className="inline-error">{healthError}</p> : null}
      <p className="overlay-copy">当前结构化记录 {itemsTotal} 条，warning 记录 {warningsTotal} 条。</p>
      <div className="overlay-actions">
        <button type="button" className="primary-button" onClick={onCreate}>
          创建并解析
        </button>
      </div>
    </div>
  );
}

function CreateOverlay({
  selectedFile,
  contextText,
  uploadError,
  uploading,
  onFileChange,
  onContextChange,
  onCancel,
  onSubmit,
}) {
  return (
    <form className="overlay-card overlay-create" onSubmit={onSubmit}>
      <div className="overlay-header compact">
        <div>
          <span className="overlay-kicker">上传文件</span>
          <h2>创建项目并解析</h2>
        </div>
      </div>
      <label className="overlay-field">
        <span>攻略文件</span>
        <input
          type="file"
          accept=".png,.jpg,.jpeg,.webp,.pdf"
          onChange={(event) => onFileChange(event.target.files?.[0] || null)}
        />
      </label>
      <label className="overlay-field">
        <span>补充上下文</span>
        <textarea
          rows="5"
          placeholder="可选：补充城市、路线背景、截图来源等信息"
          value={contextText}
          onChange={(event) => onContextChange(event.target.value)}
        />
      </label>
      <div className="file-chip">{selectedFile ? selectedFile.name : "未选择文件"}</div>
      {uploadError ? <p className="inline-error">{uploadError}</p> : null}
      <div className="overlay-actions dual">
        <button type="button" className="ghost-button" onClick={onCancel}>
          取消
        </button>
        <button type="submit" className="primary-button" disabled={uploading}>
          {uploading ? "处理中..." : "创建并解析"}
        </button>
      </div>
    </form>
  );
}

function DetailOverlay({
  uploadResult,
  items,
  warnings,
  itemFilters,
  itemExportJsonUrl,
  itemExportCsvUrl,
  itemsError,
  onItemFilterChange,
  onOpenRisk,
}) {
  return (
    <div className="overlay-card overlay-detail">
      <div className="overlay-header">
        <div>
          <span className="overlay-kicker">项目详情</span>
          <h2>{uploadResult ? uploadResult.file_name : "历史结构化结果"}</h2>
        </div>
        <div className="link-actions">
          <a href={itemExportJsonUrl} target="_blank" rel="noreferrer">
            JSON
          </a>
          <a href={itemExportCsvUrl} target="_blank" rel="noreferrer">
            CSV
          </a>
        </div>
      </div>

      {uploadResult ? (
        <div className="mini-stats">
          <Metric label="识别" value={uploadResult.item_count} />
          <Metric label="入库" value={uploadResult.saved_count} />
          <Metric label="去重" value={uploadResult.deduplicated_count} />
          <Metric label="warning" value={uploadResult.warning_count} />
        </div>
      ) : (
        <p className="overlay-copy">尚未上传文件，当前展示的是历史记录预览。</p>
      )}

      <div className="filter-strip">
        <select
          value={itemFilters.category}
          onChange={(event) =>
            onItemFilterChange((current) => ({
              ...current,
              category: event.target.value,
            }))
          }
        >
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <input
          value={itemFilters.keyword}
          placeholder="搜索名称或地点"
          onChange={(event) =>
            onItemFilterChange((current) => ({
              ...current,
              keyword: event.target.value,
            }))
          }
        />
      </div>

      {itemsError ? <p className="inline-error">{itemsError}</p> : null}

      <div className="scroll-region">
        <section className="stack-section">
          <div className="stack-header">
            <h3>结构化卡片</h3>
            <span>{items.length} 条预览</span>
          </div>
          {items.length ? items.map((item) => <StructuredCard key={item.id} item={item} />) : <EmptyCard text="暂无结构化结果" />}
        </section>

        <section className="stack-section">
          <div className="stack-header">
            <h3>warning 卡片</h3>
            <button type="button" className="ghost-button small" onClick={onOpenRisk}>
              查看全部
            </button>
          </div>
          {warnings.length ? warnings.map((item) => <WarningCard key={item.id} item={item} compact />) : <EmptyCard text="当前未命中 warning" />}
        </section>
      </div>
    </div>
  );
}

function RiskOverlay({
  warnings,
  warningsTotal,
  warningFilters,
  warningExportJsonUrl,
  warningExportCsvUrl,
  warningsError,
  loadingWarnings,
  onFilterChange,
}) {
  return (
    <div className="overlay-card overlay-risk">
      <div className="overlay-header">
        <div>
          <span className="overlay-kicker">避雷详情</span>
          <h2>warning 结果</h2>
        </div>
        <div className="link-actions">
          <a href={warningExportJsonUrl} target="_blank" rel="noreferrer">
            JSON
          </a>
          <a href={warningExportCsvUrl} target="_blank" rel="noreferrer">
            CSV
          </a>
        </div>
      </div>

      <div className="filter-strip">
        <select
          value={warningFilters.category}
          onChange={(event) =>
            onFilterChange((current) => ({
              ...current,
              category: event.target.value,
            }))
          }
        >
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <input
          value={warningFilters.keyword}
          placeholder="搜索名称或提示"
          onChange={(event) =>
            onFilterChange((current) => ({
              ...current,
              keyword: event.target.value,
            }))
          }
        />
      </div>

      <p className="overlay-copy">当前共 {warningsTotal} 条 warning 记录{loadingWarnings ? "，正在刷新中" : ""}。</p>
      {warningsError ? <p className="inline-error">{warningsError}</p> : null}

      <div className="scroll-region risk-scroll">
        {warnings.length ? warnings.map((item) => <WarningCard key={item.id} item={item} />) : <EmptyCard text="暂无 warning 结果" />}
      </div>
    </div>
  );
}

function StaticOverlay({ title, message }) {
  return (
    <div className="overlay-card overlay-static">
      <span className="overlay-kicker">静态展示</span>
      <h2>{title}</h2>
      <p className="overlay-copy">{message}</p>
    </div>
  );
}

function StructuredCard({ item }) {
  return (
    <article className="content-card">
      <div className="content-head">
        <span className="content-tag">{item.category}</span>
        <span className="content-time">{formatTime(item.updated_at)}</span>
      </div>
      <h4>{item.name}</h4>
      <p className="content-location">{item.location}</p>
      <p className="content-summary">{item.summary}</p>
    </article>
  );
}

function WarningCard({ item, compact = false }) {
  return (
    <article className={compact ? "content-card warning-card compact" : "content-card warning-card"}>
      <div className="content-head">
        <span className="content-tag">{item.category}</span>
        <span className="content-time">{item.matched_by}</span>
      </div>
      <h4>{item.name}</h4>
      <p className="content-location">{item.location}</p>
      <p className="content-summary">{item.warning_summary}</p>
      {!compact && item.execution_tips?.length ? (
        <ul className="tip-list">
          {item.execution_tips.map((tip) => (
            <li key={`${item.id}-${tip}`}>{tip}</li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}

function EmptyCard({ text }) {
  return <div className="empty-card">{text}</div>;
}

function Metric({ label, value }) {
  return (
    <div className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Hotspot({ rect, label, onClick }) {
  const [left, top, width, height] = rect;

  return (
    <button
      className="hotspot"
      aria-label={label}
      onClick={onClick}
      style={{
        left: `${left}%`,
        top: `${top}%`,
        width: `${width}%`,
        height: `${height}%`,
      }}
    />
  );
}
