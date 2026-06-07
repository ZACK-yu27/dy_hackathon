import type { CSSProperties, ReactNode } from 'react'

type DeviceShellProps = {
  children: ReactNode
  className?: string
  style?: CSSProperties
}

export function DeviceShell({ children, className = '', style }: DeviceShellProps) {
  const mergedStyle: CSSProperties = {
    height: 'min(calc(100dvh - 24px), 884px)',
    ...style,
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#e7e4d6] px-3 py-3 md:px-6 md:py-6">
      <div
        className={`relative mx-auto w-full max-w-[390px] overflow-hidden rounded-[42px] border-[10px] border-[#171812] bg-[#F5F4ED] shadow-[0px_22px_58px_rgba(27,29,17,0.22)] ${className}`}
        style={mergedStyle}
      >
        <div className="pointer-events-none absolute left-1/2 top-2 z-50 h-[24px] w-[116px] -translate-x-1/2 rounded-full bg-[#171812]" />
        <div className="pointer-events-none absolute inset-0 z-40 rounded-[32px] ring-1 ring-inset ring-white/25" />
        {children}
      </div>
    </main>
  )
}

type DeviceScrollViewProps = {
  children: ReactNode
  className?: string
  bottomInset?: number
}

export function DeviceScrollView({
  children,
  className = '',
  bottomInset = 0,
}: DeviceScrollViewProps) {
  return (
    <div
      className={`relative h-full overflow-y-auto overscroll-contain scrollbar-hidden ${className}`}
      style={{ paddingBottom: bottomInset }}
    >
      {children}
    </div>
  )
}

type SectionHeadingProps = {
  title: string
  action?: string
}

export function SectionHeading({ title, action = '更多' }: SectionHeadingProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="h-5 w-1 rounded-full bg-[#D4EF2E]" />
        <h2 className="text-[26px] font-bold leading-8 text-[#1B1D11]">{title}</h2>
      </div>
      <span className="text-xs text-[#1B1D11]/55">{action}</span>
    </div>
  )
}

type GlyphProps = {
  className?: string
}

export function GlyphBack({ className = 'h-5 w-5' }: GlyphProps) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none" aria-hidden="true">
      <path d="M12.5 4.5L7 10l5.5 5.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function GlyphClose({ className = 'h-5 w-5' }: GlyphProps) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none" aria-hidden="true">
      <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}

export function GlyphDots({ className = 'h-5 w-5' }: GlyphProps) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="currentColor" aria-hidden="true">
      <circle cx="4" cy="10" r="1.8" />
      <circle cx="10" cy="10" r="1.8" />
      <circle cx="16" cy="10" r="1.8" />
    </svg>
  )
}

export function GlyphSearch({ className = 'h-5 w-5' }: GlyphProps) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none" aria-hidden="true">
      <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="2" />
      <path d="M12.5 12.5L17 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function GlyphPlus({ className = 'h-5 w-5' }: GlyphProps) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none" aria-hidden="true">
      <path d="M10 4.5v11M4.5 10h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function GlyphPlane({ className = 'h-5 w-5' }: GlyphProps) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="currentColor" aria-hidden="true">
      <path d="M18.3 9.1c.5.2.8.7.7 1.2-.1.5-.5.9-1 .9l-5.6.5-4.1 5.2c-.2.3-.7.4-1 .2l-1-.6c-.3-.2-.5-.5-.4-.9l1.2-4-3.8-.3-1.7 1.4c-.2.2-.6.2-.8.1l-.8-.5c-.3-.2-.4-.6-.2-.9L2 9.9.3 7.5c-.2-.3-.1-.7.2-.9l.8-.5c.3-.1.6-.1.8.1L3.8 7.6l3.8-.3-1.2-4c-.1-.3 0-.7.4-.9l1-.6c.3-.2.7-.1 1 .2l4.1 5.2 5.4.9Z" />
    </svg>
  )
}

export function GlyphPin({ className = 'h-5 w-5' }: GlyphProps) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="currentColor" aria-hidden="true">
      <path d="M10 18s5-5.1 5-9a5 5 0 10-10 0c0 3.9 5 9 5 9Zm0-6.5A2.5 2.5 0 1010 6a2.5 2.5 0 000 5.5Z" />
    </svg>
  )
}

export function GlyphWarning({ className = 'h-5 w-5' }: GlyphProps) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="currentColor" aria-hidden="true">
      <path d="M10 2.5l8 14H2l8-14Zm-.9 4.2.2 5h1.4l.2-5H9.1Zm.9 8.2a1 1 0 100-2 1 1 0 000 2Z" />
    </svg>
  )
}

export function GlyphGrid({ className = 'h-5 w-5' }: GlyphProps) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="currentColor" aria-hidden="true">
      <rect x="3" y="3" width="4" height="4" rx="1" />
      <rect x="9" y="3" width="4" height="4" rx="1" />
      <rect x="3" y="9" width="4" height="4" rx="1" />
      <rect x="9" y="9" width="4" height="4" rx="1" />
    </svg>
  )
}
