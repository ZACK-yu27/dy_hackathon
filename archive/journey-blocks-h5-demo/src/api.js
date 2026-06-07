const DEFAULT_BASE_URL = "/api";

const CATEGORY_OPTIONS = ["全部", "景点", "饮食", "交通", "住宿"];

function getBaseUrl() {
  const value = import.meta.env.VITE_API_BASE_URL;
  if (!value) {
    return DEFAULT_BASE_URL;
  }
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

function buildUrl(path, params) {
  const baseUrl = getBaseUrl();
  const url = new URL(`${baseUrl}${path}`, window.location.origin);

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "" || value === "全部") {
      return;
    }
    url.searchParams.set(key, String(value));
  });

  return url;
}

async function requestJson(path, options = {}, params) {
  const response = await fetch(buildUrl(path, params), options);
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed: ${response.status}`);
  }
  return response.json();
}

export async function fetchHealth() {
  return requestJson("/health");
}

export async function uploadFile({ file, contextText }) {
  const formData = new FormData();
  formData.append("file", file);
  if (contextText.trim()) {
    formData.append("context_text", contextText.trim());
  }

  return requestJson("/ingest/upload", {
    method: "POST",
    body: formData,
  });
}

export async function fetchItems(filters) {
  return requestJson("/ingest/items", {}, filters);
}

export async function fetchWarnings(filters) {
  return requestJson("/ingest/warnings", {}, filters);
}

export function buildExportUrl(type, filters) {
  const path = type === "warnings" ? "/ingest/export-warnings" : "/ingest/export";
  return buildUrl(path, filters).toString();
}

export { CATEGORY_OPTIONS };
