const pages = [
  { title: '我的旅行项目', path: '/travel-unpack', desc: '首页 / 我的旅行项目' },
  { title: '新建旅行项目', path: '/travel-unpack/new-project', desc: '新建旅行项目弹窗' },
  { title: '项目详情', path: '/travel-unpack/detail', desc: '路线编辑器' },
  { title: '避雷详情', path: '/travel-unpack/risk-detail', desc: '风险详情弹窗' },
  { title: '探索', path: '/travel-unpack/explore', desc: '探索页' },
  { title: '我的', path: '/travel-unpack/profile', desc: '个人中心 / 我的' },
]

export default function FigmaPagesHubPage() {
  return (
    <main className="min-h-screen bg-[#f5f4ed] px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm uppercase tracking-[0.2em] text-[#6E744F]">Figma Pages</p>
        <h1 className="mt-3 text-4xl font-black text-[#1B1D11]">旅拆拆页面总览</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-[#464934]/80">
          当前已接入同一份 Figma 画布中的 6 个主要页面，可直接点击进入查看。
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {pages.map((page) => (
            <a
              key={page.path}
              href={page.path}
              className="rounded-[28px] bg-white p-6 text-[#1B1D11] shadow-[0px_12px_32px_rgba(27,29,17,0.08)] transition-transform duration-200 hover:-translate-y-1"
            >
              <p className="text-sm uppercase tracking-[0.18em] text-[#6E744F]">{page.desc}</p>
              <h2 className="mt-4 text-2xl font-bold">{page.title}</h2>
              <p className="mt-6 text-sm text-[#464934]/70">{page.path}</p>
            </a>
          ))}
        </div>
      </div>
    </main>
  )
}
