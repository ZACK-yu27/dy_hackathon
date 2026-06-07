import { BottomNavigation } from '../TravelUnpack/components/BottomNavigation'
import exploreListFoodIcon from '../../assets/icons/figma-deep/explore-list-food.svg'
import exploreListMore2Icon from '../../assets/icons/figma-deep/explore-list-more-2.svg'
import exploreListMoreIcon from '../../assets/icons/figma-deep/explore-list-more.svg'
import exploreListRiskIcon from '../../assets/icons/figma-deep/explore-list-risk.svg'
import exploreListRiskQueueIcon from '../../assets/icons/figma-deep/explore-list-risk-queue.svg'
import exploreListSightIcon from '../../assets/icons/figma-deep/explore-list-sight.svg'
import exploreMetricCityIcon from '../../assets/icons/figma-deep/explore-metric-city.svg'
import exploreMetricRiskIcon from '../../assets/icons/figma-deep/explore-metric-risk.svg'
import exploreMetricTemplateIcon from '../../assets/icons/figma-deep/explore-metric-template.svg'
import exploreMoreArrowIcon from '../../assets/icons/figma-deep/explore-more-arrow.svg'
import explorePrimaryModulesIcon from '../../assets/icons/figma-deep/explore-primary-modules.svg'
import explorePrimaryRisksIcon from '../../assets/icons/figma-deep/explore-primary-risks.svg'
import exploreRankHeaderIcon from '../../assets/icons/figma-deep/explore-rank-header.svg'
import exploreRiskHotIcon from '../../assets/icons/figma-deep/explore-risk-hot.svg'
import exploreRiskQueueIcon from '../../assets/icons/figma-deep/explore-risk-queue.svg'
import exploreSecondaryRiskBookingIcon from '../../assets/icons/figma-deep/explore-secondary-risk-booking.svg'
import exploreSecondaryRiskCrowdIcon from '../../assets/icons/figma-deep/explore-secondary-risk-crowd.svg'
import exploreSecondaryTagHotelIcon from '../../assets/icons/figma-deep/explore-secondary-tag-hotel.svg'
import exploreSecondaryTagSightIcon from '../../assets/icons/figma-deep/explore-secondary-tag-sight.svg'
import exploreSecondaryTagTransportIcon from '../../assets/icons/figma-deep/explore-secondary-tag-transport.svg'
import exploreTagFoodIcon from '../../assets/icons/figma-deep/explore-tag-food.svg'
import exploreTagSightIcon from '../../assets/icons/figma-deep/explore-tag-sight.svg'
import exploreTagTransportIcon from '../../assets/icons/figma-deep/explore-tag-transport.svg'
import { DeviceScrollView, DeviceShell, SectionHeading } from '../../components/TravelUi'
import { Header } from '../TravelUnpack/components/Header'
import { SearchBar } from '../TravelUnpack/components/SearchBar'

const hotRoutes = [
  { title: '少排队外滩路线', subtitle: '避开 18:00-20:00 高峰', tags: [{ label: '景点' }, { label: '交通' }, { label: '餐饮' }], risk: '人流高峰', color: '#4B8BEE', icon: exploreListSightIcon, riskIcon: exploreListRiskIcon, moreIcon: exploreListMoreIcon },
  { title: '避开网红餐厅排队路线', subtitle: '饭点后出行更省心', tags: [{ label: '餐饮' }, { label: '交通' }], risk: '饭点排队', color: '#5EC2B4', icon: exploreListFoodIcon, riskIcon: exploreListRiskQueueIcon, moreIcon: exploreListMore2Icon },
]

const ranking = [
  { city: '上海', count: '36 个热门避雷点', tag: '人流密集' },
  { city: '杭州', count: '28 个热门避雷点', tag: '节假日排队' },
  { city: '厦门', count: '21 个热门避雷点', tag: '住宿涨价' },
]

