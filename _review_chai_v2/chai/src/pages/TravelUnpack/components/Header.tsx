import aiBadgeIcon from '../../../assets/icons/ai-badge.svg'

type HeaderProps = {
  title?: string
  subtitle?: string
  actionText?: string
  actionHref?: string
  actionIcon?: string
}

export function Header({
  title = '旅拆拆',
  subtitle,
  actionText = 'AI 拆攻略',
  actionHref = '/travel-unpack/new-project',
  actionIcon = aiBadgeIcon,
}: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-5 pb-4 pt-10">
      <div>
        <h1 className="text-4xl font-black leading-[44px] text-[#1B1D11]">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 text-[14px] leading-5 text-[#64675A]">{subtitle}</p>
        ) : null}
      </div>

      <a
        href={actionHref}
        className="group relative inline-flex h-8 w-[106.64px] items-center justify-center gap-1.5 rounded-full bg-[#1B1D11] px-4 transition-transform duration-200 hover:-translate-y-0.5"
        style={{
          boxShadow: '0px 2px 4px -2px rgba(0, 0, 0, 0.1), 0px 4px 6px -1px rgba(0, 0, 0, 0.1)',
        }}
      >
        <img src={actionIcon} alt="" className="h-[15px] w-[15px]" />
        <span
          className="text-xs font-bold tracking-[0.05em] text-[#D4F02F]"
          style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans SC", sans-serif' }}
        >
          {actionText}
        </span>
      </a>
    </header>
  )
}
