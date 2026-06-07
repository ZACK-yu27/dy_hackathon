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
      className="relative mx-auto block w-full max-w-[326px] rounded-[30px]"
      style={{
        boxShadow:
          '0px 18px 40px rgba(27, 29, 17, 0.06)',
      }}
    >
      <div className="relative min-h-[184px] overflow-hidden rounded-[30px] border border-white/70 bg-white/95 px-5 pb-5 pt-5">
        <div className="absolute right-0 top-0 h-[78px] w-[124px] rounded-bl-[30px] bg-[#E9E9E3]" />

        <div className="relative flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-4">
            <span
              className="inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-full"
              style={{
                backgroundColor: badgeBackground,
                boxShadow: 'inset 0px 2px 4px 0px rgba(0, 0, 0, 0.05)',
              }}
            >
              <img src={badgeIcon} alt="" className="h-[28px] w-[28px]" />
            </span>

            <div className="min-w-0 pt-1">
              <p className="pb-1 text-sm font-medium leading-5 text-[rgba(27,29,17,0.72)]">
                {badge}
              </p>
              <h3 className="text-xl font-black leading-[25px] text-[#1B1D11]">{title}</h3>
            </div>
          </div>

          <div className="relative z-10 shrink-0 pr-1 pt-1 text-right">
            <p className="text-[9px] font-black uppercase tracking-[0.1em] text-[#9A9B94]">DAY PLAN</p>
            <p className="mt-1 text-[34px] font-black leading-8 text-[#2D2F2A]">{dayPlan}</p>
          </div>
        </div>

        <div className="mt-5 border-t border-dashed border-[rgba(27,29,17,0.16)]" />

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black leading-5 text-[#1B1D11]">{modules}</span>
                <span className="text-[10px] leading-[15px] text-[rgba(27,29,17,0.7)]">
                  个模块
                </span>
                <img src={moduleIcon} alt="" className="h-[10px] w-[10px]" />
              </div>

              <span className="h-4 w-px bg-[rgba(27,29,17,0.16)]" aria-hidden="true" />

              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black leading-5 text-[#1B1D11]">{risks}</span>
                <span className="text-[10px] leading-[15px] text-[rgba(27,29,17,0.7)]">
                  个避雷点
                </span>
                <img src={riskIcon} alt="" className="h-[10px] w-[11px]" />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pr-1">
              {tags.map((tag) => (
                <span
                  key={tag.label}
                  className="rounded-full px-2.5 py-1 text-[10px] leading-[14px] text-[rgba(27,29,17,0.75)]"
                  style={{
                    backgroundColor: tag.backgroundColor,
                  }}
                >
                  {tag.label}
                </span>
              ))}
            </div>
          </div>

          <span
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1B1D11]/70 transition-transform duration-200 hover:scale-105"
          >
            <img src={linkIcon} alt="" className="h-3.5 w-auto" />
          </span>
        </div>
      </div>
    </a>
  )
}
