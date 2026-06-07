import { useEffect, useMemo, useState } from 'react'
import riskBadgeWarningIcon from '../../assets/icons/figma-deep/risk-badge-warning.svg'
import riskCloseIcon from '../../assets/icons/figma-deep/risk-close.svg'
import riskConfirmSmileIcon from '../../assets/icons/figma-deep/risk-confirm-smile.svg'
import riskLinkArrowIcon from '../../assets/icons/figma-deep/risk-link-arrow.svg'
import riskRelatedBlockIcon from '../../assets/icons/figma-deep/risk-related-block.svg'
import riskSourceIcon from '../../assets/icons/figma-deep/risk-source.svg'
import riskTitleWarningIcon from '../../assets/icons/figma-deep/risk-title-warning.svg'
import riskBackgroundImage from '../../assets/images/risk-background.png'
import { listStructuredItems, listWarnings } from '../../api/ingest'
import { ApiError } from '../../api/http'
import { EmptyState, NoticeCard, StatusBadge } from '../../components/BusinessUi'
import { DeviceShell } from '../../components/TravelUi'
import type { StructuredItemRecord, WarningRecord } from '../../types/domain'
import { formatDateTime } from '../../utils/format'
import { getLatestUpload, getSelectedWarning } from '../../utils/storage'

