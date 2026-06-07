const API_BASE_URL = "http://127.0.0.1:8011";
const CATEGORY_OPTIONS = ["全部", "景点", "饮食", "交通", "住宿"];

const state = {
  health: null,
  uploadResult: null,
  itemFilters: {
    limit: 100,
    category: "全部",
    keyword: "",
    format: "json",
  },
  warningFilters: {
    limit: 100,
    category: "全部",
    keyword: "",
    format: "json",
  },
};

function $(id) {
  return document.getElementById(id);
}

function setHidden(id, hidden) {
  $(id).classList.toggle("hidden", hidden);
}

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
    if (parsed && parsed.detail) {
      return parsed.detail;
    }
  } catch {
    return error.message || fallback;
  }

  return error.message || fallback;
}

function buildUrl(path, params = {}) {
  const url = new URL(`${API_BASE_URL}${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "" || value === "全部") {
      return;
    }
    url.searchParams.set(key, String(value));
  });
  return url.toString();
}

async function requestJson(path, options = {}, params = {}) {
  const response = await fetch(buildUrl(path, params), options);
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed: ${response.status}`);
  }
  return response.json();
}

function renderStats(targetId, stats) {
  $(targetId).innerHTML = stats
    .map(
      (item) => `
        <div class="stat-card">
          <span class="stat-label">${item.label}</span>
          <strong class="stat-value">${item.value}</strong>
          ${item.hint ? `<span class="stat-hint">${item.hint}</span>` : ""}
        </div>
      `,
    )
    .join("");
}

function renderRecordList(targetId, items, emptyText, options = {}) {
  const { warningMode = false } = options;
  const target = $(targetId);

  if (!items || !items.length) {
    target.innerHTML = `<div class="empty-state">${emptyText}</div>`;
    return;
  }

  target.innerHTML = items
    .map((item) => {
      const extra = warningMode
        ? `
            <div class="record-extra warning-detail">
              <p>${item.warning_summary || ""}</p>
              <ul class="pill-list">
                ${((item.execution_tips || []).map((tip) => `<li>${tip}</li>`).join("")) || ""}
              </ul>
            </div>
          `
        : "";

      const meta = warningMode
        ? `
            <div class="record-meta">
              <span>结构化记录 ID：${item.structured_item_id}</span>
              <span>匹配方式：${item.matched_by}</span>
            </div>
          `
        : `
            <div class="record-meta">
              <span>ID：${item.id}</span>
              <span>更新时间：${formatTime(item.updated_at)}</span>
            </div>
          `;

      return `
        <article class="record-card">
          <div class="record-top">
            <span class="record-tag">${item.category}</span>
            <span class="record-time">${formatTime(item.updated_at)}</span>
          </div>
          <h3>${item.name}</h3>
          <p class="record-location">${item.location || "-"}</p>
          <p class="record-summary">${item.summary || ""}</p>
          ${meta}
          ${extra}
        </article>
      `;
    })
    .join("");
}

function initCategorySelect(id) {
  $(id).innerHTML = CATEGORY_OPTIONS.map((option) => `<option value="${option}">${option}</option>`).join("");
}

async function loadHealth() {
  setHidden("health-error", true);
  try {
    const result = await requestJson("/health");
    state.health = result;
    renderStats("health-stats", [
      { label: "服务状态", value: result.status || "-" },
      { label: "服务名称", value: result.service || "-" },
      { label: "OCR 后端", value: result.extraction_backend || "-" },
      { label: "结构化模型", value: result.structuring_model || "-" },
      {
        label: "数据库已配置",
        value: result.database_configured ? "是" : "否",
        hint: result.warning_seed_file || "",
      },
    ]);
  } catch (error) {
    $("health-error").textContent = getErrorMessage(error, "服务状态获取失败");
    setHidden("health-error", false);
  }
}

async function loadItems() {
  setHidden("items-error", true);
  try {
    const result = await requestJson("/ingest/items", {}, state.itemFilters);
    $("items-total").textContent = `共 ${result.total} 条`;
    renderRecordList("items-list", result.items, "暂无结构化结果。");
  } catch (error) {
    $("items-error").textContent = getErrorMessage(error, "结构化结果获取失败");
    setHidden("items-error", false);
  }
}

