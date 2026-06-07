import {
  DndContext,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { useEffect, useMemo, useRef, useState } from 'react'
import detailBackIcon from '../../assets/icons/figma-deep/detail-back.svg'
import detailMoreIcon from '../../assets/icons/figma-deep/detail-more.svg'
import detailSendIcon from '../../assets/icons/figma-deep/detail-send.svg'
import { DeviceShell } from '../../components/TravelUi'
import { FloatingModulePalette } from './components/FloatingModulePalette'
import { InfiniteCanvas } from './components/InfiniteCanvas'
import { MoreActionMenu } from './components/MoreActionMenu'
import { RouteBlock } from './components/RouteBlock'
import { travelModules } from './data'
import { useCustomModules } from './useCustomModules'
import { useInfiniteCanvas } from './useInfiniteCanvas'
import { useRouteBuilder } from './useRouteBuilder'

type ActiveDrag =
  | { source: 'palette'; moduleId: string }
  | { source: 'route-item'; routeItemId: string }
  | null

export default function TravelProjectDetailPage() {
  const { customModules, addCustomModule } = useCustomModules()
  const allModules = useMemo(
    () => [...travelModules, ...customModules],
    [customModules],
  )
  const {
    routeItems,
    routeModulesById,
    availableModules,
    addModuleToRoute,
    removeRouteItem,
    moveRouteItem,
    clearRouteItems,
  } = useRouteBuilder(allModules)
  const {
    viewportRef,
    transform,
    zoomIn,
    zoomOut,
    resetView,
    viewportHandlers,
  } = useInfiniteCanvas()
  const [activeDrag, setActiveDrag] = useState<ActiveDrag>(null)
  const [insertIndex, setInsertIndex] = useState<number | null>(null)
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ top: 100, left: 220 })
  const [toast, setToast] = useState('')
  const mainRef = useRef<HTMLElement | null>(null)
  const moreButtonRef = useRef<HTMLButtonElement | null>(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const activeOverlayModule = useMemo(() => {
    if (!activeDrag) return null

    if (activeDrag.source === 'palette') {
      return routeModulesById.get(activeDrag.moduleId) ?? null
    }

    const routeItem = routeItems.find((item) => item.id === activeDrag.routeItemId)
    return routeItem ? routeModulesById.get(routeItem.moduleId) ?? null : null
  }, [activeDrag, routeItems, routeModulesById])

  useEffect(() => {
    if (!toast) return undefined

    const timer = window.setTimeout(() => setToast(''), 1800)
    return () => window.clearTimeout(timer)
  }, [toast])

  function showMenuToast(message: string) {
    setToast(message)
    setIsMoreMenuOpen(false)
  }

  function toggleMoreMenu() {
    if (isMoreMenuOpen) {
      setIsMoreMenuOpen(false)
      return
    }

    const buttonRect = moreButtonRef.current?.getBoundingClientRect()
    const mainRect = mainRef.current?.getBoundingClientRect()
    if (buttonRect && mainRect) {
      setMenuPosition({
        top: buttonRect.bottom - mainRect.top + 10,
        left: Math.min(buttonRect.right - mainRect.left - 164, mainRect.width - 182),
      })
    }

    setIsMoreMenuOpen(true)
  }

  function getInsertIndex(event: DragOverEvent | DragEndEvent) {
    const over = event.over
    if (!over) return routeItems.length

    const overId = String(over.id)
    if (overId === 'route-empty') return 0
    if (overId === 'infinite-canvas' || overId === 'route-end') return routeItems.length

    if (overId.startsWith('route-slot-')) {
      const slotIndex = Number(overId.replace('route-slot-', ''))
      return Number.isFinite(slotIndex) ? slotIndex : routeItems.length
    }

    if (overId.startsWith('route-item-')) {
      const targetId = overId.replace('route-item-', '')
      const targetIndex = routeItems.findIndex((item) => item.id === targetId)
      if (targetIndex < 0) return routeItems.length

      const translated = event.active.rect.current.translated
      const activeCenterY = translated
        ? translated.top + translated.height / 2
        : event.active.rect.current.initial?.top ?? 0
      const overCenterY = over.rect.top + over.rect.height / 2

      return activeCenterY < overCenterY ? targetIndex : targetIndex + 1
    }

    return routeItems.length
  }

  function handleDragStart(event: DragStartEvent) {
    const data = event.active.data.current
    if (data?.source === 'palette' && typeof data.moduleId === 'string') {
      setActiveDrag({ source: 'palette', moduleId: data.moduleId })
      setInsertIndex(routeItems.length)
      return
    }

    if (data?.source === 'route-item' && typeof data.routeItemId === 'string') {
      setActiveDrag({ source: 'route-item', routeItemId: data.routeItemId })
    }
  }

  function handleDragOver(event: DragOverEvent) {
    const data = event.active.data.current
    if (data?.source === 'palette' || data?.source === 'route-item') {
      setInsertIndex(getInsertIndex(event))
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const data = event.active.data.current
    const nextInsertIndex = getInsertIndex(event)

    if (data?.source === 'palette' && typeof data.moduleId === 'string') {
      addModuleToRoute(data.moduleId, nextInsertIndex)
    }

    if (data?.source === 'route-item' && typeof data.routeItemId === 'string') {
      moveRouteItem(data.routeItemId, nextInsertIndex)
    }

    setActiveDrag(null)
    setInsertIndex(null)
  }

  function handleDragCancel() {
    setActiveDrag(null)
    setInsertIndex(null)
  }

  return (
    <DeviceShell className="bg-[#E7E6DE]">
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <main ref={mainRef} className="relative h-full overflow-hidden px-[15px] pb-[14px] pt-4">
          <section
            className="relative z-20 overflow-visible rounded-b-[28px] rounded-t-[30px] bg-[#F1F0E9] px-5 pb-4 pt-5"
            style={{
              boxShadow: '0px 8px 24px rgba(27,29,17,0.08)',
            }}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[136px] rounded-t-[30px] bg-[#F2F1EB]" />
            <div
              className="pointer-events-none absolute left-0 top-0 h-[38px] w-full rounded-t-[30px] bg-[#F2F1EB]"
              style={{ clipPath: 'polygon(0 0, 40% 0, 45% 100%, 100% 100%, 100% 0)' }}
            />
            <div className="relative z-10 flex items-start justify-between pt-[20px]">
              <a href="/travel-unpack" className="pt-[10px] text-[#43464D]">
                <img src={detailBackIcon} alt="" className="h-7 w-7" />
              </a>
              <div className="mr-auto ml-4">
                <h1 className="text-[31px] font-black leading-[42px] text-[#1B1D11]">上海错峰避坑之旅</h1>
                <p className="mt-[2px] text-[15px] text-[#73776E]">12 模块 / 8 避雷</p>
              </div>
              <div className="flex gap-3 pt-[6px]">
                <button type="button" className="flex h-14 w-14 items-center justify-center rounded-full bg-[#111] text-white shadow-[0px_8px_20px_rgba(27,29,17,0.15)]">
                  <img src={detailSendIcon} alt="" className="h-6 w-6" />
                </button>
                <div className="relative" data-canvas-interactive="true">
                  <button
                    ref={moreButtonRef}
                    type="button"
                    onClick={toggleMoreMenu}
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#777] shadow-[0px_8px_20px_rgba(27,29,17,0.12)]"
                    aria-label="更多操作"
                  >
                    <img src={detailMoreIcon} alt="" className="h-6 w-6" />
                  </button>
                </div>
              </div>
            </div>
          </section>

          <InfiniteCanvas
            viewportRef={viewportRef}
            transform={transform}
            viewportHandlers={viewportHandlers}
            routeItems={routeItems}
            modulesById={routeModulesById}
            insertIndex={insertIndex}
            onRemove={removeRouteItem}
            onClear={clearRouteItems}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onReset={resetView}
          />

          <FloatingModulePalette
            modules={availableModules}
            onAdd={(moduleId) => addModuleToRoute(moduleId)}
            onCreateCustomModule={addCustomModule}
          />

          <MoreActionMenu
            open={isMoreMenuOpen}
            top={menuPosition.top}
            left={menuPosition.left}
            onClose={() => setIsMoreMenuOpen(false)}
            onPreview={() => showMenuToast('正在预览当前路线')}
            onOptimize={() => showMenuToast('智能优化将在后续版本接入')}
            onExport={() => showMenuToast('攻略导出功能准备中')}
            onSettings={() => showMenuToast('更多设置')}
          />

          {toast ? (
            <div className="pointer-events-none absolute left-1/2 top-[164px] z-[1100] -translate-x-1/2 rounded-full bg-[#111]/90 px-5 py-3 text-[13px] font-bold text-[#D4EF2E] shadow-[0px_12px_28px_rgba(27,29,17,0.18)]">
              {toast}
            </div>
          ) : null}
        </main>

        <DragOverlay dropAnimation={{ duration: 180, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
          {activeOverlayModule ? (
            <RouteBlock id="drag-overlay" module={activeOverlayModule} onRemove={() => undefined} isOverlay />
          ) : null}
        </DragOverlay>
      </DndContext>
    </DeviceShell>
  )
}
