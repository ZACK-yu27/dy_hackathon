export type Category = '景点' | '饮食' | '交通' | '住宿'

export type ExportFormat = 'json' | 'csv'

export type IngestFileType = 'image' | 'pdf'

export interface StructuredItemRecord {
  id: number
  category: Category
  name: string
  location: string
  summary: string
  created_at: string
  updated_at: string
}

export interface WarningRecord {
  id: number
  structured_item_id: number
  warning_source_id: number
  category: Category
  name: string
  location: string
  summary: string
  warning_summary: string
  avoid_reasons: string[]
  execution_tips: string[]
  alternatives: string[]
  confirm_before_go: string[]
  matched_by: string
  created_at: string
  updated_at: string
}

export interface UploadIngestResponse {
  status: 'success'
  file_name: string
  file_type: IngestFileType
  extracted_text: string
  item_count: number
  saved_count: number
  deduplicated_count: number
  warning_count: number
  warning_saved_count: number
  items: StructuredItemRecord[]
  warnings: WarningRecord[]
}

export interface ListResponse<T> {
  total: number
  items: T[]
}

export interface HealthResponse {
  status: 'ok'
  service: string
  port: number
  extraction_backend: string
  ocr_language: string
  structuring_model: string
  database_configured: boolean
  warning_seed_file: string
}

export interface HistoryQuery {
  limit?: number
  category?: Category | ''
  keyword?: string
}