async function loadWarnings() {
  setHidden("warnings-error", true);
  try {
    const result = await requestJson("/ingest/warnings", {}, state.warningFilters);
    $("warnings-total").textContent = `共 ${result.total} 条`;
    renderRecordList("warnings-list", result.items, "暂无 warning 结果。", { warningMode: true });
  } catch (error) {
    $("warnings-error").textContent = getErrorMessage(error, "warning 结果获取失败");
    setHidden("warnings-error", false);
  }
}

function refreshExportLinks() {
  $("items-export-json").href = buildUrl("/ingest/export", { ...state.itemFilters, format: "json" });
  $("items-export-csv").href = buildUrl("/ingest/export", { ...state.itemFilters, format: "csv" });
  $("warnings-export-json").href = buildUrl("/ingest/export-warnings", {
    ...state.warningFilters,
    format: "json",
  });
  $("warnings-export-csv").href = buildUrl("/ingest/export-warnings", {
    ...state.warningFilters,
    format: "csv",
  });
}

async function handleUpload(event) {
  event.preventDefault();
  setHidden("upload-error", true);

  const file = $("file-input").files[0];
  if (!file) {
    $("upload-error").textContent = "请先选择图片或 PDF 文件。";
    setHidden("upload-error", false);
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  const contextText = $("context-text").value.trim();
  if (contextText) {
    formData.append("context_text", contextText);
  }

  $("submit-upload").disabled = true;
  $("submit-upload").textContent = "处理中...";

  try {
    const result = await requestJson("/ingest/upload", { method: "POST", body: formData });
    state.uploadResult = result;

    setHidden("upload-result-empty", true);
    setHidden("upload-result", false);

    renderStats("upload-stats", [
      { label: "识别条目数", value: result.item_count },
      { label: "新增入库数", value: result.saved_count },
      { label: "去重数量", value: result.deduplicated_count },
      { label: "warning 命中数", value: result.warning_count },
      { label: "warning 新增数", value: result.warning_saved_count },
    ]);

    $("ocr-text").textContent = result.extracted_text || "无文本内容";
    renderRecordList("upload-warnings", result.warnings || [], "本次上传未命中避雷库。", { warningMode: true });

    await Promise.all([loadItems(), loadWarnings()]);
  } catch (error) {
    $("upload-error").textContent = getErrorMessage(error, "上传失败");
    setHidden("upload-error", false);
  } finally {
    $("submit-upload").disabled = false;
    $("submit-upload").textContent = "创建并解析";
  }
}

function bindEvents() {
  $("refresh-health").addEventListener("click", loadHealth);
  $("upload-form").addEventListener("submit", handleUpload);

  $("file-input").addEventListener("change", (event) => {
    const file = event.target.files[0];
    $("file-summary").textContent = file ? file.name : "未选择文件";
  });

  $("items-category").addEventListener("change", (event) => {
    state.itemFilters.category = event.target.value;
    refreshExportLinks();
    loadItems();
  });

  $("items-keyword").addEventListener("input", (event) => {
    state.itemFilters.keyword = event.target.value;
    refreshExportLinks();
  });

  $("refresh-items").addEventListener("click", () => {
    state.itemFilters.keyword = $("items-keyword").value.trim();
    refreshExportLinks();
    loadItems();
  });

  $("warnings-category").addEventListener("change", (event) => {
    state.warningFilters.category = event.target.value;
    refreshExportLinks();
    loadWarnings();
  });

  $("warnings-keyword").addEventListener("input", (event) => {
    state.warningFilters.keyword = event.target.value;
    refreshExportLinks();
  });

  $("refresh-warnings").addEventListener("click", () => {
    state.warningFilters.keyword = $("warnings-keyword").value.trim();
    refreshExportLinks();
    loadWarnings();
  });
}

async function init() {
  initCategorySelect("items-category");
  initCategorySelect("warnings-category");
  refreshExportLinks();
  bindEvents();
  await Promise.all([loadHealth(), loadItems(), loadWarnings()]);
}

init();
