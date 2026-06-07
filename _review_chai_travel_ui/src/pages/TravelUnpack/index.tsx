import cardLinkIcon from '../../assets/icons/card-link.svg'
import cardLinkSecondaryIcon from '../../assets/icons/card-link-secondary.svg'
import cityBadgeIcon from '../../assets/icons/city-badge.svg'
import cityBadgeSecondaryIcon from '../../assets/icons/city-badge-secondary.svg'
import moduleMiniIcon from '../../assets/icons/module-mini.svg'
import moduleMiniSecondaryIcon from '../../assets/icons/module-mini-secondary.svg'
import riskMiniIcon from '../../assets/icons/risk-mini.svg'
import riskMiniSecondaryIcon from '../../assets/icons/risk-mini-secondary.svg'
import { BottomNavigation } from './components/BottomNavigation'
import { FeaturedProjectCard } from './components/FeaturedProjectCard'
import { FloatingActionButton } from './components/FloatingActionButton'
import { Header } from './components/Header'
import { ProjectCard, type ProjectCardProps } from './components/ProjectCard'
import { SearchBar } from './components/SearchBar'
import { SectionTitle } from './components/SectionTitle'
import { DeviceScrollView, DeviceShell } from '../../components/TravelUi'

// Figma MCP returned part of the Chinese copy with encoding issues.
// These labels are restored from the exported assets and visible design context.
const projectCards: ProjectCardProps[] = [
  {
    badge: '杭州 / 2 日',
    title: '杭州周末轻松游',
    dayPlan: '02',
    modules: 10,
    risks: 6,
    tags: [
      { label: '景区预约', backgroundColor: 'rgba(198, 201, 173, 0.3)' },
      { label: '周末人多', backgroundColor: 'rgba(212, 239, 46, 0.2)' },
    ],
    badgeIcon: cityBadgeIcon,
    badgeBackground: '#D4EF2E',
    linkIcon: cardLinkIcon,
    moduleIcon: moduleMiniIcon,
    riskIcon: riskMiniIcon,
  },
  {
    badge: '厦门 / 3 日',
    title: '厦门避雷清单',
    dayPlan: '03',
    modules: 14,
    risks: 9,
    tags: [
      { label: '海鲜防坑', backgroundColor: 'rgba(198, 201, 173, 0.3)' },
      { label: '网红店排队', backgroundColor: 'rgba(198, 201, 173, 0.3)' },
    ],
    badgeIcon: cityBadgeSecondaryIcon,
    badgeBackground: 'rgba(198, 201, 173, 0.4)',
    linkIcon: cardLinkSecondaryIcon,
    moduleIcon: moduleMiniSecondaryIcon,
    riskIcon: riskMiniSecondaryIcon,
  },
]

export default function TravelUnpackPage() {
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
          <SearchBar />
          <SectionTitle title="我的旅行项目" />

          <section className="space-y-6 px-5 pb-10 pt-6">
            <FeaturedProjectCard />

            {projectCards.map((card) => (
              <ProjectCard key={card.title} {...card} />
            ))}
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
