export type ProjectCardProps = {
  badge: string
  title: string
  dayPlan: string
  modules: number
  risks: number
  tags: Array<{
    label: string
    backgroundColor: string
  }>
  badgeIcon: string
  badgeBackground: string
  linkIcon: string
  moduleIcon: string
  riskIcon: string
}

export function ProjectCard({
  badge,
  title,
  dayPlan,
  modules,
  risks,
  tags,
  badgeIcon,
  badgeBackground,
  linkIcon,
  moduleIcon,
  riskIcon,
}: ProjectCardProps) {
  return (
    <a
      href="/travel-unpack/detail"
      className="relative overflow-hidden rounded-[32px] border border-[rgba(255,255,255,0.5)] bg-[#EAEAEB] p-[17px]"
      style={{
        boxShadow:
          '0px 4px 12px -2px rgba(0, 0, 0, 0.02), 0px 8px 24px -4px rgba(0, 0, 0, 0.04)',
      }}
    >
      <div className="absolute right-[1px] top-[1px] h-9 w-[140px] rounded-bl-[24px] bg-[#D8D8D8]" />

      <div className="relative flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <span
            className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full"
            style={{
              backgroundColor: badgeBackground,
              boxShadow: 'inset 0px 2px 4px 0px rgba(0, 0, 0, 0.05)',
            }}
          >
            <img src={badgeIcon} alt="" className="h-[25px] w-[25px]" />
          </span>

          <div>
            <p className="pb-0.5 text-sm font-medium leading-[21px] text-[rgba(27,29,17,0.8)]">
              {badge}
            </p>
            <h3 className="text-xl font-bold leading-[25px] text-[#1B1D11]">{title}</h3>
          </div>
        </div>

        <div className="shrink-0 pr-2 text-right">
          <p className="text-[8px] uppercase tracking-[0.1em] text-[#464934]">DAY PLAN</p>
          <p className="mt-0.5 text-2xl font-black leading-6 text-[#1B1D11]">{dayPlan}</p>
        </div>
      </div>

      <div className="mt-4 border-t border-dashed border-[rgba(27,29,17,0.2)]" />

      <div className="mt-3 flex items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-bold leading-[18px] text-[#1B1D11]">{modules}</span>
            <span className="text-[10px] leading-[15px] text-[rgba(27,29,17,0.7)]">
              个模块
            </span>
            <img src={moduleIcon} alt="" className="h-[10px] w-[10px]" />
          </div>

          <span className="h-3 w-px bg-[rgba(27,29,17,0.2)]" aria-hidden="true" />

          <div className="flex items-center gap-1.5">
            <span className="text-lg font-bold leading-[18px] text-[#1B1D11]">{risks}</span>
            <span className="text-[10px] leading-[15px] text-[rgba(27,29,17,0.7)]">
              个避雷点
            </span>
            <img src={riskIcon} alt="" className="h-[10px] w-[11px]" />
          </div>
        </div>

        <span
          className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1B1D11]/60 transition-transform duration-200 hover:scale-105"
        >
          <img src={linkIcon} alt="" className="h-3 w-auto" />
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 pr-8">
        {tags.map((tag) => (
          <span
            key={tag.label}
            className="rounded-full px-2 py-0.5 text-[9px] leading-[13.5px] text-[rgba(27,29,17,0.8)]"
            style={{
              backgroundColor: tag.backgroundColor,
            }}
          >
            {tag.label}
          </span>
        ))}
      </div>
    </a>
  )
}
