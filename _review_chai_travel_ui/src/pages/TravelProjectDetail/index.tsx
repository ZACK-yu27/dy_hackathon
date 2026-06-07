import detailBackIcon from '../../assets/icons/figma-deep/detail-back.svg'
import detailBannerFlagIcon from '../../assets/icons/figma-deep/detail-banner-flag.svg'
import detailCardRiskIcon from '../../assets/icons/figma-deep/detail-card-risk.svg'
import detailCardSightIcon from '../../assets/icons/figma-deep/detail-card-sight.svg'
import detailCardTimeIcon from '../../assets/icons/figma-deep/detail-card-time.svg'
import detailClearIcon from '../../assets/icons/figma-deep/detail-clear.svg'
import detailFitIcon from '../../assets/icons/figma-deep/detail-fit.svg'
import detailFoodIcon from '../../assets/icons/figma-deep/detail-lib-food.svg'
import detailHotelIcon from '../../assets/icons/figma-deep/detail-lib-hotel.svg'
import detailTransportIcon from '../../assets/icons/figma-deep/detail-lib-transport.svg'
import detailLibraryGridIcon from '../../assets/icons/figma-deep/detail-library-grid.svg'
import detailMoreIcon from '../../assets/icons/figma-deep/detail-more.svg'
import detailSendIcon from '../../assets/icons/figma-deep/detail-send.svg'
import detailZoomMinusIcon from '../../assets/icons/figma-deep/detail-zoom-minus.svg'
import { DeviceScrollView, DeviceShell, GlyphPlus } from '../../components/TravelUi'

const categories = [
  { label: '景点', active: true },
  { label: '餐饮', active: false },
  { label: '交通', active: false },
  { label: '住宿', active: false },
]

const modules = [
  { title: '外滩夜景', tag: '景点', time: '08:30-09:30', risk: '晚高峰人多', color: '#3488E5', tagColor: '#ECECE6', icon: detailCardSightIcon },
  { title: '地铁 2 号线', tag: '交通', time: '09:30-10:00', risk: '', color: '#49B3A0', tagColor: '#DFF3EE', icon: detailTransportIcon },
  { title: '本地小吃店', tag: '餐饮', time: '10:00-11:00', risk: '饭点排队', color: '#73BA8B', tagColor: '#E7F0DA', icon: detailFoodIcon },
]

const moduleLibrary = [
  { title: '外滩夜景', color: '#2F85E9', icon: detailCardSightIcon },
  { title: '豫园', color: '#2F85E9', icon: detailCardSightIcon },
  { title: '南京东路', color: '#2F85E9', icon: detailCardSightIcon },
  { title: '地铁 2 号线', color: '#44A89A', icon: detailTransportIcon },
  { title: '公交 20 路', color: '#44A89A', icon: detailTransportIcon },
  { title: '本地小吃店', color: '#6BAF97', icon: detailFoodIcon },
  { title: '老字号餐馆', color: '#6BAF97', icon: detailFoodIcon },
  { title: '外滩附近酒店', color: '#8B909C', icon: detailHotelIcon },
]

