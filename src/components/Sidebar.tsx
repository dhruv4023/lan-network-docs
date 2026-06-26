import { useStore } from '../store'

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id: 'router', label: 'Router', icon: 'M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.858 15.355-5.858 21.213 0' },
  { id: 'devices', label: 'Devices', icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  { id: 'dhcp', label: 'DHCP', icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01' },
  { id: 'topology', label: 'Topology', icon: 'M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4' },
  { id: 'ipcalc', label: 'IP Calc', icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
  { id: 'logs', label: 'Event Log', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
]

export default function Sidebar() {
  const activePage = useStore(s => s.settings.activePage)
  const setPage = useStore(s => s.setPage)
  const toggleSidebar = useStore(s => s.toggleSidebar)
  const sidebarOpen = useStore(s => s.settings.sidebarOpen)
  const setTheme = useStore(s => s.setTheme)
  const theme = useStore(s => s.settings.theme)

  return (
    <>
      <aside
        className={`sidebar glass-strong flex flex-col gap-5 sticky top-0 h-screen overflow-y-auto z-30 p-5
          max-[980px]:fixed max-[980px]:left-0 max-[980px]:top-0 max-[980px]:w-[260px]
          max-[980px]:transition-transform max-[980px]:duration-200
          ${sidebarOpen ? 'max-[980px]:translate-x-0' : 'max-[980px]:-translate-x-[105%]'}`}
      >
        <div className="flex items-center gap-3 px-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center text-[#03241d] font-bold text-sm shadow-lg shadow-accent/20">
            N
          </div>
          <div>
            <p className="font-bold text-sm m-0">NetSim</p>
            <p className="text-xs text-muted m-0">Network Simulator</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1" aria-label="Primary">
          {NAV.map(item => {
            const isActive = activePage === item.id
            return (
              <button
                key={item.id}
                className={`flex items-center gap-3 bg-transparent border-none text-left text-sm font-sans
                  px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 group
                  ${isActive
                    ? 'bg-accent-dim text-accent font-semibold shadow-sm'
                    : 'text-muted hover:bg-panel-2/60 hover:text-fg'
                  }`}
                onClick={() => {
                  setPage(item.id)
                  if (window.innerWidth <= 980) toggleSidebar()
                }}
              >
                <svg className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-accent' : 'text-muted group-hover:text-fg'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="mt-auto flex flex-col gap-2">
          <button
            className="flex items-center gap-2.5 justify-start bg-panel/60 border border-line/60 text-fg px-3 py-2.5 rounded-xl cursor-pointer text-xs hover:border-accent/60 transition-all duration-150"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? (
              <svg className="w-4 h-4 text-warn" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
            <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
          </button>
        </div>
      </aside>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 max-[980px]:block hidden"
          onClick={toggleSidebar}
        />
      )}
    </>
  )
}
