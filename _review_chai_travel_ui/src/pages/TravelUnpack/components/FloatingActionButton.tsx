import fabPlusIcon from '../../../assets/icons/fab-plus.svg'

export function FloatingActionButton() {
  return (
    <a
      href="/travel-unpack/new-project"
      aria-label="新建旅行项目"
      className="pointer-events-auto inline-flex h-14 w-14 items-center justify-center rounded-full border border-[rgba(255,255,255,0.4)] bg-[#D4EF2E] transition-transform duration-200 hover:-translate-y-0.5"
      style={{ boxShadow: '0px 8px 16px 0px rgba(212, 239, 46, 0.3)' }}
    >
      <img src={fabPlusIcon} alt="" className="h-4 w-4" />
    </a>
  )
}