export default function TravelProjectDetailPage() {
  return (
    <DeviceShell className="bg-[#E7E6DE]">
      <DeviceScrollView>
        <div className="px-[15px] pb-[14px] pt-4">
        <section
          className="relative overflow-hidden rounded-b-[32px] rounded-t-[30px] bg-[#F1F0E9] px-5 pb-[18px] pt-5"
          style={{
            boxShadow: '0px 8px 24px rgba(27,29,17,0.08)',
          }}
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[136px] rounded-t-[30px] bg-[#F2F1EB]" />
          <div
            className="pointer-events-none absolute left-0 top-0 h-[38px] w-full rounded-t-[30px] bg-[#F2F1EB]"
            style={{ clipPath: 'polygon(0 0, 40% 0, 45% 100%, 100% 100%, 100% 0)' }}
          />
          <div className="relative z-10 mb-5 flex items-start justify-between pt-[20px]">
            <a href="/travel-unpack" className="pt-[10px] text-[#43464D]">
              <img src={detailBackIcon} alt="" className="h-7 w-7" />
            </a>
            <div className="mr-auto ml-4">
              <h1 className="text-[31px] font-black leading-[42px] text-[#1B1D11]">上海错峰避坑之旅</h1>
              <p className="mt-[2px] text-[15px] text-[#73776E]">12 模块 / 8 避雷</p>
            </div>
            <div className="flex gap-3 pt-[6px]">
              <button type="button" className="flex h-14 w-14 items-center justify-center rounded-full bg-[#111] text-white shadow-[0px_8px_20px_rgba(27,29,17,0.15)]">
                <img src={detailSendIcon} alt="" className="h-6 w-6" />
              </button>
              <button type="button" className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#777] shadow-[0px_8px_20px_rgba(27,29,17,0.12)]">
                <img src={detailMoreIcon} alt="" className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="relative z-10 flex gap-3 overflow-x-auto pb-[2px]">
            {categories.map((item) => (
              <span
                key={item.label}
                className={`inline-flex items-center justify-center rounded-full px-[26px] py-[13px] text-[17px] ${
                  item.active ? 'bg-[#2F85E9] text-white' : 'bg-[#EFEFEA] text-[#5D5F64]'
                }`}
              >
                {item.label}
              </span>
            ))}
          </div>
        </section>

        <section className="mt-[10px] grid grid-cols-[116px_1fr] gap-2">
          <aside className="rounded-[26px] bg-[#F1F0E9] px-3 py-5 shadow-[0px_8px_24px_rgba(27,29,17,0.08)]">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-[18px] font-bold text-[#26272F]">模块库</h2>
              <img src={detailLibraryGridIcon} alt="" className="h-5 w-5" />
            </div>
            <div className="space-y-3">
              {moduleLibrary.map((item) => (
                <div
                  key={item.title}
                  className="flex items-center justify-between rounded-[14px] bg-[#FAF9F5] px-2 py-[11px] text-[#4D525A]"
                  style={{
                    boxShadow: `inset 4px 0 0 ${item.color}`,
                  }}
                >
                  <span className="flex items-center gap-1.5 text-[13px] leading-5">
                    <img src={item.icon} alt="" className="h-[14px] w-[14px]" />
                    {item.title}
                  </span>
                  <img src={detailMoreIcon} alt="" className="h-[14px] w-[14px] opacity-55" />
                </div>
              ))}
              {indexPlaceholder()}
            </div>
          </aside>

          <section className="min-w-0 rounded-[26px] bg-[#F1F0E9] px-3 py-5 shadow-[0px_8px_24px_rgba(27,29,17,0.08)]">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-[18px] font-bold text-[#26272F]">路线脚本</h2>
                <p className="text-[13px] text-[#8A8D96]">(拖拽模块组装)</p>
              </div>
              <button type="button" className="inline-flex items-center gap-1 text-[14px] text-[#8C9199]">
                <img src={detailClearIcon} alt="" className="h-[14px] w-[14px]" />
                清空
              </button>
            </div>

            <div className="mb-4 flex items-center justify-center gap-2 rounded-[16px] bg-[#D4EF2E] px-5 py-4 text-center text-[18px] font-bold shadow-[inset_0px_-2px_0px_rgba(0,0,0,0.08)]">
              <img src={detailBannerFlagIcon} alt="" className="h-[16px] w-[16px]" />
              上海错峰路线
            </div>

            <div className="space-y-3">
              {modules.map((module) => (
                <article
                  key={module.title}
                  className="relative flex overflow-hidden rounded-[18px] bg-[#FCFBF7] shadow-[0px_4px_12px_rgba(27,29,17,0.05)]"
                >
                  <div className="flex w-[56px] shrink-0 items-center justify-center" style={{ backgroundColor: module.color }}>
                    <img src={module.icon} alt="" className="h-6 w-6" />
                  </div>
                  <div className="absolute left-[48px] top-1/2 h-[16px] w-[16px] -translate-y-1/2 rounded-full border-[5px] border-[#F1F0E9] bg-white" />
                  <div className="min-w-0 flex-1 px-3 py-[13px]">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-[15px] font-bold leading-5 text-[#27303A]">{module.title}</h3>
                        <p className="mt-1 inline-flex items-center gap-1 text-[12px] text-[#6A707A]">
                          <img src={detailCardTimeIcon} alt="" className="h-[14px] w-[14px]" />
                          {module.time}
                        </p>
                      </div>
                      <span
                        className="shrink-0 rounded-full px-2 py-1 text-[10px] text-[#707769]"
                        style={{ backgroundColor: module.tagColor }}
                      >
                        {module.tag}
                      </span>
                    </div>
                    {module.risk ? (
                      <a href="/travel-unpack/risk-detail" className="mt-3 inline-flex items-center gap-1 rounded-[4px] border border-[#F1B5A8] bg-[#FFE7E0] px-3 py-1 text-xs text-[#E05A4E]">
                        <img src={detailCardRiskIcon} alt="" className="h-[12px] w-[12px]" />
                        {module.risk}
                      </a>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-5 flex gap-3">
              <div className="flex h-[74px] flex-1 items-center justify-center rounded-[18px] border border-dashed border-[#BCC0C9] text-[#8E93A0]">
                ⊕ 拖 下一块正木
              </div>
              <div className="space-y-3">
                <button type="button" className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#48505C] shadow-[0px_6px_16px_rgba(27,29,17,0.08)]">
                  <GlyphPlus />
                </button>
                <button type="button" className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#48505C] shadow-[0px_6px_16px_rgba(27,29,17,0.08)]">
                  <img src={detailZoomMinusIcon} alt="" className="h-4 w-4" />
                </button>
                <button type="button" className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#48505C] shadow-[0px_6px_16px_rgba(27,29,17,0.08)]">
                  <img src={detailFitIcon} alt="" className="h-4 w-4" />
                </button>
              </div>
            </div>
          </section>
        </section>

        <nav className="mt-[10px] flex rounded-[28px] bg-[#F1F0E9] px-6 py-5 shadow-[0px_8px_24px_rgba(27,29,17,0.08)]">
          {['预览路线', '智能优化', '导出攻略', '更多设置'].map((item, index) => (
            <a
              key={item}
              href="#"
              className={`flex flex-1 flex-col items-center gap-2 text-sm ${index === 0 ? 'text-[#4D5564]' : 'text-[#697080]'}`}
            >
              <span className="text-xl">{['◉', '✣', '⇪', '⚙'][index]}</span>
              {item}
            </a>
          ))}
        </nav>
        <div className="mt-[6px] flex justify-center">
          <span className="h-[5px] w-[124px] rounded-full bg-[#1B1D11]" />
        </div>
        </div>
      </DeviceScrollView>
    </DeviceShell>
  )
}

function indexPlaceholder() {
  return (
    <div className="flex items-center justify-center rounded-[14px] border border-dashed border-[#A8ADB8] px-3 py-4 text-[15px] text-[#868C98]">
      + 添加自形◌模块
    </div>
  )
}
