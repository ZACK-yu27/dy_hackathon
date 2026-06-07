import { BottomNavigation } from '../TravelUnpack/components/BottomNavigation'
import profileAvatarIcon from '../../assets/icons/figma-deep/profile-avatar.svg'
import profileCard2TagHotelIcon from '../../assets/icons/figma-deep/profile-card2-tag-hotel.svg'
import profileCard2TagSightIcon from '../../assets/icons/figma-deep/profile-card2-tag-sight.svg'
import profileCard2TagTransportIcon from '../../assets/icons/figma-deep/profile-card2-tag-transport.svg'
import profileCardMoreIcon from '../../assets/icons/figma-deep/profile-card-more.svg'
import profileDraftHomeIcon from '../../assets/icons/figma-deep/profile-draft-home.svg'
import profileGreenPattern from '../../assets/images/profile-green-pattern.png'
import profileHistoryArrowIcon from '../../assets/icons/figma-deep/profile-history-arrow.svg'
import profileHistoryGeneratedIcon from '../../assets/icons/figma-deep/profile-history-generated.svg'
import profileLinkArrowIcon from '../../assets/icons/figma-deep/profile-link-arrow.svg'
import profileModule1MoreIcon from '../../assets/icons/figma-deep/profile-module1-more.svg'
import profileModule1RiskIcon from '../../assets/icons/figma-deep/profile-module1-risk.svg'
import profileModule2Icon from '../../assets/icons/figma-deep/profile-module2-icon.svg'
import profileModule2MoreIcon from '../../assets/icons/figma-deep/profile-module2-more.svg'
import profileModule2RiskIcon from '../../assets/icons/figma-deep/profile-module2-risk.svg'
import profileModule3Icon from '../../assets/icons/figma-deep/profile-module3-icon.svg'
import profileModule3MoreIcon from '../../assets/icons/figma-deep/profile-module3-more.svg'
import profileModule3RiskIcon from '../../assets/icons/figma-deep/profile-module3-risk.svg'
import profileModule4Icon from '../../assets/icons/figma-deep/profile-module4-icon.svg'
import profileModule4MoreIcon from '../../assets/icons/figma-deep/profile-module4-more.svg'
import profileModule4RiskIcon from '../../assets/icons/figma-deep/profile-module4-risk.svg'
import profileRiskHolidayIcon from '../../assets/icons/figma-deep/profile-risk-holiday.svg'
import profileRiskHotIcon from '../../assets/icons/figma-deep/profile-risk-hot.svg'
import profileRiskQueueIcon from '../../assets/icons/figma-deep/profile-risk-queue.svg'
import profileRiskTaxiIcon from '../../assets/icons/figma-deep/profile-risk-taxi.svg'
import profileSettingsIcon from '../../assets/icons/figma-deep/profile-settings.svg'
import profileStatsDraftIcon from '../../assets/icons/figma-deep/profile-stats-draft.svg'
import profileStatsModuleIcon from '../../assets/icons/figma-deep/profile-stats-module.svg'
import profileStatsProjectIcon from '../../assets/icons/figma-deep/profile-stats-project.svg'
import profileTagFoodIcon from '../../assets/icons/figma-deep/profile-tag-food.svg'
import profileTagSightIcon from '../../assets/icons/figma-deep/profile-tag-sight.svg'
import profileTagTransportIcon from '../../assets/icons/figma-deep/profile-tag-transport.svg'
import { StaticPlaceholderTag } from '../../components/BusinessUi'
import { DeviceScrollView, DeviceShell, SectionHeading } from '../../components/TravelUi'
import { Header } from '../TravelUnpack/components/Header'
import { SearchBar } from '../TravelUnpack/components/SearchBar'

const shelfItems = [
  { title: '景点｜外滩', risk: '晚高峰人多', color: '#4B8BEE', icon: profileCard2TagSightIcon, more: profileModule1MoreIcon, riskIcon: profileModule1RiskIcon },
  { title: '住宿｜XX 酒店', risk: '隔音差', color: '#7F8AAD', icon: profileModule2Icon, more: profileModule2MoreIcon, riskIcon: profileModule2RiskIcon },
  { title: '饮食｜本地小馆', risk: '饭点排队', color: '#3DB39B', icon: profileModule3Icon, more: profileModule3MoreIcon, riskIcon: profileModule3RiskIcon },
  { title: '交通｜地铁 2 号', risk: '换乘耗时', color: '#79B24A', icon: profileModule4Icon, more: profileModule4MoreIcon, riskIcon: profileModule4RiskIcon },
]