export default function TravelExplorePage() {
  return (
    <DeviceShell className="bg-[#F3F2EC]">
      <DeviceScrollView bottomInset={122}>
        <Header title="探索" subtitle="发现别人踩过的坑" actionText="AI 避雷" />
        <SearchBar placeholder="搜索城市 / 景点 / 避雷关键词" href="/travel-unpack/explore" />

        <div className="px-5 pt-6">

        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            ['36', '城市', exploreMetricCityIcon],
            ['128', '避雷点', exploreMetricRiskIcon],
            ['24', '模板', exploreMetricTemplateIcon],
          ].map(([value, label, icon]) => (
            <div key={label} className="rounded-[22px] bg-[#F9F8F4] p-4 shadow-[0px_8px_20px_rgba(27,29,17,0.04)]">
              <img src={icon} alt="" className="h-[18px] w-[18px]" />
              <div className="mt-2 text-[36px] font-bold leading-none text-[#1B1D11]">{value}</div>
              <div className="mt-2 text-[14px] text-[#8A8D92]">{label}</div>
            </div>
          ))}
        </div>

        <section className="mt-8">
          <SectionHeading title="推荐示例项目" />
          <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
            <a href="/travel-unpack/detail" className="block w-[268px] shrink-0 overflow-hidden rounded-[20px] bg-[#D4EF2E] p-5 shadow-[0px_10px_24px_rgba(27,29,17,0.07)]">
              <div className="text-xs text-[#61652D]">DAY / 1 日</div>
              <h2 className="mt-2 text-[20px] font-medium text-[#1B1D11]">上海错峰避坑之旅</h2>
              <p className="mt-1 text-[13px] text-[#4F5630]">少排队，少踩坑的 1 日路线</p>
              <div className="mt-5 flex items-center gap-4 text-sm">
                <span className="inline-flex items-center gap-1">
                  <img src={explorePrimaryModulesIcon} alt="" className="h-[14px] w-[14px]" />
                  12 个模块
                </span>
                <span className="inline-flex items-center gap-1">
                  <img src={explorePrimaryRisksIcon} alt="" className="h-[14px] w-[14px]" />
                  8 个避雷点
                </span>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {[
                  ['景点', exploreTagSightIcon],
                  ['交通', exploreTagTransportIcon],
                  ['餐饮', exploreTagFoodIcon],
                ].map(([tag, icon]) => (
                  <span key={tag} className="inline-flex items-center gap-1 rounded-[6px] bg-[#3C87E7] px-3 py-1 text-xs text-white">
                    <img src={icon} alt="" className="h-[12px] w-[12px]" />
                    {tag}
                  </span>
                ))}
                <span className="inline-flex items-center gap-1 rounded-full bg-[#111] px-3 py-1 text-xs text-[#D4EF2E]">
                  <img src={exploreRiskHotIcon} alt="" className="h-[12px] w-[12px]" />
                  晚高峰人多
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#111] px-3 py-1 text-xs text-[#D4EF2E]">
                  <img src={exploreRiskQueueIcon} alt="" className="h-[12px] w-[12px]" />
                  饭点排队
                </span>
              </div>
            </a>

            <a href="/travel-unpack/detail" className="block w-[180px] shrink-0 rounded-[20px] bg-white p-5 shadow-[0px_8px_20px_rgba(27,29,17,0.04)]">
              <div className="text-xs text-[#989B9F]">DAY / 2 日</div>
              <h2 className="mt-2 text-[20px] font-medium text-[#343941]">杭州周末轻松游</h2>
              <p className="mt-1 text-[13px] text-[#85898E]">周末出行党松弛感线路</p>
              <div className="mt-6 text-[15px] text-[#535965]">10 个模块 ◌</div>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-[6px] bg-[#417FE0] px-3 py-1 text-xs text-white">
                  <img src={exploreSecondaryTagSightIcon} alt="" className="h-[12px] w-[12px]" />
                  景点
                </span>
                <span className="inline-flex items-center gap-1 rounded-[6px] bg-[#4A8FDC] px-3 py-1 text-xs text-white">
                  <img src={exploreSecondaryTagTransportIcon} alt="" className="h-[12px] w-[12px]" />
                  交通
                </span>
                <span className="inline-flex items-center gap-1 rounded-[6px] bg-[#8791B8] px-3 py-1 text-xs text-white">
                  <img src={exploreSecondaryTagHotelIcon} alt="" className="h-[12px] w-[12px]" />
                  住宿
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#111] px-3 py-1 text-xs text-[#D4EF2E]">
                  <img src={exploreSecondaryRiskBookingIcon} alt="" className="h-[12px] w-[12px]" />
                  景区预约
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#111] px-3 py-1 text-xs text-[#D4EF2E]">
                  <img src={exploreSecondaryRiskCrowdIcon} alt="" className="h-[12px] w-[12px]" />
                  周末人多
                </span>
              </div>
            </a>
          </div>
        </section>

        <section className="mt-8">
          <SectionHeading title="热门避雷路线" />
          <div className="mt-4 space-y-3">
            {hotRoutes.map((route) => (
              <a key={route.title} href="/travel-unpack/risk-detail" className="flex items-start gap-4 rounded-[22px] bg-white p-4 shadow-[0px_8px_20px_rgba(27,29,17,0.04)]">
                <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-[18px]" style={{ backgroundColor: route.color }}>
                  <img src={route.icon} alt="" className="h-8 w-8" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[18px] leading-6 text-[#30353F]">{route.title}</h3>
                  <p className="mt-1 text-[13px] text-[#8B9096]">{route.subtitle}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {route.tags.map((tag) => (
                      <span key={tag.label} className="rounded-full bg-[#F2F3EA] px-2 py-1 text-[11px] text-[#8D9388]">{tag.label}</span>
                    ))}
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#FFE4DE] px-2 py-1 text-[11px] text-[#EA6758]">
                      <img src={route.riskIcon} alt="" className="h-[12px] w-[12px]" />
                      {route.risk}
                    </span>
                  </div>
                </div>
                <span className="pt-1 text-[#6C7280]">
                  <img src={route.moreIcon} alt="" className="h-[18px] w-[18px]" />
                </span>
              </a>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <SectionHeading title="城市避坑榜" />
          <div className="mt-4 overflow-hidden rounded-[22px] bg-[#111] text-white shadow-[0px_8px_24px_rgba(27,29,17,0.08)]">
            <div className="grid grid-cols-[54px_1fr_1fr_72px] gap-3 px-4 py-4 text-[12px] text-white/70">
              <span>排名</span>
              <span>城市</span>
              <span>城市与避坑点数量</span>
              <span className="inline-flex items-center gap-1">
                <img src={exploreRankHeaderIcon} alt="" className="h-[12px] w-[12px]" />
                主要风险
              </span>
            </div>
            {ranking.map((row, index) => (
              <div key={row.city} className="grid grid-cols-[54px_1fr_1fr_72px] items-center gap-3 border-t border-white/10 bg-[#F7F5EE] px-4 py-4 text-[#2B2B27]">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded bg-[#D4EF2E] font-bold">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="text-[16px]">{row.city}</span>
                <span className="text-[12px] text-[#7A7A73]">{row.count}</span>
                <span className="rounded-full bg-[#FAD5BA] px-2 py-1 text-center text-[10px] text-[#DE634E]">
                  {row.tag}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <SectionHeading title="可复制项目模板" />
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              ['城市一日错峰模板', '景点 × 交通', '餐饮 × 景点'],
              ['周末轻行模板', '住宿场景', '缺省夜景'],
              ['多人出行模板', '交通避让', '风险提醒'],
            ].map(([title, line1, line2]) => (
              <article key={title} className="rounded-[18px] bg-white p-4 shadow-[0px_8px_20px_rgba(27,29,17,0.04)]">
                <div className="text-xl">⌘</div>
                <h3 className="mt-3 text-[16px] leading-6 text-[#2C313B]">{title}</h3>
                <p className="mt-2 text-[11px] leading-5 text-[#8A8F95]">{line1}</p>
                <p className="text-[11px] leading-5 text-[#8A8F95]">{line2}</p>
                <div className="mt-3 flex justify-end">
                  <span className="flex h-7 w-7 items-center justify-center rounded bg-[#D4EF2E]">
                    <img src={exploreMoreArrowIcon} alt="" className="h-[12px] w-[12px] rotate-[-90deg]" />
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>
        </div>
      </DeviceScrollView>

      <div className="pointer-events-none absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2">
        <BottomNavigation active="探索" />
      </div>
    </DeviceShell>
  )
}
