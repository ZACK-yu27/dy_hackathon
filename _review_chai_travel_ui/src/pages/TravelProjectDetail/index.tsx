import { useEffect, useMemo, useState } from 'react'
import detailBackIcon from '../../assets/icons/figma-deep/detail-back.svg'
import detailMoreIcon from '../../assets/icons/figma-deep/detail-more.svg'
import detailSendIcon from '../../assets/icons/figma-deep/detail-send.svg'
import { buildStructuredExportUrl, buildWarningExportUrl, listStructuredItems, listWarnings } from '../../api/ingest'
import { ApiError } from '../../api/http'
import { CategoryBadge, EmptyState, NoticeCard, SectionCard, StatusBadge } from '../../components/BusinessUi'
import { DeviceScrollView, DeviceShell } from '../../components/TravelUi'
import type { StructuredItemRecord, UploadIngestResponse, WarningRecord } from '../../types/domain'
import { formatDateTime, formatFileType } from '../../utils/format'
import { getLatestUpload, getSelectedItem, saveSelectedItem, saveSelectedWarning } from '../../utils/storage'

export default function TravelProjectDetailPage() {
  const [uploadSnapshot, setUploadSnapshot] = useState<UploadIngestResponse | null>(null)
  const [selectedItem, setSelectedItem] = useState<StructuredItemRecord | null>(null)
  const [relatedWarnings, setRelatedWarnings] = useState<WarningRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const params = useMemo(() => new URLSearchParams(window.location.search), [])
  const requestedItemId = Number(params.get('itemId') ?? '')
  const requestedSource = params.get('source')

  useEffect(() => {
    async function loadDetail() {
      setLoading(true)
      setError('')

      try {
        const latest = getLatestUpload()
        const cachedItem = getSelectedItem()

        if (requestedSource === 'latest' && latest) {
          setUploadSnapshot(latest)
          setSelectedItem(latest.items[0] ?? null)
          setRelatedWarnings(latest.warnings)
          return
        }

        if (!requestedItemId && latest) {
          setUploadSnapshot(latest)
          setSelectedItem(latest.items[0] ?? null)
          setRelatedWarnings(latest.warnings)
          return
        }

        const itemsResponse = await listStructuredItems({
          limit: 100,
          category: cachedItem?.category ?? '',
          keyword: cachedItem?.name ?? '',
        })

        const matchedItem =
          itemsResponse.items.find((item) => item.id === requestedItemId) ??
          (cachedItem && cachedItem.id === requestedItemId ? cachedItem : null) ??
          itemsResponse.items[0] ??
          null

        setSelectedItem(matchedItem)

        if (!matchedItem) {
          setRelatedWarnings([])
          return
        }

        const warningsResponse = await listWarnings({
          limit: 100,
          category: matchedItem.category,
          keyword: matchedItem.name,
        })

        setRelatedWarnings(
          warningsResponse.items.filter(
            (warning) =>
              warning.structured_item_id === matchedItem.id ||
              (warning.name === matchedItem.name && warning.category === matchedItem.category),
          ),
        )
      } catch (loadError) {
        setError(loadError instanceof ApiError ? loadError.detail : '详情数据加载失败，请稍后重试。')
      } finally {
        setLoading(false)
      }
    }

    void loadDetail()
  }, [requestedItemId, requestedSource])

  const itemExportUrl = buildStructuredExportUrl('json', {
    limit: 100,
    category: selectedItem?.category ?? '',
    keyword: selectedItem?.name ?? '',
  })

  const warningExportUrl = buildWarningExportUrl('json', {
    limit: 100,
    category: selectedItem?.category ?? '',
    keyword: selectedItem?.name ?? '',
  })

  return (
    <DeviceShell className="bg-[#E7E6DE]">
      <DeviceScrollView>
        <div className="px-4 pb-8 pt-4">
          <section className="rounded-[30px] bg-[#F1F0E9] px-5 pb-6 pt-6 shadow-[0px_8px_24px_rgba(27,29,17,0.08)]">
            <div className="flex items-start justify-between gap-3">
              <a href="/travel-unpack" className="pt-2 text-[#43464D]">
                <img src={detailBackIcon} alt="" className="h-7 w-7" />
              </a>
              <div className="min-w-0 flex-1">
                <h1 className="text-[28px] font-black leading-[38px] text-[#1B1D11]">
                  {selectedItem?.name || uploadSnapshot?.file_name || '结果详情'}
                </h1>
                <p className="mt-1 text-sm text-[#73776E]">
                  {uploadSnapshot
                    ? `本页优先展示最近一次真实上传返回，共 ${uploadSnapshot.item_count} 条结构化结果 / ${uploadSnapshot.warning_count} 条 warning`
                    : '当前展示历史查询结果或缓存快照'}
                </p>
              </div>
              <div className="flex gap-3 pt-1">
                <a
                  href={itemExportUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-[#111] text-white shadow-[0px_8px_20px_rgba(27,29,17,0.15)]"
                >
                  <img src={detailSendIcon} alt="" className="h-5 w-5" />
                </a>
                <a
                  href={warningExportUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#777] shadow-[0px_8px_20px_rgba(27,29,17,0.12)]"
                >
                  <img src={detailMoreIcon} alt="" className="h-5 w-5" />
                </a>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <StatusBadge className="bg-[#D4EF2E] text-[#1B1D11]">
                {uploadSnapshot ? '真实上传返回' : '历史查询兜底'}
              </StatusBadge>
              {selectedItem ? <CategoryBadge category={selectedItem.category} /> : null}
              {uploadSnapshot ? (
                <StatusBadge className="bg-[#ECE9DD] text-[#535748]">
                  status = {uploadSnapshot.status}
                </StatusBadge>
              ) : null}
            </div>
          </section>

          <div className="mt-4 space-y-4">
            {loading ? (
              <NoticeCard title="加载中" description="正在整理结构化条目与 warning 数据。" tone="neutral" />
            ) : null}

            {!loading && error ? (
              <NoticeCard title="加载失败" description={error} tone="danger" />
            ) : null}

            {!loading && !error && uploadSnapshot ? (
              <SectionCard>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[22px] font-bold text-[#1B1D11]">上传返回摘要</p>
                    <p className="mt-1 text-sm text-[#666A61]">
                      已展示 `status`、文件信息、抽取文本、计数与结果数组
                    </p>
                  </div>
                  <StatusBadge
                    className={
                      uploadSnapshot.saved_count > 0
                        ? 'bg-[#DFF1B0] text-[#40501D]'
                        : 'bg-[#FFF0CC] text-[#7C5A12]'
                    }
                  >
                    {uploadSnapshot.saved_count > 0 ? '已写入新数据' : '可能全部命中去重'}
                  </StatusBadge>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <MetricCard label="file_name" value={uploadSnapshot.file_name} />
                  <MetricCard label="file_type" value={formatFileType(uploadSnapshot.file_type)} />
                  <MetricCard label="item_count" value={String(uploadSnapshot.item_count)} />
                  <MetricCard label="saved_count" value={String(uploadSnapshot.saved_count)} />
                  <MetricCard label="deduplicated_count" value={String(uploadSnapshot.deduplicated_count)} />
                  <MetricCard label="warning_count" value={String(uploadSnapshot.warning_count)} />
                  <MetricCard label="warning_saved_count" value={String(uploadSnapshot.warning_saved_count)} />
                </div>

                {uploadSnapshot.saved_count === 0 && uploadSnapshot.deduplicated_count > 0 ? (
                  <div className="mt-4">
                    <NoticeCard
                      title="去重命中说明"
                      description="`saved_count = 0` 不代表失败，当前更可能是识别成功但结果全部命中去重。"
                      tone="warning"
                    />
                  </div>
                ) : null}

                <div className="mt-4 rounded-[18px] bg-white px-4 py-4">
                  <p className="text-sm font-semibold text-[#1B1D11]">extracted_text</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#4D5148]">
                    {uploadSnapshot.extracted_text || '后端未返回抽取文本。'}
                  </p>
                </div>
              </SectionCard>
            ) : null}

            {!loading && !error ? (
              <SectionCard>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[22px] font-bold text-[#1B1D11]">结构化条目</p>
                    <p className="mt-1 text-sm text-[#666A61]">
                      主数据源为上传返回 `items` 或 `GET /ingest/items`
                    </p>
                  </div>
                  <a
                    href={buildStructuredExportUrl('csv', {
                      limit: 100,
                      category: selectedItem?.category ?? '',
                      keyword: selectedItem?.name ?? '',
                    })}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-[#E8ECF8] px-4 py-2 text-sm text-[#3F4B86]"
                  >
                    导出 CSV
                  </a>
                </div>

                {uploadSnapshot?.items.length ? (
                  <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                    {uploadSnapshot.items.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setSelectedItem(item)
                          setRelatedWarnings(
                            (uploadSnapshot.warnings || []).filter(
                              (warning) =>
                                warning.structured_item_id === item.id ||
                                (warning.name === item.name && warning.category === item.category),
                            ),
                          )
                          saveSelectedItem(item)
                        }}
                        className={`rounded-full px-4 py-2 text-sm ${
                          selectedItem?.id === item.id ? 'bg-[#1B1D11] text-[#D4EF2E]' : 'bg-[#ECE9DD] text-[#5C6354]'
                        }`}
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                ) : null}

                {selectedItem ? (
                  <div className="mt-4 rounded-[20px] bg-white p-4 shadow-[0px_6px_18px_rgba(27,29,17,0.05)]">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xl font-semibold text-[#1B1D11]">{selectedItem.name}</p>
                        <p className="mt-1 text-sm text-[#666A61]">{selectedItem.location}</p>
                      </div>
                      <CategoryBadge category={selectedItem.category} />
                    </div>
                    <p className="mt-3 text-sm leading-6 text-[#4A4E45]">{selectedItem.summary}</p>
                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-[#666A61]">
                      <div>created_at：{formatDateTime(selectedItem.created_at)}</div>
                      <div>updated_at：{formatDateTime(selectedItem.updated_at)}</div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4">
                    <EmptyState
                      title="暂无可展示条目"
                      description="当前没有上传快照，也没有查询到历史结构化结果。"
                    />
                  </div>
                )}
              </SectionCard>
            ) : null}

            {!loading && !error ? (
              <SectionCard>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[22px] font-bold text-[#1B1D11]">关联 warning</p>
                    <p className="mt-1 text-sm text-[#666A61]">
                      主数据源为上传返回 `warnings` 或 `GET /ingest/warnings`
                    </p>
                  </div>
                  <a
                    href={buildWarningExportUrl('csv', {
                      limit: 100,
                      category: selectedItem?.category ?? '',
                      keyword: selectedItem?.name ?? '',
                    })}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-[#FDE8E2] px-4 py-2 text-sm text-[#B84D39]"
                  >
                    导出 CSV
                  </a>
                </div>

                {relatedWarnings.length ? (
                  <div className="mt-4 space-y-3">
                    {relatedWarnings.map((warning) => (
                      <a
                        key={warning.id}
                        href={`/travel-unpack/risk-detail?warningId=${warning.id}`}
                        onClick={() => saveSelectedWarning(warning)}
                        className="block rounded-[18px] bg-white p-4 shadow-[0px_6px_18px_rgba(27,29,17,0.05)]"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-lg font-semibold text-[#1B1D11]">{warning.name}</p>
                            <p className="mt-1 text-sm text-[#666A61]">{warning.warning_summary}</p>
                          </div>
                          <StatusBadge className="bg-[#FDE8E2] text-[#B84D39]">
                            {warning.matched_by}
                          </StatusBadge>
                        </div>
                        <p className="mt-3 text-xs text-[#8A8D84]">
                          updated_at：{formatDateTime(warning.updated_at)}
                        </p>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4">
                    <EmptyState
                      title="暂无关联 warning"
                      description="当前条目没有命中 warning，或历史查询结果为空。"
                    />
                  </div>
                )}
              </SectionCard>
            ) : null}
          </div>
        </div>
      </DeviceScrollView>
    </DeviceShell>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] bg-white px-4 py-3 shadow-[0px_4px_12px_rgba(27,29,17,0.04)]">
      <p className="text-[11px] uppercase tracking-[0.12em] text-[#8A8D82]">{label}</p>
      <p className="mt-2 break-all text-[13px] font-medium text-[#1B1D11]">{value}</p>
    </div>
  )
}