export default function TravelProfilePage() {
  return (
    <DeviceShell className="bg-[#F3F2EC]">
      <DeviceScrollView bottomInset={122}>
        <Header
          title="我的"
          subtitle="个人旅行资产库"
          actionText="设置"
          actionHref="#settings"
          actionIcon={profileSettingsIcon}
        />
        <SearchBar placeholder="搜索我的项目 / 草稿 / 收藏模块" href="/travel-unpack/profile" />

        <div className="px-5 pt-5">
        <StaticPlaceholderTag />

        <section className="relative mt-5 overflow-hidden rounded-[24px] bg-[#D4EF2E] p-5 shadow-[0px_12px_28px_rgba(27,29,17,0.06)]">
          <img src={profileGreenPattern} alt="" className="pointer-events-none absolute right-[22px] top-[110px] h-4 w-16 opacity-80" />
          <div className="flex items-start justify-between">
            <div className="flex gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#111] text-3xl text-white">
                <img src={profileAvatarIcon} alt="" className="h-[26px] w-[26px]" />
              </div>
              <div>
                <h2 className="text-[20px] leading-7 text-[#1B1D11]">避坑旅行者</h2>
                <p className="mt-1 text-[13px] text-[#44511F]">静态演示账号 · 样例数据</p>
                <span className="mt-2 inline-flex rounded-full bg-[#111] px-3 py-1 text-[11px] text-white">MVP 0000</span>
              </div>
            </div>
            <button type="button" className="text-[#111]">
              <img src={profileCardMoreIcon} alt="" className="h-[16px] w-[16px]" />
            </button>
          </div>

          <div className="mt-5 grid grid-cols-3 border-t border-[#BFD423] pt-4 text-center">
            {[
              ['3', '项目', profileStatsProjectIcon],
              ['2', '草稿', profileStatsDraftIcon],
              ['12', '收藏模块', profileStatsModuleIcon],
            ].map(([num, label, icon]) => (
              <div key={label}>
                <img src={icon} alt="" className="mx-auto mb-1 h-[14px] w-[14px]" />
                <div className="text-[30px] font-bold leading-none text-[#1B1D11]">{num}</div>
                <div className="mt-1 text-[13px] text-[#4E5A23]">{label}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <SectionHeading title="我的旅行项目" action="查看全部" />
          <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
            <a href="/travel-unpack/detail" className="block w-[250px] shrink-0 rounded-[20px] border border-[#E4E0D0] bg-[#F6F1D7] p-4 shadow-[0px_8px_20px_rgba(27,29,17,0.04)]">
              <div className="text-xs text-[#7D7E45]">DAY / 1 日</div>
              <div className="mt-2 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-[20px] leading-7 text-[#2F3133]">上海错峰避坑之旅</h3>
                  <p className="mt-1 text-[14px] text-[#7E8277]">少排队，少踩坑的 1 日路线</p>
                </div>
                <img src={profileCardMoreIcon} alt="" className="h-[16px] w-[16px]" />
              </div>
              <div className="mt-4 flex gap-4 text-[15px] text-[#2F3133]">
                <span>12 模块</span>
                <span>8 避雷</span>
                <span>已选 5</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#111] px-3 py-1 text-xs text-[#F45B57]">
                  <img src={profileRiskHotIcon} alt="" className="h-[12px] w-[12px]" />
                  晚高峰人多
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#111] px-3 py-1 text-xs text-[#F45B57]">
                  <img src={profileRiskQueueIcon} alt="" className="h-[12px] w-[12px]" />
                  饭点排队
                </span>
                <span className="inline-flex items-center gap-1 rounded-[4px] bg-[#D4E5FF] px-3 py-1 text-xs text-[#437BE4]">
                  <img src={profileTagSightIcon} alt="" className="h-[12px] w-[12px]" />
                  景点
                </span>
                <span className="inline-flex items-center gap-1 rounded-[4px] bg-[#D4F2E8] px-3 py-1 text-xs text-[#2AA695]">
                  <img src={profileTagTransportIcon} alt="" className="h-[12px] w-[12px]" />
                  交通
                </span>
                <span className="inline-flex items-center gap-1 rounded-[4px] bg-[#DDF0D4] px-3 py-1 text-xs text-[#6A8E20]">
                  <img src={profileTagFoodIcon} alt="" className="h-[12px] w-[12px]" />
                  饮食
                </span>
              </div>
            </a>

            <a href="/travel-unpack/detail" className="block w-[160px] shrink-0 rounded-[20px] border border-[#E4E0D0] bg-[#F7F3E7] p-4">
              <div className="text-xs text-[#7D7E45]">杭州 / 周末</div>
              <h3 className="mt-3 text-[18px] leading-7 text-[#40454D]">杭州周末轻松游</h3>
              <div className="mt-5 text-[15px] text-[#4F5460]">9 模块</div>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-[4px] bg-[#D4E5FF] px-3 py-1 text-xs text-[#437BE4]">
                  <img src={profileCard2TagSightIcon} alt="" className="h-[12px] w-[12px]" />
                  景点
                </span>
                <span className="inline-flex items-center gap-1 rounded-[4px] bg-[#D4F2E8] px-3 py-1 text-xs text-[#2AA695]">
                  <img src={profileCard2TagTransportIcon} alt="" className="h-[12px] w-[12px]" />
                  交通
                </span>
                <span className="inline-flex items-center gap-1 rounded-[4px] bg-[#D7DAF6] px-3 py-1 text-xs text-[#6C73A8]">
                  <img src={profileCard2TagHotelIcon} alt="" className="h-[12px] w-[12px]" />
                  住宿
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#FFE2DC] px-3 py-1 text-xs text-[#E76758]">
                  <img src={profileRiskHolidayIcon} alt="" className="h-[12px] w-[12px]" />
                  节假日排队
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#FFE2DC] px-3 py-1 text-xs text-[#E76758]">
                  <img src={profileRiskTaxiIcon} alt="" className="h-[12px] w-[12px]" />
                  打车排队
                </span>
              </div>
            </a>
          </div>
        </section>

        <section className="mt-8">
          <SectionHeading title="草稿路线" />
          <div className="mt-4 rounded-[22px] border border-[#E4E0D0] bg-[#F8F5E5] p-5 shadow-[0px_8px_20px_rgba(27,29,17,0.04)]">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#F1F4DE] text-[#7A8020]">
                  <img src={profileDraftHomeIcon} alt="" className="h-[18px] w-[18px]" />
                </div>
                <div>
                  <h3 className="text-[18px] text-[#2F3137]">杭州周末轻松游</h3>
                  <p className="mt-1 text-[13px] text-[#8A8E95]">DAY 5 / 9 00</p>
                </div>
              </div>
              <div className="h-1.5 w-[120px] rounded-full bg-[#E0DDCD]">
                <div className="h-full w-[70%] rounded-full bg-[#BFD423]" />
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between text-[13px] text-[#61666B]">
              <div className="flex gap-4">
                <span>景点</span>
                <span>交通</span>
                <span>饮食 ↔</span>
              </div>
              <a href="/travel-unpack/detail" className="inline-flex items-center gap-1 rounded-full bg-[#111] px-4 py-2 text-white">
                继续编辑
                <img src={profileLinkArrowIcon} alt="" className="h-[12px] w-[12px]" />
              </a>
            </div>
          </div>
        </section>

        <section id="settings" className="mt-8">
          <SectionHeading title="收藏模块" />
          <div className="mt-4 grid grid-cols-2 gap-3">
            {shelfItems.map((item) => (
              <article key={item.title} className="rounded-[18px] border border-[#E4E0D0] bg-[#F7F3E7] p-4 shadow-[0px_8px_20px_rgba(27,29,17,0.04)]">
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[12px] text-white" style={{ backgroundColor: item.color }}>
                    <img src={item.icon} alt="" className="h-[16px] w-[16px]" />
                  </div>
                  <img src={item.more} alt="" className="h-[14px] w-[14px]" />
                </div>
                <h3 className="mt-3 text-[16px] text-[#30343A]">{item.title}</h3>
                <p className="mt-2 inline-flex items-center gap-1 text-[12px] text-[#E86457]">
                  <img src={item.riskIcon} alt="" className="h-[12px] w-[12px]" />
                  {item.risk}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <SectionHeading title="历史解析记录" />
          <div className="mt-4 rounded-[20px] border border-[#E4E0D0] bg-[#F8F5E5] p-4 shadow-[0px_8px_20px_rgba(27,29,17,0.04)]">
            {[
              ['06.06', '解析：上海一日游', '已生成 12 积木'],
              ['06.05', '解析：杭州周末路线', '已生成 9 积木'],
            ].map(([date, title, result], index) => (
              <div key={date} className={`flex items-center justify-between py-3 ${index > 0 ? 'border-t border-[#E4E0D0]' : ''}`}>
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-[#D4EF2E]" />
                  <span className="font-medium text-[#2B2E35]">{date}</span>
                  <span className="text-[#525760]">{title}</span>
                </div>
                <span className="inline-flex items-center gap-1 text-[12px] text-[#8A8D92]">
                  <img src={profileHistoryGeneratedIcon} alt="" className="h-[12px] w-[12px]" />
                  {result}
                  <img src={profileHistoryArrowIcon} alt="" className="h-[12px] w-[12px]" />
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <SectionHeading title="设置" action="" />
          <div className="mt-4 grid grid-cols-3 gap-3">
            {['数据说明', '清空缓存', '关于产品'].map((item) => (
              <button key={item} type="button" className="rounded-[18px] border border-[#E4E0D0] bg-[#F8F5E5] px-3 py-5 text-[15px] text-[#32353B] shadow-[0px_8px_20px_rgba(27,29,17,0.04)]">
                {item}
              </button>
            ))}
          </div>
        </section>
        </div>
      </DeviceScrollView>

      <div className="pointer-events-none absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2">
        <BottomNavigation active="我的" />
      </div>
    </DeviceShell>
  )
}
