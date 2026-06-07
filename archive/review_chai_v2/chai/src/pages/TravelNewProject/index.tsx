import aiBadgeIcon from '../../assets/icons/figma-deep/new-project-ai-badge.svg'
import chipFoodIcon from '../../assets/icons/figma-deep/new-project-chip-food.svg'
import chipHotelIcon from '../../assets/icons/figma-deep/new-project-chip-hotel.svg'
import chipSightIcon from '../../assets/icons/figma-deep/new-project-chip-sight.svg'
import chipTransportIcon from '../../assets/icons/figma-deep/new-project-chip-transport.svg'
import closeIcon from '../../assets/icons/figma-deep/new-project-close.svg'
import footerAiIcon from '../../assets/icons/figma-deep/new-project-footer-ai.svg'
import locationIcon from '../../assets/icons/figma-deep/new-project-location.svg'
import submitArrowIcon from '../../assets/icons/figma-deep/new-project-submit-arrow.svg'
import { DeviceShell } from '../../components/TravelUi'

const categoryChips = [
  { label: '景点', color: '#CCDDFD', icon: chipSightIcon },
  { label: '交通', color: '#C9EEE6', icon: chipTransportIcon },
  { label: '餐饮', color: '#D4F0D1', icon: chipFoodIcon },
  { label: '住宿', color: '#CCD2F7', icon: chipHotelIcon },
]

