import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from './store'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import RouterPage from './pages/RouterPage'
import DevicesPage from './pages/DevicesPage'
import DhcpPage from './pages/DhcpPage'
import TopologyPage from './pages/TopologyPage'
import IpCalcPage from './pages/IpCalcPage'
import LogsPage from './pages/LogsPage'
import DocsPage from './pages/DocsPage'

const PAGES: Record<string, { component: React.FC; label: string }> = {
  dashboard: { component: Dashboard, label: 'Dashboard' },
  router: { component: RouterPage, label: 'Router' },
  devices: { component: DevicesPage, label: 'Devices' },
  dhcp: { component: DhcpPage, label: 'DHCP' },
  topology: { component: TopologyPage, label: 'Topology' },
  ipcalc: { component: IpCalcPage, label: 'IP Calc' },
  logs: { component: LogsPage, label: 'Logs' },
  docs: { component: DocsPage, label: 'Session Guide' },
}

export default function App() {
  const activePage = useStore(s => s.settings.activePage)
  const toggleSidebar = useStore(s => s.toggleSidebar)
  const theme = useStore(s => s.settings.theme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const pageConfig = PAGES[activePage] || PAGES.dashboard
  const PageComponent = pageConfig.component

  return (
    <div className="app grid min-h-screen" style={{ gridTemplateColumns: '268px 1fr' }}>
      <Sidebar />
      <button
        className="sidebar-toggle fixed top-3 left-3 z-30 glass w-[38px] h-[38px] text-fg flex items-center justify-center cursor-pointer hidden max-[980px]:flex"
        onClick={toggleSidebar}
        aria-label="Toggle navigation"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <main className="main px-6 py-6 pb-16 w-full max-w-[1200px] mx-auto max-[980px]:px-4 max-[980px]:pt-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            <PageComponent />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
