import detailLibraryGridIcon from '../../../assets/icons/figma-deep/detail-library-grid.svg'
import type { TravelModule } from '../types'
import { PaletteBlock } from './PaletteBlock'

type ModulePaletteProps = {
  modules: TravelModule[]
  onAdd: (moduleId: string) => void
}

export function ModulePalette({ modules, onAdd }: ModulePaletteProps) {
  return (
    <aside className="rounded-[26px] bg-[#F1F0E9] px-3 py-5 shadow-[0px_8px_24px_rgba(27,29,17,0.08)]">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-[18px] font-bold text-[#26272F]">模块库</h2>
        <img src={detailLibraryGridIcon} alt="" className="h-5 w-5" />
      </div>

      <div className="space-y-3">
        {modules.map((module) => (
          <PaletteBlock key={module.id} module={module} onAdd={onAdd} />
        ))}
        <div className="flex items-center justify-center rounded-[14px] border border-dashed border-[#A8ADB8] px-3 py-4 text-[13px] leading-5 text-[#868C98]">
          点击或拖拽积木
        </div>
      </div>
    </aside>
  )
}
