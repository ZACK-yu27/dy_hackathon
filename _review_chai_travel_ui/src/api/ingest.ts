import type {
  ExportFormat,
  HealthResponse,
  HistoryQuery,
  ListResponse,
  StructuredItemRecord,
  UploadIngestResponse,
  WarningRecord,
} from '../types/domain'
import { buildApiUrl, requestJson } from './http'

export function getHealth() {
  return requestJson<HealthResponse>('/health')
}

export function uploadIngest(file: File, contextText?: string) {
  const formData = new FormData()
  formData.append('file', file)

  const trimmedContext = contextText?.trim()
  if (trimmedContext) {
    formData.append('context_text', trimmedContext)
  }

  return requestJson<UploadIngestResponse>('/ingest/upload', {
    method: 'POST',
    body: formData,
  })
}

export function listStructuredItems(query: HistoryQuery) {
  return requestJson<ListResponse<StructuredItemRecord>>('/ingest/items', undefined, { ...query })
}

export function listWarnings(query: HistoryQuery) {
  return requestJson<ListResponse<WarningRecord>>('/ingest/warnings', undefined, { ...query })
}

export function buildStructuredExportUrl(format: ExportFormat, query: HistoryQuery) {
  return buildApiUrl('/ingest/export', { ...query, format })
}

export function buildWarningExportUrl(format: ExportFormat, query: HistoryQuery) {
  return buildApiUrl('/ingest/export-warnings', { ...query, format })
}
