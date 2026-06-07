import { useDraggable } from '@dnd-kit/core'
import detailMoreIcon from '../../../assets/icons/figma-deep/detail-more.svg'
import type { TravelModule } from '../types'

type PaletteBlockProps = {
  module: TravelModule
  onAdd: (moduleId: string) => void
}

export function PaletteBlock({ module, onAdd }: PaletteBlockProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `palette:${module.id}`,
    data: {
      source: 'palette',
      moduleId: module.id,
    },
  })

  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={() => onAdd(module.id)}
      className={`group flex w-full items-center justify-between rounded-[14px] bg-[#FAF9F5] px-2 py-[11px] text-left text-[#4D525A] transition duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0px_8px_16px_rgba(27,29,17,0.08)] ${
        isDragging ? 'opacity-50 shadow-[0px_12px_24px_rgba(27,29,17,0.16)]' : ''
      }`}
      style={{
        boxShadow: `inset 4px 0 0 ${module.color ?? '#8B909C'}`,
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
      }}
      {...listeners}
      {...attributes}
    >
      <span className="flex min-w-0 items-center gap-1.5 text-[13px] leading-5">
        {module.icon ? <img src={module.icon} alt="" className="h-[14px] w-[14px] shrink-0" /> : null}
        <span className="truncate">{module.title}</span>
      </span>
      <img src={detailMoreIcon} alt="" className="h-[14px] w-[14px] shrink-0 opacity-55 transition group-hover:opacity-90" />
    </button>
  )
}
