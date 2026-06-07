import type { Category, IngestFileType } from '../types/domain'

export function formatDateTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function formatFileType(fileType: IngestFileType) {
  return fileType === 'pdf' ? 'PDF' : '图片'
}

export function buildContextText(parts: Array<[string, string]>) {
  return parts
    .map(([label, value]) => value.trim() ? `${label}：${value.trim()}` : '')
    .filter(Boolean)
    .join('\n')
}

export function categoryLabel(category: Category) {
  return category
}

export function categoryColor(category: Category) {
  switch (category) {
    case '景点':
      return 'bg-[#D9E9FF] text-[#2F72DA]'
    case '饮食':
      return 'bg-[#DDF3D9] text-[#518C1D]'
    case '交通':
      return 'bg-[#D8F2EC] text-[#1E8B79]'
    case '住宿':
      return 'bg-[#DFE2FA] text-[#636FB0]'
    default:
      return 'bg-[#ECEBE3] text-[#4E5340]'
  }
}
