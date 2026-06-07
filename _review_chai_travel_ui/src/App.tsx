import type { ReactElement } from 'react'
import TravelExplorePage from './pages/TravelExplore'
import TravelNewProjectPage from './pages/TravelNewProject'
import TravelProfilePage from './pages/TravelProfile'
import TravelProjectDetailPage from './pages/TravelProjectDetail'
import TravelRiskDetailPage from './pages/TravelRiskDetail'
import TravelUnpackPage from './pages/TravelUnpack'

function App() {
  const normalizedPath = window.location.pathname.replace(/\/+$/, '') || '/'

  const pageMap: Record<string, ReactElement> = {
    '/': <TravelUnpackPage />,
    '/travel-unpack': <TravelUnpackPage />,
    '/travel-unpack/new-project': <TravelNewProjectPage />,
    '/travel-unpack/detail': <TravelProjectDetailPage />,
    '/travel-unpack/risk-detail': <TravelRiskDetailPage />,
    '/travel-unpack/explore': <TravelExplorePage />,
    '/travel-unpack/profile': <TravelProfilePage />,
  }

  if (pageMap[normalizedPath]) return pageMap[normalizedPath]

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f4ed] px-6 text-center">
      <div className="max-w-md rounded-[32px] bg-white p-10 text-[#1B1D11] shadow-[0px_12px_32px_rgba(27,29,17,0.08)]">
        <p className="text-sm uppercase tracking-[0.2em] text-[#464934]/60">404</p>
        <h1 className="mt-3 text-3xl font-black">页面不存在</h1>
        <p className="mt-3 text-sm leading-6 text-[#464934]/80">
          返回
          <a
            className="ml-1 font-semibold text-[#1B1D11] underline decoration-[#D4EF2E] underline-offset-4"
            href="/travel-unpack"
          >
            首页
          </a>
          继续查看旅拆拆。
        </p>
      </div>
    </main>
  )
}

export default App
