export const INITIAL_FILTERS = {
  limit: 100,
  category: "全部",
  keyword: "",
};

export function formatTime(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("zh-CN", { hour12: false });
}

export function getErrorMessage(error, fallback) {
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
