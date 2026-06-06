import { useEffect, useMemo, useState } from "react";
import {
  buildExportUrl,
  CATEGORY_OPTIONS,
  fetchHealth,
  fetchItems,
  fetchWarnings,
  uploadFile,
} from "./api";

const INITIAL_FILTERS = {
  limit: 100,
  category: "全部",
  keyword: "",
};

function formatTime(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("zh-CN", { hour12: false });
}

function getErrorMessage(error, fallback) {
  if (!error) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(error.message);
    if (parsed?.detail) {
      return parsed.detail;
    }
  } catch {
    return error.message || fallback;
  }

  return error.message || fallback;
}

function StatCard({ label, value, hint }) {
  return (
    <div className="stat-card">
      <span className="stat-label">{label}</span>
      <strong className="stat-value">{value}</strong>
      {hint ? <span className="stat-hint">{hint}</span> : null}
    </div>
  );
}

function SectionHeader({ title, description, actions }) {
  return (
    <div className="section-header">
      <div>
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      {actions ? <div className="section-actions">{actions}</div> : null}
    </div>
  );
}

function RecordList({ items, emptyText, renderMeta, renderExtra }) {
  if (!items.length) {
    return <div className="empty-state">{emptyText}</div>;
  }

  return (
    <div className="record-list">
      {items.map((item) => (
        <article key={item.id} className="record-card">
          <div className="record-top">
            <span className="record-tag">{item.category}</span>
            <span className="record-time">{formatTime(item.updated_at)}</span>
          </div>
          <h3>{item.name}</h3>
          <p className="record-location">{item.location || "-"}</p>
          <p className="record-summary">{item.summary}</p>
          {renderMeta ? <div className="record-meta">{renderMeta(item)}</div> : null}
          {renderExtra ? <div className="record-extra">{renderExtra(item)}</div> : null}
        </article>
      ))}
    </div>
  );
}

