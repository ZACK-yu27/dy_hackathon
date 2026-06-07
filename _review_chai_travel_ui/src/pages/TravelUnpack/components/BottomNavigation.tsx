import navExploreIcon from '../../../assets/icons/nav-explore.svg'
import navHomeIcon from '../../../assets/icons/nav-home.svg'
import navProfileIcon from '../../../assets/icons/nav-profile.svg'

type BottomNavigationProps = {
  active: '首页' | '探索' | '我的'
}

const items = [
  { label: '首页', icon: navHomeIcon, href: '/travel-unpack' },
  { label: '探索', icon: navExploreIcon, href: '/travel-unpack/explore' },
  { label: '我的', icon: navProfileIcon, href: '/travel-unpack/profile' },
]

const activeIconFilter =
  'brightness(0) saturate(100%) invert(86%) sepia(88%) saturate(784%) hue-rotate(16deg) brightness(105%) contrast(94%)'

export function BottomNavigation({ active }: BottomNavigationProps) {
  return (
    <nav
      className="pointer-events-auto flex h-[72px] w-[358px] items-center justify-between rounded-full border border-[rgba(255,255,255,0.5)] bg-[rgba(251,251,231,0.8)] px-[32.66px] backdrop-blur-[24px]"
      style={{ boxShadow: '0px 4px 12px -2px rgba(0, 0, 0, 0.02), 0px 8px 24px -4px rgba(0, 0, 0, 0.04)' }}
    >
      {items.map((item) => (
        <a
          key={item.label}
          className="group flex h-full w-16 flex-col items-center justify-center"
          href={item.href}
        >
          {item.label === active ? (
            <>
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#1B1D11]">
                <img src={item.icon} alt="" className="h-auto w-[18px]" style={{ filter: activeIconFilter }} />
              </span>
              <span className="mt-[-1px] text-[10px] font-bold leading-[15px] text-[#1B1D11]">
                {item.label}
              </span>
              <span className="h-0.5 w-6 rounded-full bg-[#D4EF2E]" aria-hidden="true" />
            </>
          ) : (
            <>
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full transition-colors duration-200 group-hover:bg-[#1B1D11]/5">
                <img src={item.icon} alt="" className="h-auto w-[23px] opacity-40" style={{ filter: 'brightness(0) saturate(100%)' }} />
              </span>
              <span className="mt-1 text-[10px] font-medium leading-[15px] text-[#1B1D11]/60">
                {item.label}
              </span>
            </>
          )}
        </a>
      ))}
    </nav>
  )
}
