const DEFAULT_MAX_UPLOAD_MB = 50

function parsePositiveNumber(rawValue: string | undefined, fallback: number) {
  const parsed = Number(rawValue)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

export const appEnv = {
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL ?? '').trim().replace(/\/+$/, ''),
  maxUploadMb: parsePositiveNumber(import.meta.env.VITE_MAX_UPLOAD_MB, DEFAULT_MAX_UPLOAD_MB),
}

export const STORAGE_KEYS = {
  latestUpload: 'chai-travel-ui.latest-upload',
  selectedItem: 'chai-travel-ui.selected-item',
  selectedWarning: 'chai-travel-ui.selected-warning',
} as const

export const ACCEPTED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'application/pdf',
] as const

export const ACCEPTED_FILE_TYPES_HINT = 'PNG / JPG / JPEG / WEBP / PDF'
