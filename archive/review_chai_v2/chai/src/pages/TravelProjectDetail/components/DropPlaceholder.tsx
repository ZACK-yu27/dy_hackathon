type DropPlaceholderProps = {
  compact?: boolean
}

export function DropPlaceholder({ compact = false }: DropPlaceholderProps) {
  return (
    <div
      className={`flex items-center justify-center rounded-[16px] border border-dashed border-[#BFD423] bg-[#D4EF2E]/20 text-center font-bold text-[#5C6422] shadow-[inset_0px_0px_0px_1px_rgba(255,255,255,0.45)] ${
        compact ? 'my-1 min-h-9 px-3 py-2 text-[12px]' : 'min-h-[88px] px-4 py-5 text-[13px]'
      }`}
    >
      松手拼接到这里
    </div>
  )
}
