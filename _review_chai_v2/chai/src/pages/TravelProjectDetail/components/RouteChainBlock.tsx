import { useDraggable, useDroppable } from '@dnd-kit/core'
import detailCardRiskIcon from '../../../assets/icons/figma-deep/detail-card-risk.svg'
import detailCardTimeIcon from '../../../assets/icons/figma-deep/detail-card-time.svg'
import type { RouteItem, TravelModule } from '../types'

type RouteChainBlockProps = {
  item: RouteItem
  module: TravelModule
  onRemove: (id: string) => void
  isOverlay?: boolean
}

export function RouteChainBlock({ item, module, onRemove, isOverlay = false }: RouteChainBlockProps) {
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `route-item-${item.id}`,
    disabled: isOverlay,
    data: {
      source: 'route-item-drop',
      routeItemId: item.id,
    },
  })
  const { attributes, listeners, setNodeRef: setDragRef, transform, isDragging } = useDraggable({
    id: `route:${item.id}`,
    disabled: isOverlay,
    data: {
      source: 'route-item',
      routeItemId: item.id,
    },
  })

  function setRefs(node: HTMLElement | null) {
    setDropRef(node)
    setDragRef(node)
  }

  return (
    <article
      ref={setRefs}
      data-canvas-interactive="true"
      className={`relative flex w-[214px] overflow-hidden rounded-[18px] bg-[#FCFBF7] shadow-[0px_6px_16px_rgba(27,29,17,0.08)] transition ${
        isDragging ? 'opacity-55' : ''
      } ${isOver ? 'ring-2 ring-[#D4EF2E]' : ''} ${
        isOverlay ? 'scale-[1.04] shadow-[0px_18px_40px_rgba(27,29,17,0.22)]' : ''
      }`}
      style={{
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
      }}
    >
      <div
        className="relative flex w-[56px] shrink-0 cursor-grab items-center justify-center active:cursor-grabbing"
        style={{ backgroundColor: module.color ?? '#8B909C' }}
        {...listeners}
        {...attributes}
      >
        {module.icon ? <img src={module.icon} alt="" className="h-6 w-6" /> : null}
        <span className="absolute -right-2 top-4 h-4 w-4 rounded-full border-[5px] border-[#F1F0E9] bg-white" />
        <span className="absolute -right-2 bottom-4 h-4 w-4 rounded-full border-[5px] border-[#F1F0E9] bg-white" />
      </div>

      <div className="min-w-0 flex-1 px-3 py-[13px]">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-[15px] font-bold leading-5 text-[#27303A]">{module.title}</h3>
            <p className="mt-1 inline-flex items-center gap-1 text-[12px] text-[#6A707A]">
              <img src={detailCardTimeIcon} alt="" className="h-[14px] w-[14px]" />
              {module.time ?? module.subtitle ?? '自由安排'}
            </p>
          </div>
          <span
            className="shrink-0 rounded-full px-2 py-1 text-[10px] text-[#707769]"
            style={{ backgroundColor: module.tagColor ?? '#EEF0F4' }}
          >
            {module.tag ?? module.type}
          </span>
        </div>

        {module.riskTags?.length ? (
          <a
            href="/travel-unpack/risk-detail"
            className="mt-3 inline-flex max-w-[128px] items-center gap-1 rounded-[4px] border border-[#F1B5A8] bg-[#FFE7E0] px-2 py-1 text-[11px] text-[#E05A4E]"
          >
            <img src={detailCardRiskIcon} alt="" className="h-[12px] w-[12px]" />
            <span className="truncate">{module.riskTags[0]}</span>
          </a>
        ) : null}
      </div>

      {!isOverlay ? (
        <button
          type="button"
          aria-label={`删除 ${module.title}`}
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            onRemove(item.id)
          }}
          className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#F1F0E9] text-[#7A7F88] transition hover:bg-[#111] hover:text-[#D4EF2E]"
        >
          ×
        </button>
      ) : null}
    </article>
  )
}
