import chipCrowdIcon from '../../../assets/icons/chip-crowd.svg'
import chipFoodIcon from '../../../assets/icons/chip-food.svg'
import decorativeSlashes from '../../../assets/icons/decorative-slashes.svg'
import folderMaskGroup from '../../../assets/icons/folder-mask-group.png'
import moduleCountIcon from '../../../assets/icons/module-count.svg'
import pillFoodIcon from '../../../assets/icons/pill-food.svg'
import pillScenicIcon from '../../../assets/icons/pill-scenic.svg'
import pillTrafficIcon from '../../../assets/icons/pill-traffic.svg'
import riskCountIcon from '../../../assets/icons/risk-count.svg'

const categories = [
  { label: '景点', icon: pillScenicIcon, backgroundColor: '#5C88C4' },
  { label: '交通', icon: pillTrafficIcon, backgroundColor: '#59A59B' },
  { label: '餐饮', icon: pillFoodIcon, backgroundColor: '#8CAEB6' },
]

const chips = [
  { label: '晚高峰人多', icon: chipCrowdIcon },
  { label: '饭点排队', icon: chipFoodIcon },
]

export function FeaturedProjectCard() {
  return (
    <a href="/travel-unpack/detail" className="relative block pt-2">
      <div
        className="absolute inset-x-0 top-4 h-[280px] rounded-[32px] border border-[#333333] bg-[#1B1D11]"
        style={{
          boxShadow: '0px 8px 10px -6px rgba(0, 0, 0, 0.1), 0px 20px 25px -5px rgba(0, 0, 0, 0.1)',
        }}
      />

      <div className="absolute inset-x-[25px] top-[249px] flex items-end justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex gap-1">
            <span className="h-3 w-3 rounded-[2px] bg-[#D4EF2E]" />
            <span className="h-3 w-3 rounded-[2px] bg-[#D4EF2E]" />
            <span className="h-3 w-3 rounded-[2px] bg-[#D4EF2E]" />
            <span className="h-3 w-3 rounded-[2px] border border-[#D4EF2E]" />
            <span className="h-3 w-3 rounded-[2px] border border-[#D4EF2E]" />
          </div>
          <span className="text-[11px] font-medium uppercase leading-[14px] tracking-[0.1em] text-[rgba(228,228,208,0.7)]">
            AVG RISK
          </span>
        </div>

        <div className="flex flex-col items-end gap-1">
          <span
            className="text-xs font-bold uppercase leading-4 tracking-[0.05em] text-[#D4EF2E]"
            style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans SC", sans-serif' }}
          >
            2024.05.12
          </span>
          <span className="text-[11px] font-medium uppercase leading-[14px] tracking-[0.1em] text-[rgba(228,228,208,0.7)]">
            UPDATED
          </span>
        </div>
      </div>

      <img
        src={folderMaskGroup}
        alt=""
        className="absolute left-0 top-0 z-10 h-20 w-full object-cover"
      />

      <img
        src={decorativeSlashes}
        alt=""
        className="absolute right-6 top-[21px] z-20 h-[14px] w-[34px] opacity-80"
      />

      <div className="absolute right-[-1px] top-[91px] z-20 flex flex-col gap-2">
        {categories.map((category) => (
          <span
            key={category.label}
            className="inline-flex items-center gap-1 rounded-l-2xl rounded-r-md border border-[rgba(255,255,255,0.2)] px-3 py-2 text-[10px] font-bold leading-[15px] text-white"
            style={{
              backgroundColor: category.backgroundColor,
              boxShadow:
                '0px 2px 4px -2px rgba(0, 0, 0, 0.1), 0px 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
          >
            <img src={category.icon} alt="" className="h-3 w-3" />
            {category.label}
          </span>
        ))}
      </div>

      <div
        className="relative z-10 mt-14 overflow-hidden rounded-[32px] border border-[rgba(255,255,255,0.2)] bg-[#D4EF2E] px-6 pb-6 pt-[23px]"
        style={{
          boxShadow: '0px 4px 6px -4px rgba(0, 0, 0, 0.1), 0px 10px 15px -3px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div className="max-w-[210px] pr-2">
          <h3 className="text-[26px] font-black leading-[32.5px] text-[#1B1D11]">
            上海错峰避坑之旅
          </h3>
          <p className="mt-1 text-[13px] leading-[19.5px] text-[rgba(27,29,17,0.8)]">
            少排队、少踩坑的 1 日路线
          </p>
        </div>

        <div className="mt-4 border-t border-dashed border-[rgba(27,29,17,0.3)]" />

        <div className="mt-4 flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-[28px] font-black leading-7 text-[#1B1D11]">12</span>
            <span className="text-[11px] leading-[16.5px] text-[rgba(27,29,17,0.8)]">
              个模块
            </span>
            <img src={moduleCountIcon} alt="" className="h-[13px] w-[13px]" />
          </div>

          <span className="h-6 w-px bg-[rgba(27,29,17,0.2)]" aria-hidden="true" />

          <div className="flex items-center gap-1.5">
            <span className="text-[28px] font-black leading-7 text-[#1B1D11]">8</span>
            <span className="text-[11px] leading-[16.5px] text-[rgba(27,29,17,0.8)]">
              个避雷点
            </span>
            <img src={riskCountIcon} alt="" className="h-[13px] w-[15px]" />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {chips.map((chip) => (
            <span
              key={chip.label}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#1B1D11] px-3 py-1.5 text-base font-bold leading-6 text-[#D4F02F]"
              style={{ boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)' }}
            >
              <img src={chip.icon} alt="" className="h-auto w-[14px]" />
              {chip.label}
            </span>
          ))}
        </div>
      </div>
    </a>
  )
}
