import type { CanvasTransform } from '../types'

type CanvasControlsProps = {
  transform: CanvasTransform
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
}

export function CanvasControls({ transform, onZoomIn, onZoomOut, onReset }: CanvasControlsProps) {
  return (
    <div
      className="absolute bottom-6 right-[18px] z-30 flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-2 py-2 shadow-[0px_12px_28px_rgba(27,29,17,0.12)] backdrop-blur-[16px]"
      data-canvas-interactive="true"
    >
      <button
        type="button"
        onClick={onZoomOut}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F3F2EC] text-xl font-bold text-[#48505C] transition hover:bg-[#111] hover:text-[#D4EF2E]"
        aria-label="缩小画布"
      >
        -
      </button>
      <span className="min-w-[46px] text-center text-[12px] font-bold text-[#1B1D11]">
        {Math.round(transform.scale * 100)}%
      </span>
      <button
        type="button"
        onClick={onZoomIn}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-[#D4EF2E] text-xl font-bold text-[#111] transition hover:scale-105"
        aria-label="放大画布"
      >
        +
      </button>
      <button
        type="button"
        onClick={onReset}
        className="h-9 rounded-full bg-[#111] px-3 text-[12px] font-bold text-[#D4EF2E]"
      >
        重置
      </button>
    </div>
  )
}
