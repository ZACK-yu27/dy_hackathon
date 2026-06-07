import chipCrowdIcon from '../../../assets/icons/chip-crowd.svg'
import chipFoodIcon from '../../../assets/icons/chip-food.svg'
import decorativeSlashes from '../../../assets/icons/decorative-slashes.svg'
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
    <a href="/travel-unpack/detail" className="relative mx-auto block w-full max-w-[326px] pb-[10px] pt-[58px]">
      <div className="absolute inset-x-0 top-0 z-0 h-[112px] overflow-hidden rounded-[22px_22px_18px_18px] bg-[#ECECE7] shadow-[0px_8px_20px_rgba(27,29,17,0.06)]">
        <div className="absolute left-0 top-0 h-[36px] w-[126px] rounded-br-[24px] bg-[#E1E1DC]" />
        <div className="absolute left-[124px] top-0 h-[36px] w-[42px] rounded-tl-[24px] bg-[#ECECE7]" />
        <div className="absolute left-5 top-[34px] z-10">
          <p className="text-[15px] font-black leading-5 text-[#2B2D26]">上海 / 1 日</p>
          <p className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.13em] text-[#9B9D96]">
            TRIPFILE&nbsp;&nbsp;NO.001
          </p>
        </div>
        <div className="absolute right-5 top-[17px] z-10 text-right">
          <p className="text-[8px] font-black uppercase tracking-[0.08em] text-[#A0A19A]">DAY PLAN</p>
          <p className="text-[34px] font-black leading-8 text-[#2B2D26]">01</p>
        </div>
      </div>

      <img
        src={decorativeSlashes}
        alt=""
        className="absolute left-[126px] top-[44px] z-[2] h-[14px] w-[34px] opacity-65"
      />

      <div className="absolute right-2 top-[126px] z-40 flex flex-col gap-2">
        {categories.map((category) => (
          <span
            key={category.label}
            className="inline-flex h-[34px] w-[64px] items-center justify-center gap-1 rounded-l-2xl rounded-r-md border border-[rgba(255,255,255,0.25)] text-[10px] font-bold leading-[15px] text-white"
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
        className="relative z-20 overflow-hidden rounded-[28px] border border-[rgba(255,255,255,0.35)] bg-[#D4EF2E] px-6 pb-0 pt-[28px]"
        style={{
          boxShadow: '0px 12px 28px rgba(27,29,17,0.08)',
        }}
      >
        <img
          src={decorativeSlashes}
          alt=""
          className="absolute right-11 top-[18px] h-[14px] w-[34px] opacity-70"
        />

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

        <div className="mt-5 -mx-6 flex h-[52px] items-center justify-between bg-[#1B1D11] px-6">
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-bold uppercase leading-3 tracking-[0.12em] text-[#D4EF2E]">
              AVG RISK
            </span>
            <div className="flex gap-1">
              <span className="h-2.5 w-2.5 rounded-[2px] bg-[#D4EF2E]" />
              <span className="h-2.5 w-2.5 rounded-[2px] bg-[#D4EF2E]" />
              <span className="h-2.5 w-2.5 rounded-[2px] bg-[#D4EF2E]" />
              <span className="h-2.5 w-2.5 rounded-[2px] border border-[#D4EF2E]" />
              <span className="h-2.5 w-2.5 rounded-[2px] border border-[#D4EF2E]" />
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <span className="text-[9px] font-bold uppercase leading-3 tracking-[0.12em] text-[rgba(228,228,208,0.72)]">
              UPDATED
            </span>
            <span
              className="text-[11px] font-black uppercase leading-3 tracking-[0.05em] text-[#D4EF2E]"
              style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans SC", sans-serif' }}
            >
              2024.05.12
            </span>
          </div>
        </div>
      </div>
    </a>
  )
}
