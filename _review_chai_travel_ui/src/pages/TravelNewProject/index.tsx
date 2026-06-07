import { useEffect, useMemo, useState } from 'react'
import { getHealth, uploadIngest } from '../../api/ingest'
import { ApiError } from '../../api/http'
import { EmptyState, NoticeCard, StatusBadge } from '../../components/BusinessUi'
import { ACCEPTED_FILE_TYPES_HINT, ACCEPTED_MIME_TYPES, appEnv } from '../../config/env'
import chipFoodIcon from '../../assets/icons/figma-deep/new-project-chip-food.svg'
import chipHotelIcon from '../../assets/icons/figma-deep/new-project-chip-hotel.svg'
import chipSightIcon from '../../assets/icons/figma-deep/new-project-chip-sight.svg'
import chipTransportIcon from '../../assets/icons/figma-deep/new-project-chip-transport.svg'
import closeIcon from '../../assets/icons/figma-deep/new-project-close.svg'
import footerAiIcon from '../../assets/icons/figma-deep/new-project-footer-ai.svg'
import locationIcon from '../../assets/icons/figma-deep/new-project-location.svg'
import submitArrowIcon from '../../assets/icons/figma-deep/new-project-submit-arrow.svg'
import type { HealthResponse } from '../../types/domain'
import { buildContextText, formatFileSize } from '../../utils/format'
import { saveLatestUpload } from '../../utils/storage'
import { DeviceShell } from '../../components/TravelUi'

const categoryChips = [
  { label: '景点', color: '#CCDDFD', icon: chipSightIcon },
  { label: '交通', color: '#C9EEE6', icon: chipTransportIcon },
  { label: '饮食', color: '#D4F0D1', icon: chipFoodIcon },
  { label: '住宿', color: '#CCD2F7', icon: chipHotelIcon },
]

