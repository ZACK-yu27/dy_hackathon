import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import detailBannerFlagIcon from '../../../assets/icons/figma-deep/detail-banner-flag.svg'
import detailClearIcon from '../../../assets/icons/figma-deep/detail-clear.svg'
import type { InsertPreview, RouteItem, TravelModule } from '../types'
import { DropPlaceholder } from './DropPlaceholder'
import { RouteBlock } from './RouteBlock'

type RouteCanvasProps = {
  routeItems: RouteItem[]
  modulesById: Map<string, TravelModule>
  insertPreview: InsertPreview
  onRemove: (id: string) => void
  onClear: () => void
}

export function RouteCanvas({
  routeItems,
  modulesById,
  insertPreview,
  onRemove,
  onClear,
}: RouteCanvasProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'route-canvas',
    data: { source: 'canvas' },
  })

  return (
    <section
      ref={setNodeRef}
      className={`min-w-0 rounded-[26px] bg-[#F1F0E9] px-3 py-5 shadow-[0px_8px_24px_rgba(27,29,17,0.08)] transition ${
        isOver ? 'ring-2 ring-[#D4EF2E]' : ''
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-[18px] font-bold text-[#26272F]">路线脚本</h2>
          <p className="text-[13px] text-[#8A8D96]">(拖拽模块组装)</p>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-1 text-[14px] text-[#8C9199] transition hover:text-[#111]"
        >
          <img src={detailClearIcon} alt="" className="h-[14px] w-[14px]" />
          清空
        </button>
      </div>

      <div className="mb-3 flex items-center justify-center gap-2 rounded-[16px] bg-[#D4EF2E] px-4 py-4 text-center text-[17px] font-bold shadow-[inset_0px_-2px_0px_rgba(0,0,0,0.08)]">
        <img src={detailBannerFlagIcon} alt="" className="h-[16px] w-[16px]" />
        上海错峰路线
      </div>

      <p className="mb-4 rounded-[12px] bg-[#FAF9F5] px-3 py-2 text-[11px] leading-5 text-[#727764]">
        建议顺序：景点 → 交通 → 餐饮 → 住宿，可自由调整
      </p>

      <SortableContext items={routeItems.map((item) => item.id)} strategy={verticalListSortingStrategy}>
        {routeItems.length === 0 ? (
          <div className="rounded-[18px] border border-dashed border-[#BCC0C9] bg-[#FAF9F5] px-4 py-8 text-center text-[13px] leading-6 text-[#8E93A0]">
            拖一块积木到这里开始拼路线
          </div>
        ) : (
          <div className="relative space-y-1">
            {routeItems.map((item, index) => {
              const module = modulesById.get(item.moduleId)
              if (!module) return null

              return (
                <div key={item.id} className="relative">
                  {insertPreview?.overId === item.id && insertPreview.position === 'before' ? (
                    <DropPlaceholder compact />
                  ) : null}

                  <RouteBlock id={item.id} module={module} onRemove={onRemove} />

                  {index < routeItems.length - 1 ? (
                    <div className="mx-auto h-4 w-1 rounded-full bg-[#C8D65A]" />
                  ) : null}

                  {insertPreview?.overId === item.id && insertPreview.position === 'after' ? (
                    <DropPlaceholder compact />
                  ) : null}
                </div>
              )
            })}

            {insertPreview?.overId === null ? <DropPlaceholder compact /> : null}
          </div>
        )}
      </SortableContext>
    </section>
  )
}