export default function App() {
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

  async function handleUpload(event) {
    event.preventDefault();
    if (!selectedFile) {
      setUploadError("请先选择图片或 PDF 文件。");
      return;
    }

    setUploading(true);
    setUploadError("");

    try {
      const result = await uploadFile({
        file: selectedFile,
        contextText,
      });
      setUploadResult(result);
      await Promise.all([loadItems(), loadWarnings()]);
    } catch (error) {
      setUploadError(getErrorMessage(error, "上传失败"));
    } finally {
      setUploading(false);
    }
  }

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

  const uploadDisabled = uploading || loadingHealth || !health?.database_configured;

  return (
    <main className="page-shell">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">旅程积木 / 前后端整合骨架</p>
          <h1>上传攻略文件，查看结构化结果与避雷提醒</h1>
          <p className="hero-copy">
            当前骨架已经接通健康检查、单文件上传、结构化结果查询、warning 查询和导出入口，
            后续可继续演进为首页、创建项目、项目详情、避雷详情等真实业务页面。
          </p>
        </div>
        <div className="hero-actions">
          <button type="button" className="secondary-button" onClick={loadHealth} disabled={loadingHealth}>
            {loadingHealth ? "检查中..." : "刷新服务状态"}
          </button>
        </div>
      </section>

      <section className="panel">
        <SectionHeader
          title="服务状态"
          description="必须先确认 FastAPI、MySQL 和 warning 种子同步状态正常，才能进入上传主流程。"
        />
        {healthError ? <div className="error-banner">{healthError}</div> : null}
        <div className="stats-grid">
          <StatCard label="服务状态" value={health?.status || (loadingHealth ? "加载中" : "-")} />
          <StatCard label="服务名称" value={health?.service || "-"} />
          <StatCard label="OCR 后端" value={health?.extraction_backend || "-"} />
          <StatCard label="结构化模型" value={health?.structuring_model || "-"} />
          <StatCard
            label="数据库已配置"
            value={health?.database_configured ? "是" : "否"}
            hint={health?.warning_seed_file || ""}
          />
        </div>
      </section>

      <section className="panel">
        <SectionHeader
          title="创建并解析"
          description="支持单张图片或 PDF 上传，处理耗时可能在 10 至 20 秒之间。"
        />
        <form className="upload-form" onSubmit={handleUpload}>
          <label className="field">
            <span>攻略文件</span>
            <input
              type="file"
              accept=".png,.jpg,.jpeg,.webp,.pdf"
              onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
            />
          </label>

          <label className="field">
            <span>补充上下文</span>
            <textarea
              rows="4"
              placeholder="可选：补充城市、路线背景、截图来源等信息"
              value={contextText}
              onChange={(event) => setContextText(event.target.value)}
            />
          </label>

          <div className="form-footer">
            <div className="file-summary">
              <span>{selectedFile ? selectedFile.name : "未选择文件"}</span>
            </div>
            <button type="submit" className="primary-button" disabled={uploadDisabled}>
              {uploading ? "处理中..." : "创建并解析"}
            </button>
          </div>
        </form>
        {uploadError ? <div className="error-banner">{uploadError}</div> : null}
      </section>

      <section className="panel">
        <SectionHeader
          title="本次上传结果"
          description="展示本次调用返回的结构化数量、去重数量与 warning 命中情况。"
        />
        {!uploadResult ? (
          <div className="empty-state">完成一次上传后，将在这里显示最新结果。</div>
        ) : (
          <>
            <div className="stats-grid">
              <StatCard label="识别条目数" value={uploadResult.item_count} />
              <StatCard label="新增入库数" value={uploadResult.saved_count} />
              <StatCard label="去重数量" value={uploadResult.deduplicated_count} />
              <StatCard label="warning 命中数" value={uploadResult.warning_count} />
              <StatCard label="warning 新增数" value={uploadResult.warning_saved_count} />
            </div>
            <div className="result-columns">
              <div className="result-box">
                <h3>OCR 原文</h3>
                <pre>{uploadResult.extracted_text || "无文本内容"}</pre>
              </div>
              <div className="result-box">
                <h3>本次命中 warning</h3>
                <RecordList
                  items={uploadResult.warnings || []}
                  emptyText="本次上传未命中避雷库。"
                  renderMeta={(item) => <span>匹配方式：{item.matched_by}</span>}
                  renderExtra={(item) => (
                    <ul className="pill-list">
                      {(item.avoid_reasons || []).map((reason) => (
                        <li key={reason}>{reason}</li>
                      ))}
                    </ul>
                  )}
                />
              </div>
            </div>
          </>
        )}
      </section>

      <section className="panel">
        <SectionHeader
          title="结构化结果"
          description="可按分类和关键词筛选历史识别结果，并沿用筛选条件导出 JSON 或 CSV。"
          actions={
            <>
              <a className="ghost-link" href={itemExportJsonUrl} target="_blank" rel="noreferrer">
                导出 JSON
              </a>
              <a className="ghost-link" href={itemExportCsvUrl} target="_blank" rel="noreferrer">
                导出 CSV
              </a>
            </>
          }
        />
        <div className="filter-row">
          <select
            value={itemFilters.category}
            onChange={(event) => setItemFilters((current) => ({ ...current, category: event.target.value }))}
          >
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <input
            value={itemFilters.keyword}
            placeholder="搜索名称、地点、摘要"
            onChange={(event) => setItemFilters((current) => ({ ...current, keyword: event.target.value }))}
          />
          <button type="button" className="secondary-button" onClick={() => loadItems()}>
            手动刷新
          </button>
        </div>
        <p className="helper-text">共 {itemsData.total} 条，按最新记录倒序展示。</p>
        {itemsError ? <div className="error-banner">{itemsError}</div> : null}
        {loadingItems ? (
          <div className="empty-state">结构化结果加载中...</div>
        ) : (
          <RecordList
            items={itemsData.items}
            emptyText="暂无结构化结果。"
            renderMeta={(item) => (
              <>
                <span>ID：{item.id}</span>
                <span>更新时间：{formatTime(item.updated_at)}</span>
              </>
            )}
          />
        )}
      </section>

      <section className="panel">
        <SectionHeader
          title="避雷结果"
          description="查看历史 warning 命中结果，并为后续避雷详情页提供真实数据来源。"
          actions={
            <>
              <a className="ghost-link" href={warningExportJsonUrl} target="_blank" rel="noreferrer">
                导出 JSON
              </a>
              <a className="ghost-link" href={warningExportCsvUrl} target="_blank" rel="noreferrer">
                导出 CSV
              </a>
            </>
          }
        />
        <div className="filter-row">
          <select
            value={warningFilters.category}
            onChange={(event) =>
              setWarningFilters((current) => ({ ...current, category: event.target.value }))
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
            placeholder="搜索名称、地点、摘要、warning 文案"
            onChange={(event) =>
              setWarningFilters((current) => ({ ...current, keyword: event.target.value }))
            }
          />
          <button type="button" className="secondary-button" onClick={() => loadWarnings()}>
            手动刷新
          </button>
        </div>
        <p className="helper-text">共 {warningsData.total} 条，支持分类筛选和关键词检索。</p>
        {warningsError ? <div className="error-banner">{warningsError}</div> : null}
        {loadingWarnings ? (
          <div className="empty-state">避雷结果加载中...</div>
        ) : (
          <RecordList
            items={warningsData.items}
            emptyText="暂无避雷结果。"
            renderMeta={(item) => (
              <>
                <span>结构化记录 ID：{item.structured_item_id}</span>
                <span>匹配方式：{item.matched_by}</span>
              </>
            )}
            renderExtra={(item) => (
              <div className="warning-detail">
                <p>{item.warning_summary}</p>
                <ul className="pill-list">
                  {(item.execution_tips || []).map((tip) => (
                    <li key={tip}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          />
        )}
      </section>
    </main>
  );
}