export default function TravelRiskDetailPage() {
  const [warning, setWarning] = useState<WarningRecord | null>(null)
  const [relatedItem, setRelatedItem] = useState<StructuredItemRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const params = useMemo(() => new URLSearchParams(window.location.search), [])
  const requestedWarningId = Number(params.get('warningId') ?? '')

  useEffect(() => {
    async function loadWarning() {
      setLoading(true)
      setError('')

      try {
        const cachedWarning = getSelectedWarning()
        const latest = getLatestUpload()

        const latestMatchedWarning =
          latest?.warnings.find((item) => item.id === requestedWarningId) ??
          (latest && !requestedWarningId ? latest.warnings[0] : null) ??
          null

        let resolvedWarning =
          (cachedWarning && cachedWarning.id === requestedWarningId ? cachedWarning : null) ??
          latestMatchedWarning

        if (!resolvedWarning) {
          const warningResponse = await listWarnings({
            limit: 100,
            category: cachedWarning?.category ?? '',
            keyword: cachedWarning?.name ?? '',
          })
          resolvedWarning =
            warningResponse.items.find((item) => item.id === requestedWarningId) ??
            warningResponse.items[0] ??
            null
        }

        setWarning(resolvedWarning)

        if (!resolvedWarning) {
          setRelatedItem(null)
          return
        }

        const latestItem =
          latest?.items.find((item) => item.id === resolvedWarning?.structured_item_id) ?? null

        if (latestItem) {
          setRelatedItem(latestItem)
          return
        }

        const itemResponse = await listStructuredItems({
          limit: 100,
          category: resolvedWarning.category,
          keyword: resolvedWarning.name,
        })

        setRelatedItem(
          itemResponse.items.find((item) => item.id === resolvedWarning?.structured_item_id) ??
            itemResponse.items.find((item) => item.name === resolvedWarning?.name) ??
            null,
        )
      } catch (loadError) {
        setError(loadError instanceof ApiError ? loadError.detail : 'warning 详情加载失败，请稍后重试。')
      } finally {
        setLoading(false)
      }
    }

    void loadWarning()
  }, [requestedWarningId])

  return (
    <DeviceShell style={{ background: 'linear-gradient(135deg, #566330 0%, #BDAF69 55%, #3B4E28 100%)' }}>
      <img src={riskBackgroundImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-55" />
      <div className="absolute inset-5 bg-[rgba(240,237,225,0.18)] backdrop-blur-[14px]" />
      <div className="absolute inset-0 bg-[rgba(31,33,18,0.28)]" />
      <div
        className="absolute inset-x-9 top-[138px] max-h-[calc(100%-158px)] overflow-y-auto rounded-[32px] bg-[#F7F6F1] px-7 pb-8 pt-6 scrollbar-hidden"
        style={{ boxShadow: '0px 24px 60px rgba(27,29,17,0.2)' }}
      >
        <div className="absolute left-0 top-0 flex h-[44px] items-center gap-2 rounded-tl-[12px] rounded-tr-[8px] bg-white px-5 text-[#5B463B]">
          <img src={riskTitleWarningIcon} alt="" className="h-[18px] w-[18px]" />
          <span className="text-[17px] font-medium">避雷详情</span>
        </div>

        <a
          href="/travel-unpack/detail"
          className="absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#ECE7D0] text-[#66614D]"
        >
          <img src={riskCloseIcon} alt="" className="h-[18px] w-[18px]" />
        </a>

        <div className="pt-10">
          <h1 className="text-[30px] leading-[42px] text-[#1B1D11]">
            {warning?.warning_summary || 'warning 详情'}
          </h1>

          <div className="mt-4 flex gap-2 text-sm">
            <span className="inline-flex items-center gap-1 rounded-[4px] border border-[#D13029] bg-[#D13029] px-3 py-1 text-white">
              <img src={riskBadgeWarningIcon} alt="" className="h-[12px] w-[12px]" />
              真实 Warning 记录
            </span>
            <span className="inline-flex items-center gap-1 rounded-[4px] bg-[#E9E5D5] px-3 py-1 text-[#716B5D]">
              <img src={riskSourceIcon} alt="" className="h-[12px] w-[12px]" />
              {warning ? warning.matched_by : '待加载'}
            </span>
          </div>

          {loading ? (
            <div className="mt-5">
              <NoticeCard title="加载中" description="正在请求真实 warning 数据。" tone="neutral" />
            </div>
          ) : null}

          {!loading && error ? (
            <div className="mt-5">
              <NoticeCard title="加载失败" description={error} tone="danger" />
            </div>
          ) : null}

          {!loading && !error && warning ? (
            <div className="mt-5 rounded-[14px] border border-[#E2DED0] bg-[#F2F0E5] px-5 py-4 text-[16px] leading-8 text-[#67614E]">
              <p>{warning.summary}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <StatusBadge className="bg-[#ECE7D0] text-[#5E5846]">
                  category = {warning.category}
                </StatusBadge>
                <StatusBadge className="bg-[#ECE7D0] text-[#5E5846]">
                  name = {warning.name}
                </StatusBadge>
              </div>
            </div>
          ) : null}

          <div className="mt-7 border-t border-[#E5E1D4] pt-6">
            <div className="mb-5 flex items-center gap-3">
              <span className="h-6 w-1 rounded-full bg-[#7A7A6D]" />
              <h2 className="text-[18px] text-[#5D584A]">关联积木</h2>
            </div>

            {relatedItem ? (
              <div className="flex items-center justify-between gap-4 rounded-[16px] border border-[#D9D3B0] bg-[#ECEAD7] p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-white text-[#6A6A64]">
                    <img src={riskRelatedBlockIcon} alt="" className="h-[18px] w-[18px]" />
                  </div>
                  <div>
                    <p className="text-[16px] text-[#444236]">
                      {relatedItem.category}：{relatedItem.name}
                    </p>
                    <p className="mt-1 text-[14px] text-[#5F5B4F]">{relatedItem.location}</p>
                  </div>
                </div>
                <span className="rounded-full bg-[#F8D5BA] px-4 py-2 text-[14px] text-[#D64A3D]">
                  ID {warning?.structured_item_id ?? '--'}
                </span>
              </div>
            ) : (
              <EmptyState
                title="未找到关联结构化条目"
                description="当前 warning 已加载，但没有在最近上传快照或历史查询结果中定位到对应结构化记录。"
              />
            )}
          </div>

          <div className="mt-7 border-t border-[#E5E1D4] pt-6">
            <div className="mb-4 flex items-center gap-3">
              <span className="h-6 w-1 rounded-full bg-[#7A7A6D]" />
              <h2 className="text-[18px] text-[#5D584A]">风险来源</h2>
            </div>
            {warning ? (
              <div className="space-y-3 text-[15px] text-[#6A6455]">
                <p>warning_source_id：{warning.warning_source_id}</p>
                <p>matched_by：{warning.matched_by}</p>
                <p>created_at：{formatDateTime(warning.created_at)}</p>
                <p>updated_at：{formatDateTime(warning.updated_at)}</p>
              </div>
            ) : (
              <EmptyState
                title="暂无来源信息"
                description="当前没有成功加载 warning 数据。"
              />
            )}
          </div>

          <div className="mt-7 border-t border-[#E5E1D4] pt-6">
            <div className="mb-4 flex items-center gap-3">
              <span className="h-6 w-1 rounded-full bg-[#7A7A6D]" />
              <h2 className="text-[18px] text-[#5D584A]">执行建议</h2>
            </div>
            {warning ? (
              <div className="space-y-4">
                <AdviceSection title="avoid_reasons" items={warning.avoid_reasons} />
                <AdviceSection title="execution_tips" items={warning.execution_tips} />
                <AdviceSection title="alternatives" items={warning.alternatives} />
                <AdviceSection title="confirm_before_go" items={warning.confirm_before_go} />
              </div>
            ) : (
              <EmptyState
                title="暂无建议项"
                description="后端返回的数组字段会在这里按 `string[]` 形式逐项展示。"
              />
            )}
          </div>

          <div className="mt-9 border-t border-[#E5E1D4] pt-6">
            <a
              href="/travel-unpack/detail"
              className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#D4EF2E] text-[20px] font-medium text-[#111] shadow-[inset_0px_-2px_0px_rgba(0,0,0,0.08)]"
            >
              知道了
              <img src={riskConfirmSmileIcon} alt="" className="h-[18px] w-[18px]" />
            </a>
            <a href="/travel-unpack" className="mt-5 inline-flex w-full items-center justify-center gap-1 text-center text-[16px] text-[#6F7A1F]">
              返回首页继续筛选
              <img src={riskLinkArrowIcon} alt="" className="h-[14px] w-[14px]" />
            </a>
          </div>
        </div>
      </div>
    </DeviceShell>
  )
}

function AdviceSection({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-[16px] bg-[#F2F0E5] px-4 py-4">
      <p className="text-sm font-semibold text-[#444236]">{title}</p>
      {items.length ? (
        <ul className="mt-3 space-y-2 text-sm leading-6 text-[#6A6455]">
          {items.map((item, index) => (
            <li key={`${title}-${index}`}>- {item}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-[#8B8578]">当前字段为空数组。</p>
      )}
    </div>
  )
}
