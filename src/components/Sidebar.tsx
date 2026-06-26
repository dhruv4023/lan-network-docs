import { useStore } from '../store'

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: '\u2302' },
  { id: 'router', label: 'Router', icon: '\uD83D\uDCE1' },
  { id: 'devices', label: 'Devices', icon: '\uD83D\uDDA8' },
  { id: 'dhcp', label: 'DHCP', icon: '\uD83C\uDF10' },
  { id: 'topology', label: 'Topology', icon: '\uD83D\uDD0C' },
  { id: 'ipcalc', label: 'IP Calculator', icon: '\uD83D\uDCCF' },
  { id: 'logs', label: 'Event Log', icon: '\uD83D\uDCCD' },
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
        className={`sidebar bg-bg-soft border-r border-line p-5 flex flex-col gap-5 sticky top-0 h-screen overflow-y-auto z-30
          max-[980px]:fixed max-[980px]:left-0 max-[980px]:top-0 max-[980px]:h-screen max-[980px]:w-[260px]
          max-[980px]:transition-transform max-[980px]:duration-200
          ${sidebarOpen ? 'max-[980px]:translate-x-0' : 'max-[980px]:-translate-x-[105%]'}`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-[#03241d] font-bold text-sm">
            N
          </div>
          <div>
            <p className="font-bold text-sm m-0">NetSim</p>
            <p className="text-xs text-muted m-0">Network Simulator</p>
          </div>
        </div>

        <nav className="flex flex-col gap-0.5" aria-label="Primary">
          {NAV.map(item => (
            <button
              key={item.id}
              className={`flex items-center gap-2.5 bg-transparent border-none text-muted text-left text-sm font-sans
                px-2.5 py-2 rounded-lg cursor-pointer transition-all duration-150
                hover:bg-panel-2 hover:text-fg
                ${activePage === item.id ? '!bg-accent-dim !text-accent font-semibold' : ''}`}
              onClick={() => setPage(item.id)}
            >
              <span className="w-5 text-center shrink-0">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-2">
          <button
            className="flex items-center gap-2 justify-start bg-panel border border-line text-fg px-3 py-2 rounded-lg cursor-pointer text-xs hover:border-accent transition-colors"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <span>{theme === 'dark' ? '\u2600\uFE0F' : '\uD83C\uDF19'}</span>
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
