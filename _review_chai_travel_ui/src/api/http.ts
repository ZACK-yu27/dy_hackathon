import { appEnv } from '../config/env'

type QueryValue = string | number | boolean | null | undefined

export class ApiError extends Error {
  status: number
  detail: string

  constructor(status: number, detail: string) {
    super(detail)
    this.name = 'ApiError'
    this.status = status
    this.detail = detail
  }
}

function getBaseOrigin() {
  return appEnv.apiBaseUrl || window.location.origin
}

function appendQuery(url: URL, query?: Record<string, QueryValue>) {
  if (!query) return

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    url.searchParams.set(key, String(value))
  })
}

export function buildApiUrl(path: string, query?: Record<string, QueryValue>) {
  const url = new URL(path, getBaseOrigin())
  appendQuery(url, query)

  if (!appEnv.apiBaseUrl && url.origin === window.location.origin) {
    return `${url.pathname}${url.search}`
  }

  return url.toString()
}

async function toApiError(response: Response) {
  const fallbackDetail = `请求失败，状态码 ${response.status}`
  const contentType = response.headers.get('content-type') ?? ''

  if (contentType.includes('application/json')) {
    const data = (await response.json()) as { detail?: string }
    throw new ApiError(response.status, data.detail || fallbackDetail)
  }

  const text = await response.text()
  throw new ApiError(response.status, text || fallbackDetail)
}

export async function requestJson<T>(
  path: string,
  init?: RequestInit,
  query?: Record<string, QueryValue>,
): Promise<T> {
  const response = await fetch(buildApiUrl(path, query), init)

  if (!response.ok) {
    await toApiError(response)
  }

  return (await response.json()) as T
}
