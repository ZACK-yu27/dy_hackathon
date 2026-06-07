import { STORAGE_KEYS } from '../config/env'
import type { StructuredItemRecord, UploadIngestResponse, WarningRecord } from '../types/domain'

function readJson<T>(key: string) {
  try {
    const raw = window.sessionStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function writeJson(key: string, value: unknown) {
  window.sessionStorage.setItem(key, JSON.stringify(value))
}

export function getLatestUpload() {
  return readJson<UploadIngestResponse>(STORAGE_KEYS.latestUpload)
}

export function saveLatestUpload(payload: UploadIngestResponse) {
  writeJson(STORAGE_KEYS.latestUpload, payload)
}

export function getSelectedItem() {
  return readJson<StructuredItemRecord>(STORAGE_KEYS.selectedItem)
}

export function saveSelectedItem(item: StructuredItemRecord) {
  writeJson(STORAGE_KEYS.selectedItem, item)
}

export function getSelectedWarning() {
  return readJson<WarningRecord>(STORAGE_KEYS.selectedWarning)
}

export function saveSelectedWarning(item: WarningRecord) {
  writeJson(STORAGE_KEYS.selectedWarning, item)
}
