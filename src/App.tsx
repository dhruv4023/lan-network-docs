import { useEffect } from 'react'
import { useStore } from './store'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import RouterPage from './pages/RouterPage'
import DevicesPage from './pages/DevicesPage'
import DhcpPage from './pages/DhcpPage'
import TopologyPage from './pages/TopologyPage'
import IpCalcPage from './pages/IpCalcPage'
import LogsPage from './pages/LogsPage'

export default function App() {
  const activePage = useStore(s => s.settings.activePage)
  const setPage = useStore(s => s.setPage)
  const toggleSidebar = useStore(s => s.toggleSidebar)
  const theme = useStore(s => s.settings.theme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const pages: Record<string, React.ReactNode> = {
    dashboard: <Dashboard />,
    router: <RouterPage />,
    devices: <DevicesPage />,
    dhcp: <DhcpPage />,
    topology: <TopologyPage />,
    ipcalc: <IpCalcPage />,
    logs: <LogsPage />,
  }

  return (
    <div className="app grid min-h-screen" style={{ gridTemplateColumns: '268px 1fr' }}>
      <Sidebar />
      <button
        className="sidebar-toggle fixed top-3 left-3 z-30 bg-panel text-fg border border-line rounded-lg w-[38px] h-[38px] text-lg cursor-pointer hidden max-[980px]:flex items-center justify-center"
        onClick={toggleSidebar}
        aria-label="Toggle navigation"
      >
        ☰
      </button>
      <main className="main px-6 py-6 pb-16 w-full max-w-[1200px] mx-auto max-[980px]:px-4 max-[980px]:pt-16">
        {pages[activePage] || <Dashboard />}
      </main>
    </div>
  )
}
