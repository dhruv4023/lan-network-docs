import { useState, useEffect, useCallback, useRef } from 'react'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import Home from './components/Home'
import Wizard from './components/Wizard'
import NetworkSetup from './components/NetworkSetup'
import RouterConfig from './components/RouterConfig'
import PrinterConfig from './components/PrinterConfig'
import Troubleshooting from './components/Troubleshooting'
import FAQ from './components/FAQ'
import Summary from './components/Summary'

const STORAGE_KEY = 'netprint-console-state-v1'

function loadState() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {} }
  catch { return {} }
}

const ROUTES = [
  'home', 'wizard', 'network', 'router', 'printer',
  'troubleshooting', 'faq', 'summary',
]

export default function App() {
  const [state, setState] = useState(() => {
    const saved = loadState()
    return {
      checklists: saved.checklists || {},
      theme: saved.theme || 'dark',
      wizard: saved.wizard || { topology: null, dhcp: null, count: null, step: 0 },
      routeTabs: saved.routeTabs || { network: 'single' },
      ...saved,
    }
  })
  const [route, setRoute] = useState('home')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchIndexRef = useRef([])

  const saveState = useCallback((updater) => {
    setState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) }
      catch {}
      return next
    })
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.theme)
  }, [state.theme])

  useEffect(() => {
    const hash = location.hash.slice(1)
    if (hash && ROUTES.includes(hash)) setRoute(hash)
  }, [])

  const navigate = useCallback((to, tab) => {
    setRoute(to)
    setSidebarOpen(false)
    window.scrollTo(0, 0)
    history.replaceState(null, '', '#' + to)
  }, [])

  const toggleTheme = useCallback(() => {
    saveState(prev => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }))
  }, [saveState])

  return (
    <div className="app grid min-h-screen" style={{ gridTemplateColumns: '268px 1fr' }}>
      <Sidebar
        route={route}
        navigate={navigate}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        toggleTheme={toggleTheme}
        theme={state.theme}
      />
      <button
        className="sidebar-toggle fixed top-3 left-3 z-120 bg-panel text-fg border border-line rounded-lg w-[38px] h-[38px] text-lg cursor-pointer hidden max-[980px]:flex items-center justify-center"
        onClick={() => setSidebarOpen(o => !o)}
        aria-label="Toggle navigation"
        aria-expanded={sidebarOpen}
      >
        ☰
      </button>
      <main id="main" className="main px-6 py-6 pb-16 w-full max-w-[1080px] mx-auto max-[980px]:px-4 max-[980px]:pt-16">
        <Topbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchIndexRef={searchIndexRef}
          navigate={navigate}
        />
        <div className={route !== 'home' ? '' : ''}>
          {route === 'home' && (
            <Home
              onNavigate={navigate}
              state={state}
              saveState={saveState}
              searchIndexRef={searchIndexRef}
            />
          )}
          {route === 'wizard' && (
            <Wizard state={state} saveState={saveState} navigate={navigate} />
          )}
          {route === 'network' && (
            <NetworkSetup state={state} saveState={saveState} />
          )}
          {route === 'router' && (
            <RouterConfig />
          )}
          {route === 'printer' && (
            <PrinterConfig state={state} saveState={saveState} />
          )}
          {route === 'troubleshooting' && (
            <Troubleshooting />
          )}
          {route === 'faq' && (
            <FAQ />
          )}
          {route === 'summary' && (
            <Summary state={state} />
          )}
        </div>
      </main>
    </div>
  )
}
