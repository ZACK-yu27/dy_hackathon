import decorativeDots from '../../../assets/icons/decorative-dots.svg'

type SectionTitleProps = {
  title: string
}

export function SectionTitle({ title }: SectionTitleProps) {
  return (
    <div className="flex items-center justify-between px-5 pt-8">
      <div className="flex items-center gap-2">
        <span className="h-6 w-1.5 rounded-full bg-[#D4EF2E]" aria-hidden="true" />
        <h2 className="text-2xl font-bold leading-8 text-[#1B1D11]">{title}</h2>
      </div>

      <img
        src={decorativeDots}
        alt=""
        className="h-5 w-7 opacity-20"
      />
    </div>
  )
}
