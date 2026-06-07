import riskBadgeWarningIcon from '../../assets/icons/figma-deep/risk-badge-warning.svg'
import riskCloseIcon from '../../assets/icons/figma-deep/risk-close.svg'
import riskConfirmSmileIcon from '../../assets/icons/figma-deep/risk-confirm-smile.svg'
import riskLinkArrowIcon from '../../assets/icons/figma-deep/risk-link-arrow.svg'
import riskNoteIcon from '../../assets/icons/figma-deep/risk-note.svg'
import riskRelatedBlockIcon from '../../assets/icons/figma-deep/risk-related-block.svg'
import riskRelatedTimeIcon from '../../assets/icons/figma-deep/risk-related-time.svg'
import riskSourceIcon from '../../assets/icons/figma-deep/risk-source.svg'
import riskTitleWarningIcon from '../../assets/icons/figma-deep/risk-title-warning.svg'
import riskBackgroundImage from '../../assets/images/risk-background.png'
import { DeviceShell } from '../../components/TravelUi'

export default function TravelRiskDetailPage() {
  return (
    <DeviceShell style={{ background: 'linear-gradient(135deg, #566330 0%, #BDAF69 55%, #3B4E28 100%)' }}>
      <img src={riskBackgroundImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-55" />
      <div className="absolute inset-5 bg-[rgba(240,237,225,0.18)] backdrop-blur-[14px]" />
      <div className="absolute inset-0 bg-[rgba(31,33,18,0.28)]" />
      <div
        className="absolute inset-x-9 top-[138px] max-h-[calc(100%-158px)] overflow-y-auto rounded-[32px] bg-[#F7F6F1] px-7 pb-8 pt-6 scrollbar-hidden"
        style={{ boxShadow: '0px 24px 60px rgba(27,29,17,0.2)' }}
      >
        <div className="absolute left-0 top-0 flex h-[44px] items-center gap-2 rounded-tl-[12px] rounded-tr-[8px] bg-white px-5 text-[#5B463B]">
          <img src={riskTitleWarningIcon} alt="" className="h-[18px] w-[18px]" />
          <span className="text-[17px] font-medium">避雷详情</span>
        </div>

        <a
          href="/travel-unpack/detail"
          className="absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#ECE7D0] text-[#66614D]"
        >
          <img src={riskCloseIcon} alt="" className="h-[18px] w-[18px]" />
        </a>

        <div className="pt-10">
          <h1 className="text-[30px] leading-[42px] text-[#1B1D11]">晚高峰人流大</h1>

          <div className="mt-4 flex gap-2 text-sm">
            <span className="inline-flex items-center gap-1 rounded-[4px] border border-[#D13029] bg-[#D13029] px-3 py-1 text-white">
              <img src={riskBadgeWarningIcon} alt="" className="h-[12px] w-[12px]" />
              中高风险
            </span>
            <span className="inline-flex items-center gap-1 rounded-[4px] bg-[#E9E5D5] px-3 py-1 text-[#716B5D]">
              <img src={riskSourceIcon} alt="" className="h-[12px] w-[12px]" />
              本地避雷库
            </span>
          </div>

          <div className="mt-5 rounded-[14px] border border-[#E2DED0] bg-[#F2F0E5] px-5 py-4 text-[16px] leading-8 text-[#67614E]">
            节假日与晚高峰拍照点排队明显，热门机位拥挤，建议错峰或提前规划拍摄顺序。
          </div>

          <div className="mt-7 border-t border-[#E5E1D4] pt-6">
            <div className="mb-5 flex items-center gap-3">
              <span className="h-6 w-1 rounded-full bg-[#7A7A6D]" />
              <h2 className="text-[18px] text-[#5D584A]">关联积木</h2>
            </div>

            <div className="flex items-center justify-between rounded-[16px] border border-[#D9D3B0] bg-[#ECEAD7] p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-white text-[#6A6A64]">
                  <img src={riskRelatedBlockIcon} alt="" className="h-[18px] w-[18px]" />
                </div>
                <div>
                  <p className="text-[16px] text-[#444236]">景点：外滩夜景</p>
                  <p className="mt-1 inline-flex items-center gap-1 text-[14px] text-[#5F5B4F]">
                    <img src={riskRelatedTimeIcon} alt="" className="h-[12px] w-[12px]" />
                    08:30-09:30
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-[#F8D5BA] px-4 py-2 text-[14px] text-[#D64A3D]">
                晚高峰人多
              </span>
            </div>
          </div>

          <div className="mt-7 border-t border-[#E5E1D4] pt-6">
            <div className="mb-4 flex items-center gap-3">
              <span className="h-6 w-1 rounded-full bg-[#7A7A6D]" />
              <h2 className="text-[18px] text-[#5D584A]">风险来源</h2>
            </div>
            <p className="text-[16px] text-[#6A6455]">来源：本地避雷库 / 样例数据</p>
            <p className="mt-2 inline-flex items-center gap-1 text-[13px] text-[#9A968A]">
              <img src={riskNoteIcon} alt="" className="h-[12px] w-[12px]" />
              当前为示例数据，不承诺实时准确
            </p>
          </div>

          <div className="mt-9 border-t border-[#E5E1D4] pt-6">
            <a
              href="/travel-unpack/detail"
              className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#D4EF2E] text-[20px] font-medium text-[#111] shadow-[inset_0px_-2px_0px_rgba(0,0,0,0.08)]"
            >
              知道了
              <img src={riskConfirmSmileIcon} alt="" className="h-[18px] w-[18px]" />
            </a>
            <a href="/travel-unpack/explore" className="mt-5 inline-flex w-full items-center justify-center gap-1 text-center text-[16px] text-[#6F7A1F]">
              查看同类避雷
              <img src={riskLinkArrowIcon} alt="" className="h-[14px] w-[14px]" />
            </a>
          </div>
        </div>
      </div>
    </DeviceShell>
  )
}
