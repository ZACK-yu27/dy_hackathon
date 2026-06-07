import { useState } from 'react'
import { moduleTypeLabels, moduleTypeOrder } from '../data'
import type { CustomModuleInput, CustomModuleType, TravelModule } from '../types'
import { PaletteBlock } from './PaletteBlock'

type FloatingModulePaletteProps = {
  modules: TravelModule[]
  onAdd: (moduleId: string) => void
  onCreateCustomModule: (input: CustomModuleInput) => void
}

const emptyForm: CustomModuleInput = {
  type: 'scenic',
  title: '',
  subtitle: '',
  riskTag: '',
}

export function FloatingModulePalette({
  modules,
  onAdd,
  onCreateCustomModule,
}: FloatingModulePaletteProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [form, setForm] = useState<CustomModuleInput>(emptyForm)

  function handleSubmit() {
    if (!form.title.trim()) return
    onCreateCustomModule(form)
    setForm(emptyForm)
    setIsAdding(false)
  }

  return (
    <div className="absolute left-[18px] top-[206px] z-30">
      <div
        className={`overflow-hidden border border-white/60 bg-white/75 shadow-[0px_12px_36px_rgba(27,29,17,0.12)] backdrop-blur-[16px] transition-all duration-300 ${
          collapsed
            ? 'h-12 w-[72px] rounded-full'
            : 'max-h-[560px] w-[142px] rounded-[24px]'
        }`}
        data-canvas-interactive="true"
      >
        {collapsed ? (
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            className="flex h-12 w-full items-center justify-center text-[13px] font-bold text-[#1B1D11]"
          >
            积木
          </button>
        ) : (
          <div className="flex max-h-[560px] flex-col">
            <div className="flex items-center justify-between px-3 py-3">
              <div>
                <h2 className="text-[17px] font-bold leading-5 text-[#26272F]">模块库</h2>
                <p className="mt-0.5 text-[10px] text-[#8A8D96]">拖到画布</p>
              </div>
              <button
                type="button"
                onClick={() => setCollapsed(true)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F1F0E9] text-[#697080]"
                aria-label="收起模块库"
              >
                ‹
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 pb-3 scrollbar-hidden">
              {moduleTypeOrder.map((type) => {
                const groupedModules = modules.filter((module) => module.type === type)
                if (!groupedModules.length) return null

                return (
                  <section key={type} className="space-y-2">
                    <h3 className="px-1 text-[10px] font-bold text-[#8A8D96]">
                      {moduleTypeLabels[type]}
                    </h3>
                    {groupedModules.map((module) => (
                      <PaletteBlock key={module.id} module={module} onAdd={onAdd} />
                    ))}
                  </section>
                )
              })}

              <button
                type="button"
                onClick={() => setIsAdding(true)}
                className="flex w-full items-center justify-center rounded-[14px] border border-dashed border-[#A8ADB8] bg-white/70 px-2 py-3 text-[11px] font-bold text-[#6E744F] transition hover:border-[#D4EF2E] hover:text-[#111]"
              >
                + 添加自定义模块
              </button>
            </div>
          </div>
        )}
      </div>

      {isAdding ? (
        <div
          className="absolute left-0 top-[58px] w-[324px] rounded-[24px] border border-white/70 bg-white/92 p-4 shadow-[0px_18px_48px_rgba(27,29,17,0.18)] backdrop-blur-[18px]"
          data-canvas-interactive="true"
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[16px] font-bold text-[#1B1D11]">添加自定义模块</h2>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F1F0E9] text-[#697080]"
            >
              ×
            </button>
          </div>

          <label className="block text-[11px] font-bold text-[#74786B]">
            模块类型
            <select
              value={form.type}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  type: event.target.value as CustomModuleType,
                }))
              }
              className="mt-1 h-10 w-full rounded-[12px] border border-[#E4E0D0] bg-[#FAF9F5] px-3 text-[13px] text-[#1B1D11] outline-none"
            >
              {moduleTypeOrder.map((type) => (
                <option key={type} value={type}>
                  {moduleTypeLabels[type]}
                </option>
              ))}
            </select>
          </label>

          <label className="mt-3 block text-[11px] font-bold text-[#74786B]">
            模块名称
            <input
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              className="mt-1 h-10 w-full rounded-[12px] border border-[#E4E0D0] bg-[#FAF9F5] px-3 text-[13px] text-[#1B1D11] outline-none"
              placeholder="例如：咖啡补给"
            />
          </label>

          <label className="mt-3 block text-[11px] font-bold text-[#74786B]">
            时间或说明，可选
            <input
              value={form.subtitle}
              onChange={(event) => setForm((current) => ({ ...current, subtitle: event.target.value }))}
              className="mt-1 h-10 w-full rounded-[12px] border border-[#E4E0D0] bg-[#FAF9F5] px-3 text-[13px] text-[#1B1D11] outline-none"
              placeholder="例如：15:30-16:00"
            />
          </label>

          <label className="mt-3 block text-[11px] font-bold text-[#74786B]">
            避雷提示，可选
            <input
              value={form.riskTag}
              onChange={(event) => setForm((current) => ({ ...current, riskTag: event.target.value }))}
              className="mt-1 h-10 w-full rounded-[12px] border border-[#E4E0D0] bg-[#FAF9F5] px-3 text-[13px] text-[#1B1D11] outline-none"
              placeholder="例如：排队较久"
            />
          </label>

          <button
            type="button"
            onClick={handleSubmit}
            className="mt-4 h-11 w-full rounded-[14px] bg-[#D4EF2E] text-[14px] font-bold text-[#111] shadow-[inset_0px_-2px_0px_rgba(0,0,0,0.08)]"
          >
            确认添加
          </button>
        </div>
      ) : null}
    </div>
  )
}
