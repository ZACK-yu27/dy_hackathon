import { useEffect, useMemo, useState } from 'react'
import { buildStructuredExportUrl, buildWarningExportUrl, getHealth, listStructuredItems, listWarnings } from '../../api/ingest'
import { ApiError } from '../../api/http'
import { EmptyState, NoticeCard, SectionCard, StatusBadge } from '../../components/BusinessUi'
import type { Category, HealthResponse, StructuredItemRecord, WarningRecord } from '../../types/domain'
import { formatDateTime } from '../../utils/format'
import { saveSelectedItem, saveSelectedWarning } from '../../utils/storage'
import { BottomNavigation } from './components/BottomNavigation'
import { FloatingActionButton } from './components/FloatingActionButton'
import { Header } from './components/Header'
import { SectionTitle } from './components/SectionTitle'
import { DeviceScrollView, DeviceShell } from '../../components/TravelUi'

const CATEGORY_OPTIONS: Array<Category | ''> = ['', '景点', '饮食', '交通', '住宿']
const HISTORY_LIMIT = 100

export default function TravelUnpackPage() {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [healthError, setHealthError] = useState('')
  const [historyMode, setHistoryMode] = useState<'items' | 'warnings'>('items')
  const [category, setCategory] = useState<Category | ''>('')
  const [keywordInput, setKeywordInput] = useState('')
  const [appliedKeyword, setAppliedKeyword] = useState('')
  const [loading, setLoading] = useState(true)
  const [historyError, setHistoryError] = useState('')
  const [items, setItems] = useState<StructuredItemRecord[]>([])
  const [warnings, setWarnings] = useState<WarningRecord[]>([])

  const activeQuery = useMemo(
    () => ({
      limit: HISTORY_LIMIT,
      category,
      keyword: appliedKeyword.trim(),
    }),
    [appliedKeyword, category],
  )

  useEffect(() => {
    async function loadHealth() {
      try {
        const response = await getHealth()
        setHealth(response)
        setHealthError('')
      } catch (error) {
        setHealth(null)
        setHealthError(error instanceof ApiError ? error.detail : '服务状态检查失败，请确认后端是否已启动。')
      }
    }

    void loadHealth()
  }, [])

  useEffect(() => {
    async function loadHistory() {
      setLoading(true)
      setHistoryError('')

      try {
        if (historyMode === 'items') {
          const response = await listStructuredItems(activeQuery)
          setItems(response.items)
        } else {
          const response = await listWarnings(activeQuery)
          setWarnings(response.items)
        }
      } catch (error) {
        setHistoryError(error instanceof ApiError ? error.detail : '历史查询失败，请稍后重试。')
      } finally {
        setLoading(false)
      }
    }

    void loadHistory()
  }, [activeQuery, historyMode])

  const exportJsonUrl =
    historyMode === 'items'
      ? buildStructuredExportUrl('json', activeQuery)
      : buildWarningExportUrl('json', activeQuery)

  const exportCsvUrl =
    historyMode === 'items'
      ? buildStructuredExportUrl('csv', activeQuery)
      : buildWarningExportUrl('csv', activeQuery)

  return (
    <DeviceShell className="bg-white">
      <div className="relative h-full overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.16]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(188, 188, 188, 1) 1px, transparent 1px)',
            backgroundSize: '14px 14px',
          }}
        />

        <DeviceScrollView className="relative z-10" bottomInset={158}>
          <Header />
          <SectionTitle title="真实接入工作台" />

          <section className="space-y-5 px-5 pb-10 pt-6">
            <SectionCard>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[22px] font-bold text-[#1B1D11]">后端健康检查</p>
                  <p className="mt-1 text-sm text-[#64675A]">
                    应用启动后自动请求 `GET /health`
                  </p>
                </div>
                <StatusBadge
                  className={
                    health && health.database_configured
                      ? 'bg-[#DFF1B0] text-[#40501D]'
                      : 'bg-[#F7DDD8] text-[#7A2F24]'
                  }
                >
                  {health && health.database_configured ? '服务可用' : '待确认'}
                </StatusBadge>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-[#464934]">
                <HealthMetric label="status" value={health?.status ?? '--'} />
                <HealthMetric label="database_configured" value={health ? String(health.database_configured) : '--'} />
                <HealthMetric label="extraction_backend" value={health?.extraction_backend ?? '--'} />
                <HealthMetric label="ocr_language" value={health?.ocr_language ?? '--'} />
                <HealthMetric label="structuring_model" value={health?.structuring_model ?? '--'} />
                <HealthMetric label="port" value={health ? String(health.port) : '--'} />
              </div>

              {healthError ? (
                <div className="mt-4">
                  <NoticeCard
                    title="健康检查失败"
                    description={`${healthError} 上传主流程将被阻止，直到服务恢复。`}
                    tone="danger"
                  />
                </div>
              ) : null}

              {!healthError && health && !health.database_configured ? (
                <div className="mt-4">
                  <NoticeCard
                    title="数据库未配置"
                    description="后端已启动，但 `database_configured=false`。上传接口很可能失败，请先补齐后端数据库环境。"
                    tone="warning"
                  />
                </div>
              ) : null}
            </SectionCard>

            <SectionCard>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[22px] font-bold text-[#1B1D11]">历史结果查询</p>
                  <p className="mt-1 text-sm text-[#64675A]">
                    已真实接入 `GET /ingest/items`、`GET /ingest/warnings`
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setHistoryMode('items')}
                    className={`rounded-full px-4 py-2 text-sm ${historyMode === 'items' ? 'bg-[#1B1D11] text-[#D4EF2E]' : 'bg-[#ECE9DD] text-[#4E5340]'}`}
                  >
                    结构化结果
                  </button>
                  <button
                    type="button"
                    onClick={() => setHistoryMode('warnings')}
                    className={`rounded-full px-4 py-2 text-sm ${historyMode === 'warnings' ? 'bg-[#1B1D11] text-[#D4EF2E]' : 'bg-[#ECE9DD] text-[#4E5340]'}`}
                  >
                    Warning
                  </button>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {CATEGORY_OPTIONS.map((option) => (
                  <button
                    key={option || 'all'}
                    type="button"
                    onClick={() => setCategory(option)}
                    className={`rounded-full px-4 py-2 text-sm ${
                      category === option ? 'bg-[#D4EF2E] text-[#1B1D11]' : 'bg-[#F1F0E8] text-[#5D6350]'
                    }`}
                  >
                    {option || '全部分类'}
                  </button>
                ))}
              </div>

              <form
                className="mt-4 flex gap-3"
                onSubmit={(event) => {
                  event.preventDefault()
                  setAppliedKeyword(keywordInput)
                }}
              >
                <input
                  value={keywordInput}
                  onChange={(event) => setKeywordInput(event.target.value)}
                  placeholder="按名称 / 地点 / 摘要关键词检索"
                  className="h-12 flex-1 rounded-full border border-[#D7D4C7] bg-white px-5 text-sm outline-none"
                />
                <button type="submit" className="rounded-full bg-[#1B1D11] px-5 text-sm font-medium text-[#D4EF2E]">
                  查询
                </button>
              </form>

              <div className="mt-4 flex flex-wrap gap-3 text-sm">
                <a
                  href={exportJsonUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-[#E8F0D1] px-4 py-2 text-[#43511E]"
                >
                  导出 JSON
                </a>
                <a
                  href={exportCsvUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-[#E8ECF8] px-4 py-2 text-[#3F4B86]"
                >
                  导出 CSV
                </a>
                <span className="inline-flex items-center rounded-full bg-[#F2F0E7] px-4 py-2 text-[#676B61]">
                  当前会沿用分类与关键词筛选条件
                </span>
              </div>

              <div className="mt-5">
                {loading ? (
                  <NoticeCard
                    title="加载中"
                    description="正在查询历史结果，请稍候。"
                    tone="neutral"
                  />
                ) : null}

                {!loading && historyError ? (
                  <NoticeCard
                    title="查询失败"
                    description={historyError}
                    tone="danger"
                  />
                ) : null}

                {!loading && !historyError && historyMode === 'items' && items.length === 0 ? (
                  <EmptyState
                    title="暂无结构化结果"
                    description="可以先去上传一张图片或 PDF，再回到首页查询历史记录。"
                  />
                ) : null}

                {!loading && !historyError && historyMode === 'warnings' && warnings.length === 0 ? (
                  <EmptyState
                    title="暂无 warning 结果"
                    description="当前筛选条件下没有 warning 数据，可以调整分类或关键词后重试。"
                  />
                ) : null}

                {!loading && !historyError && historyMode === 'items' ? (
                  <div className="space-y-3">
                    {items.map((item) => (
                      <a
                        key={item.id}
                        href={`/travel-unpack/detail?itemId=${item.id}`}
                        onClick={() => saveSelectedItem(item)}
                        className="block rounded-[20px] bg-white p-4 shadow-[0px_6px_18px_rgba(27,29,17,0.05)]"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-lg font-semibold text-[#1B1D11]">{item.name}</p>
                            <p className="mt-1 text-sm text-[#666A61]">{item.location}</p>
                          </div>
                          <StatusBadge className="bg-[#F1F0E7] text-[#5C6354]">
                            {item.category}
                          </StatusBadge>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-[#4A4E45]">{item.summary}</p>
                        <p className="mt-3 text-xs text-[#888C84]">
                          更新时间：{formatDateTime(item.updated_at)}
                        </p>
                      </a>
                    ))}
                  </div>
                ) : null}

                {!loading && !historyError && historyMode === 'warnings' ? (
                  <div className="space-y-3">
                    {warnings.map((warning) => (
                      <a
                        key={warning.id}
                        href={`/travel-unpack/risk-detail?warningId=${warning.id}`}
                        onClick={() => saveSelectedWarning(warning)}
                        className="block rounded-[20px] bg-white p-4 shadow-[0px_6px_18px_rgba(27,29,17,0.05)]"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-lg font-semibold text-[#1B1D11]">{warning.name}</p>
                            <p className="mt-1 text-sm text-[#666A61]">{warning.location}</p>
                          </div>
                          <StatusBadge className="bg-[#FDE8E2] text-[#B84D39]">
                            {warning.category}
                          </StatusBadge>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-[#4A4E45]">{warning.warning_summary}</p>
                        <p className="mt-3 text-xs text-[#888C84]">
                          更新时间：{formatDateTime(warning.updated_at)}
                        </p>
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
            </SectionCard>
          </section>
        </DeviceScrollView>

        <div className="pointer-events-none absolute bottom-[102px] right-5 z-20 flex">
          <FloatingActionButton />
        </div>

        <div className="pointer-events-none absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2">
          <BottomNavigation active="首页" />
        </div>
      </div>
    </DeviceShell>
  )
}

function HealthMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] bg-white px-4 py-3 shadow-[0px_4px_12px_rgba(27,29,17,0.04)]">
      <p className="text-[11px] uppercase tracking-[0.12em] text-[#8A8D82]">{label}</p>
      <p className="mt-2 break-all text-[13px] font-medium text-[#1B1D11]">{value}</p>
    </div>
  )
}
