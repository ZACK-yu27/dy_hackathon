import { useDroppable } from '@dnd-kit/core'

type RouteDropSlotProps = {
  id: string
  active?: boolean
  compact?: boolean
}

export function RouteDropSlot({ id, active = false, compact = false }: RouteDropSlotProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { source: 'route-slot' },
  })

  return (
    <div ref={setNodeRef} className={compact ? 'py-1' : 'py-2'}>
      <div
        className={`flex items-center justify-center rounded-[16px] border border-dashed text-center font-bold transition ${
          compact ? 'min-h-8 px-3 py-1.5 text-[11px]' : 'min-h-[86px] px-4 py-5 text-[13px]'
        } ${
          active || isOver
            ? 'border-[#BFD423] bg-[#D4EF2E]/25 text-[#5C6422]'
            : 'border-[#BCC0C9] bg-[#FAF9F5]/86 text-[#8E93A0]'
        }`}
      >
        {compact ? '松手拼接到这里' : '拖一块积木到这里开始拼路线'}
      </div>
    </div>
  )
}
