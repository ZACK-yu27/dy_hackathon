import { useDroppable } from '@dnd-kit/core'
import type { MutableRefObject, PointerEventHandler, WheelEventHandler } from 'react'
import type { CanvasTransform, RouteItem, TravelModule } from '../types'
import { CanvasControls } from './CanvasControls'
import { RouteChainBlock } from './RouteChainBlock'
import { RouteDropSlot } from './RouteDropSlot'

type InfiniteCanvasProps = {
  viewportRef: MutableRefObject<HTMLDivElement | null>
  transform: CanvasTransform
  viewportHandlers: {
    onPointerDown: PointerEventHandler<HTMLDivElement>
    onPointerMove: PointerEventHandler<HTMLDivElement>
    onPointerUp: PointerEventHandler<HTMLDivElement>
    onPointerCancel: PointerEventHandler<HTMLDivElement>
    onWheel: WheelEventHandler<HTMLDivElement>
  }
  routeItems: RouteItem[]
  modulesById: Map<string, TravelModule>
  insertIndex: number | null
  onRemove: (id: string) => void
  onClear: () => void
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
}

export function InfiniteCanvas({
  viewportRef,
  transform,
  viewportHandlers,
  routeItems,
  modulesById,
  insertIndex,
  onRemove,
  onClear,
  onZoomIn,
  onZoomOut,
  onReset,
}: InfiniteCanvasProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'infinite-canvas',
    data: { source: 'canvas' },
  })

  return (
    <section className="relative mt-[8px] h-[calc(100%-146px)] overflow-hidden rounded-[30px] bg-[#F1F0E9] shadow-[0px_8px_24px_rgba(27,29,17,0.08)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 bg-gradient-to-b from-[#F1F0E9] via-[#F1F0E9]/90 to-transparent px-5 pb-6 pt-4">
        <div className="pointer-events-auto flex items-start justify-between pl-[154px]" data-canvas-interactive="true">
          <div>
            <h2 className="text-[17px] font-bold leading-5 text-[#26272F]">路线脚本</h2>
            <p className="text-[11px] leading-4 text-[#8A8D96]">(拖拽模块组装)</p>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="rounded-full bg-white/80 px-3 py-1.5 text-[12px] text-[#8C9199] shadow-[0px_6px_16px_rgba(27,29,17,0.06)]"
          >
            清空
          </button>
        </div>
        <p className="pointer-events-auto ml-[154px] mt-2 w-[176px] rounded-[10px] bg-white/76 px-2.5 py-1.5 text-[10px] leading-4 text-[#727764]" data-canvas-interactive="true">
          建议顺序：景点 → 交通 → 餐饮 → 住宿，可自由调整
        </p>
      </div>

      <div
        ref={(node) => {
          viewportRef.current = node
          setNodeRef(node)
        }}
        className={`relative h-full w-full cursor-grab overflow-hidden touch-none active:cursor-grabbing ${
          isOver ? 'ring-2 ring-inset ring-[#D4EF2E]' : ''
        }`}
        {...viewportHandlers}
      >
        <div
          className="absolute left-0 top-0 h-[2400px] w-[2400px]"
          style={{
            transform: `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${transform.scale})`,
            transformOrigin: '0 0',
            backgroundImage:
              'radial-gradient(circle, rgba(120,124,95,0.18) 1px, transparent 1px), linear-gradient(rgba(120,124,95,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(120,124,95,0.05) 1px, transparent 1px)',
            backgroundSize: '24px 24px, 120px 120px, 120px 120px',
          }}
        >
          <div className="absolute left-[570px] top-[460px] w-[240px]" data-canvas-interactive="true">
            {routeItems.length === 0 ? (
              <RouteDropSlot id="route-empty" active={insertIndex === 0} />
            ) : (
              <>
                <RouteDropSlot id="route-slot-0" active={insertIndex === 0} compact />
                {routeItems.map((item, index) => {
                  const module = modulesById.get(item.moduleId)
                  if (!module) return null

                  const nextSlotIndex = index + 1
                  const isLast = index === routeItems.length - 1

                  return (
                    <div key={item.id} className="relative">
                      <RouteChainBlock item={item} module={module} onRemove={onRemove} />
                      {!isLast ? (
                        <div className="ml-[26px] h-4 w-1 rounded-full bg-[#C8D65A]" />
                      ) : null}
                      <RouteDropSlot
                        id={isLast ? 'route-end' : `route-slot-${nextSlotIndex}`}
                        active={insertIndex === nextSlotIndex}
                        compact
                      />
                    </div>
                  )
                })}
              </>
            )}
          </div>
        </div>
      </div>

      <CanvasControls
        transform={transform}
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        onReset={onReset}
      />
    </section>
  )
}
