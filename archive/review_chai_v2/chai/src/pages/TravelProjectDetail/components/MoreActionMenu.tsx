type MoreActionMenuProps = {
  open: boolean
  top: number
  left: number
  onClose: () => void
  onPreview: () => void
  onOptimize: () => void
  onExport: () => void
  onSettings: () => void
}

const menuItems = [
  { label: '预览路线', icon: '◉', action: 'preview' },
  { label: '智能优化', icon: '✣', action: 'optimize' },
  { label: '导出攻略', icon: '⇪', action: 'export' },
  { label: '更多设置', icon: '⚙', action: 'settings' },
] as const

export function MoreActionMenu({
  open,
  top,
  left,
  onClose,
  onPreview,
  onOptimize,
  onExport,
  onSettings,
}: MoreActionMenuProps) {
  if (!open) return null

  const handlers = {
    preview: onPreview,
    optimize: onOptimize,
    export: onExport,
    settings: onSettings,
  }

  return (
    <div
      className="absolute inset-0 z-[1000]"
      onPointerDown={onClose}
      data-canvas-interactive="true"
    >
      <div
        className="absolute w-[164px] overflow-hidden rounded-[20px] border border-white/70 bg-white/92 py-2 shadow-[0px_18px_42px_rgba(27,29,17,0.18)] backdrop-blur-[18px]"
        style={{ top, left }}
        onPointerDown={(event) => event.stopPropagation()}
      >
        {menuItems.map((item) => (
          <button
            key={item.action}
            type="button"
            onClick={handlers[item.action]}
            className="flex h-11 w-full items-center gap-3 px-4 text-left text-[13px] font-medium text-[#343941] transition hover:bg-[#F3F2EC]"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F1F0E9] text-[13px] text-[#697080]">
              {item.icon}
            </span>
            {item.label}
          </button>
        ))}
      </div>
    </div>
  )
}
