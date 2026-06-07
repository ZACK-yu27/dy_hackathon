import type { ReactNode } from 'react'
import type { Category } from '../types/domain'
import { categoryColor } from '../utils/format'

type NoticeCardProps = {
  title: string
  description: string
  tone?: 'neutral' | 'success' | 'warning' | 'danger'
}

const toneClassMap: Record<NonNullable<NoticeCardProps['tone']>, string> = {
  neutral: 'border-[#E5E1D4] bg-[#F8F5EB] text-[#525244]',
  success: 'border-[#CFE58A] bg-[#F0F8D2] text-[#40501D]',
  warning: 'border-[#EBCB8A] bg-[#FFF3D8] text-[#6B4E18]',
  danger: 'border-[#F1B6AD] bg-[#FDEAE7] text-[#7E2F24]',
}

export function NoticeCard({ title, description, tone = 'neutral' }: NoticeCardProps) {
  return (
    <div className={`rounded-[20px] border px-4 py-3 ${toneClassMap[tone]}`}>
      <p className="text-[13px] font-semibold">{title}</p>
      <p className="mt-1 text-[13px] leading-6 opacity-90">{description}</p>
    </div>
  )
}

export function SectionCard({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`rounded-[24px] border border-[rgba(255,255,255,0.6)] bg-[#F7F5EE] p-5 shadow-[0px_8px_24px_rgba(27,29,17,0.06)] ${className}`}>
      {children}
    </section>
  )
}

export function StatusBadge({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${className}`}>
      {children}
    </span>
  )
}

export function CategoryBadge({ category }: { category: Category }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${categoryColor(category)}`}>
      {category}
    </span>
  )
}

export function EmptyState({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="rounded-[20px] border border-dashed border-[#C9C5B3] px-4 py-8 text-center text-[#6A6D62]">
      <p className="text-[15px] font-semibold text-[#2E3127]">{title}</p>
      <p className="mt-2 text-[13px] leading-6">{description}</p>
    </div>
  )
}

export function StaticPlaceholderTag() {
  return (
    <span className="inline-flex rounded-full bg-[#111] px-3 py-1 text-[11px] font-medium text-[#D4EF2E]">
      静态占位，待后端接入
    </span>
  )
}