export default function TravelNewProjectPage() {
  return (
    <DeviceShell className="bg-[#E5E4DA]">
      <div className="absolute inset-0 bg-[#E5E4DA]" />
      <div className="absolute inset-x-0 top-0 h-[170px] overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.13]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(188, 188, 188, 1) 1px, transparent 1px)',
            backgroundSize: '14px 14px',
          }}
        />
        <div className="px-7 pt-7">
          <div className="flex items-start justify-between">
            <div className="text-[26px] font-black leading-none text-[#17180F]">旅拆拆</div>
            <div className="rounded-full bg-[#111] px-4 py-2 text-[14px] font-bold text-[#D4EF2E]">
              AI 拆攻略
            </div>
          </div>
          <div className="mt-5 rounded-full bg-[#ECE9E1] px-5 py-4 text-[15px] text-[#7E807E] shadow-[0px_6px_20px_rgba(27,29,17,0.04)]">
            搜索旅行项目
          </div>
          <div className="mt-5">
            <div className="flex items-center gap-2">
              <span className="h-5 w-1 rounded-full bg-[#D4EF2E]" />
              <span className="text-[16px] font-bold text-[#1B1D11]">我的旅行项目</span>
            </div>
            <div className="mt-4 h-[74px] rounded-[24px] bg-[#D4EF2E] opacity-55 shadow-[0px_10px_24px_rgba(27,29,17,0.08)]" />
          </div>
        </div>
        <div className="absolute inset-0 bg-[rgba(245,244,237,0.42)] backdrop-blur-[16px]" />
      </div>

      <div
        className="absolute inset-x-0 bottom-0 top-[126px] overflow-y-auto rounded-t-[40px] border border-[rgba(255,255,255,0.45)] bg-[#F2F1EA] px-8 pb-9 pt-8 scrollbar-hidden"
        style={{ boxShadow: '0px -8px 32px rgba(27,29,17,0.08)' }}
      >
        <a
          href="/travel-unpack"
          className="absolute right-8 top-6 flex h-[46px] w-[46px] items-center justify-center rounded-full bg-[#111] shadow-[0px_8px_16px_rgba(27,29,17,0.12)]"
        >
          <img src={closeIcon} alt="" className="h-[18px] w-[18px]" />
        </a>

        <div className="mb-8 pr-16">
          <h1 className="text-[28px] font-medium leading-[39px] text-[#1B1D11]">新建旅行项目</h1>
        </div>

        <div className="space-y-[22px]">
          <label className="grid grid-cols-[76px_1fr] items-center gap-[18px]">
            <span className="text-[16px] leading-6 text-[#1B1D11]">目的地</span>
            <span className="flex h-[52px] items-center justify-between rounded-[16px] border border-[rgba(255,255,255,0.65)] bg-[#F7F6F1] px-4 text-[#9097A3] shadow-[0px_4px_16px_rgba(27,29,17,0.05)]">
              <span className="flex items-center gap-3">
                <span className="h-5 w-1 rounded-full bg-[#D4EF2E]" />
                输入城市 / 地点
              </span>
              <img src={locationIcon} alt="" className="h-[18px] w-[18px]" />
            </span>
          </label>

          <label className="grid grid-cols-[76px_1fr] items-center gap-[18px]">
            <span className="text-[16px] leading-6 text-[#1B1D11]">项目名称</span>
            <span className="flex h-[52px] items-center rounded-[16px] border border-[rgba(255,255,255,0.65)] bg-[#F7F6F1] px-4 text-[#9097A3] shadow-[0px_4px_16px_rgba(27,29,17,0.05)]">
              例如：上海错峰避坑之旅
            </span>
          </label>

          <label className="grid grid-cols-[76px_1fr] items-center gap-[18px]">
            <span className="text-[16px] leading-6 text-[#1B1D11]">项目描述</span>
            <span className="flex h-[52px] items-center rounded-[16px] border border-[rgba(255,255,255,0.65)] bg-[#F7F6F1] px-4 text-[#9097A3] shadow-[0px_4px_16px_rgba(27,29,17,0.05)]">
              一句话描述本次旅行目标
            </span>
          </label>
        </div>

        <div className="mt-8">
          <p className="mb-4 text-[16px] leading-6 text-[#1B1D11]">攻略文案</p>
          <div className="rounded-[22px] border border-[rgba(255,255,255,0.65)] bg-[#F7F6F1] px-5 pb-5 pt-6 shadow-[0px_4px_16px_rgba(27,29,17,0.05)]">
            <div className="min-h-[148px] text-[16px] leading-7 text-[#9AA0AE]">
              粘贴小红书 / 短视频攻略文案...
            </div>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full bg-[#111] px-5 py-3 text-[14px] font-bold text-[#D4EF2E]"
              >
                <img src={aiBadgeIcon} alt="" className="h-[14px] w-[14px]" />
                支持 AI 拆攻略
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="mb-5 flex items-center gap-3 text-[#8F948F]">
            <span className="text-[14px]">将自动生成以下模块</span>
            <span className="h-px flex-1 bg-[#D6D7D2]" />
          </div>

          <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] items-center rounded-[18px] border border-[rgba(255,255,255,0.65)] bg-[#F7F5EE] px-3 py-4 shadow-[0px_4px_16px_rgba(27,29,17,0.05)]">
            {categoryChips.map((chip, index) => (
              <div key={chip.label} className="contents">
                <div className="flex items-center justify-center gap-2 rounded-full px-1 py-1">
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-full text-xs"
                    style={{ backgroundColor: chip.color }}
                  >
                    <img src={chip.icon} alt="" className="h-[15px] w-[15px]" />
                  </span>
                  <span className="text-[15px] text-[#4C515F]">{chip.label}</span>
                </div>
                {index < categoryChips.length - 1 ? (
                  <span className="mx-1 h-6 w-px bg-[#DDDED7]" />
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex gap-[18px]">
          <a
            href="/travel-unpack"
            className="inline-flex h-[64px] flex-1 items-center justify-center rounded-[20px] bg-[#A7A8AC] text-[18px] text-white shadow-[0px_8px_16px_rgba(27,29,17,0.14)]"
          >
            取消
          </a>
          <a
            href="/travel-unpack/detail"
            className="inline-flex h-[64px] flex-[2.1] items-center justify-center rounded-[20px] bg-[#D4EF2E] text-[20px] font-medium text-[#111] shadow-[0px_8px_16px_rgba(27,29,17,0.14)]"
          >
            <span className="inline-flex items-center gap-2">
              创建并解析
              <img src={submitArrowIcon} alt="" className="h-[14px] w-[14px]" />
            </span>
          </a>
        </div>

        <div className="mt-11 flex items-center justify-center gap-2 text-center text-[12px] text-[#8C8F9A]">
          <img src={footerAiIcon} alt="" className="h-[14px] w-[14px]" />
          <p>AI 将自动拆解攻略，生成模块化行程与避雷点</p>
        </div>
      </div>
    </DeviceShell>
  )
}