export default function TravelNewProjectPage() {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [healthError, setHealthError] = useState('')
  const [destination, setDestination] = useState('')
  const [projectName, setProjectName] = useState('')
  const [description, setDescription] = useState('')
  const [contextText, setContextText] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    async function loadHealth() {
      try {
        const response = await getHealth()
        setHealth(response)
        setHealthError('')
      } catch (error) {
        setHealth(null)
        setHealthError(error instanceof ApiError ? error.detail : '健康检查失败，当前无法进入上传主流程。')
      }
    }

    void loadHealth()
  }, [])

  const canUpload = useMemo(() => {
    if (uploading || !selectedFile) return false
    if (healthError) return false
    if (!health) return false
    return health.status === 'ok' && health.database_configured
  }, [health, healthError, selectedFile, uploading])

  function validateFile(file: File) {
    if (!ACCEPTED_MIME_TYPES.includes(file.type as (typeof ACCEPTED_MIME_TYPES)[number])) {
      return `仅支持 ${ACCEPTED_FILE_TYPES_HINT} 文件。`
    }

    const maxBytes = appEnv.maxUploadMb * 1024 * 1024
    if (file.size > maxBytes) {
      return `文件不能超过 ${appEnv.maxUploadMb} MB，当前文件约 ${formatFileSize(file.size)}。`
    }

    return ''
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitError('')

    if (!selectedFile) {
      setFileError('请先选择一个图片或 PDF 文件。')
      return
    }

    const validationMessage = validateFile(selectedFile)
    if (validationMessage) {
      setFileError(validationMessage)
      return
    }

    if (!health || healthError || !health.database_configured) {
      setSubmitError('健康检查未通过，上传主流程已阻止，请先确认后端服务状态。')
      return
    }

    setUploading(true)

    try {
      const payload = await uploadIngest(
        selectedFile,
        buildContextText([
          ['目的地', destination],
          ['项目名称', projectName],
          ['项目描述', description],
          ['攻略文案', contextText],
        ]),
      )

      saveLatestUpload(payload)
      window.location.href = '/travel-unpack/detail?source=latest'
    } catch (error) {
      setSubmitError(error instanceof ApiError ? error.detail : '上传失败，请稍后重试。')
    } finally {
      setUploading(false)
    }
  }

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
        <a href="/travel-unpack" className="absolute right-8 top-6 flex h-[46px] w-[46px] items-center justify-center rounded-full bg-[#111] shadow-[0px_8px_16px_rgba(27,29,17,0.12)]">
          <img src={closeIcon} alt="" className="h-[18px] w-[18px]" />
        </a>

        <div className="mb-8 pr-16">
          <h1 className="text-[28px] font-medium leading-[39px] text-[#1B1D11]">新建旅行项目</h1>
        </div>

        <form className="space-y-8" onSubmit={handleSubmit}>
          <div className="flex items-center justify-between gap-3 rounded-[18px] bg-[#F7F5EE] px-4 py-3">
            <div>
              <p className="text-sm text-[#64675A]">上传前健康检查</p>
              <p className="mt-1 text-[13px] text-[#9097A3]">失败时会阻止 `POST /ingest/upload` 主流程</p>
            </div>
            <StatusBadge
              className={
                health && !healthError && health.database_configured
                  ? 'bg-[#DFF1B0] text-[#40501D]'
                  : 'bg-[#F7DDD8] text-[#7A2F24]'
              }
            >
              {health && !healthError && health.database_configured ? '可上传' : '不可上传'}
            </StatusBadge>
          </div>

          {healthError ? (
            <NoticeCard
              title="服务不可用"
              description={`${healthError} 请先启动或修复后端服务。`}
              tone="danger"
            />
          ) : null}

          {!healthError && health && !health.database_configured ? (
            <NoticeCard
              title="数据库未配置"
              description="后端健康检查通过，但 `database_configured=false`。当前上传大概率失败，已主动阻止提交。"
              tone="warning"
            />
          ) : null}

          <div className="space-y-[22px]">
            <label className="grid grid-cols-[76px_1fr] items-center gap-[18px]">
              <span className="text-[16px] leading-6 text-[#1B1D11]">目的地</span>
              <span className="flex h-[52px] items-center justify-between rounded-[16px] border border-[rgba(255,255,255,0.65)] bg-[#F7F6F1] px-4 shadow-[0px_4px_16px_rgba(27,29,17,0.05)]">
                <input
                  value={destination}
                  onChange={(event) => setDestination(event.target.value)}
                  placeholder="输入城市 / 地点"
                  className="w-full bg-transparent text-[#1B1D11] outline-none placeholder:text-[#9097A3]"
                />
                <img src={locationIcon} alt="" className="h-[18px] w-[18px]" />
              </span>
            </label>

            <label className="grid grid-cols-[76px_1fr] items-center gap-[18px]">
              <span className="text-[16px] leading-6 text-[#1B1D11]">项目名称</span>
              <input
                value={projectName}
                onChange={(event) => setProjectName(event.target.value)}
                placeholder="例如：上海错峰避坑之旅"
                className="h-[52px] rounded-[16px] border border-[rgba(255,255,255,0.65)] bg-[#F7F6F1] px-4 text-[#1B1D11] shadow-[0px_4px_16px_rgba(27,29,17,0.05)] outline-none placeholder:text-[#9097A3]"
              />
            </label>

            <label className="grid grid-cols-[76px_1fr] items-center gap-[18px]">
              <span className="text-[16px] leading-6 text-[#1B1D11]">项目描述</span>
              <input
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="一句话描述本次旅行目标"
                className="h-[52px] rounded-[16px] border border-[rgba(255,255,255,0.65)] bg-[#F7F6F1] px-4 text-[#1B1D11] shadow-[0px_4px_16px_rgba(27,29,17,0.05)] outline-none placeholder:text-[#9097A3]"
              />
            </label>
          </div>

          <div>
            <p className="mb-4 text-[16px] leading-6 text-[#1B1D11]">上传文件</p>
            <label className="block rounded-[22px] border border-dashed border-[#CFCAB8] bg-[#F7F6F1] px-5 pb-5 pt-6 shadow-[0px_4px_16px_rgba(27,29,17,0.05)]">
              <input
                type="file"
                accept=".png,.jpg,.jpeg,.webp,.pdf"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null
                  setSelectedFile(file)
                  setFileError(file ? validateFile(file) : '请先选择一个图片或 PDF 文件。')
                }}
              />
              <div className="cursor-pointer">
                <p className="text-[16px] text-[#1B1D11]">选择图片或 PDF</p>
                <p className="mt-2 text-[13px] leading-6 text-[#8E948F]">
                  支持 {ACCEPTED_FILE_TYPES_HINT}，最大 {appEnv.maxUploadMb} MB
                </p>
                {selectedFile ? (
                  <div className="mt-4 rounded-[16px] bg-white px-4 py-3 text-sm text-[#49503E]">
                    已选择：{selectedFile.name} · {formatFileSize(selectedFile.size)}
                  </div>
                ) : (
                  <EmptyState
                    title="尚未选择文件"
                    description="上传接口要求 `multipart/form-data`，字段名固定为 `file`。"
                  />
                )}
              </div>
            </label>
            {fileError ? <p className="mt-3 text-sm text-[#C44B36]">{fileError}</p> : null}
          </div>

          <div>
            <p className="mb-4 text-[16px] leading-6 text-[#1B1D11]">补充上下文</p>
            <textarea
              value={contextText}
              onChange={(event) => setContextText(event.target.value)}
              placeholder="可粘贴小红书 / 短视频攻略文案；将以 `context_text` 传给后端。"
              className="min-h-[180px] w-full rounded-[22px] border border-[rgba(255,255,255,0.65)] bg-[#F7F6F1] px-5 py-5 text-[16px] leading-7 text-[#1B1D11] shadow-[0px_4px_16px_rgba(27,29,17,0.05)] outline-none placeholder:text-[#9AA0AE]"
            />
            <p className="mt-3 text-[13px] leading-6 text-[#7F8578]">
              若填写了目的地、项目名称、项目描述，也会与这里的文案一起组合成 `context_text`。
            </p>
          </div>

          <div>
            <div className="mb-5 flex items-center gap-3 text-[#8F948F]">
              <span className="text-[14px]">后端当前统一分类枚举</span>
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
                  {index < categoryChips.length - 1 ? <span className="mx-1 h-6 w-px bg-[#DDDED7]" /> : null}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[20px] bg-[#F7F5EE] px-5 py-4 text-[13px] leading-6 text-[#696E62]">
            上传解析可能需要 10s-20s。上传成功后会跳转到结果详情页，展示 `status`、文件信息、抽取文本、结构化条目与 warning 列表。
          </div>

          {submitError ? (
            <NoticeCard
              title="上传失败"
              description={submitError}
              tone="danger"
            />
          ) : null}

          <div className="mt-10 flex gap-[18px]">
            <a
              href="/travel-unpack"
              className="inline-flex h-[64px] flex-1 items-center justify-center rounded-[20px] bg-[#A7A8AC] text-[18px] text-white shadow-[0px_8px_16px_rgba(27,29,17,0.14)]"
            >
              取消
            </a>
            <button
              type="submit"
              disabled={!canUpload}
              className={`inline-flex h-[64px] flex-[2.1] items-center justify-center rounded-[20px] text-[20px] font-medium shadow-[0px_8px_16px_rgba(27,29,17,0.14)] ${
                canUpload ? 'bg-[#D4EF2E] text-[#111]' : 'bg-[#CFD1C8] text-[#6C7264]'
              }`}
            >
              <span className="inline-flex items-center gap-2">
                {uploading ? '上传中...' : '创建并解析'}
                <img src={submitArrowIcon} alt="" className="h-[14px] w-[14px]" />
              </span>
            </button>
          </div>
        </form>

        <div className="mt-11 flex items-center justify-center gap-2 text-center text-[12px] text-[#8C8F9A]">
          <img src={footerAiIcon} alt="" className="h-[14px] w-[14px]" />
          <p>上传接口真实接入 `POST /ingest/upload`，文件字段为 `file`，文本字段为 `context_text`</p>
        </div>
      </div>
    </DeviceShell>
  )
}
