import searchIcon from '../../../assets/icons/search.svg'

type SearchBarProps = {
  placeholder?: string
  href?: string
}

export function SearchBar({ placeholder = '搜索旅行项目', href = '/travel-unpack/explore' }: SearchBarProps) {
  return (
    <div className="px-5">
      <a
        href={href}
        className="flex h-14 items-center gap-3 rounded-full border border-[rgba(198,201,173,0.3)] bg-[#F8F7F2] px-6 backdrop-blur-[12px]"
        style={{
          boxShadow:
            '0px 4px 12px -2px rgba(0, 0, 0, 0.02), 0px 8px 24px -4px rgba(0, 0, 0, 0.04)',
        }}
      >
        <span className="w-full text-sm text-[#464934]">{placeholder}</span>
        <img src={searchIcon} alt="" className="h-[18px] w-[18px] shrink-0" />
      </a>
    </div>
  )
}
