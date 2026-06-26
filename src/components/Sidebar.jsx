const NAV_ITEMS = [
  { route: 'home', label: 'Overview' },
  { route: 'wizard', label: 'Setup Wizard' },
  { route: 'network', label: 'Without Router' },
  { route: 'router', label: 'Router Configuration' },
  { route: 'printer', label: 'Printer Configuration' },
  { route: 'troubleshooting', label: 'Troubleshooting' },
  { route: 'faq', label: 'FAQ' },
  { route: 'summary', label: 'Config Summary' },
]

export default function Sidebar({ route, navigate, sidebarOpen, setSidebarOpen, toggleTheme, theme }) {
  return (
    <>
      <aside
        className={`sidebar bg-bg-soft border-r border-line p-5 flex flex-col gap-5 sticky top-0 h-screen overflow-y-auto
          max-[980px]:fixed max-[980px]:left-0 max-[980px]:top-0 max-[980px]:h-screen max-[980px]:w-[260px] max-[980px]:z-110
          max-[980px]:transition-transform max-[980px]:duration-200
          ${sidebarOpen ? 'max-[980px]:translate-x-0' : 'max-[980px]:-translate-x-[105%]'}`}
      >
        <div className="brand flex items-center gap-2.5">
          <span className="brand-mark text-accent shrink-0" aria-hidden="true">
            <svg viewBox="0 0 32 32" width="28" height="28">
              <circle cx="16" cy="6" r="3" fill="currentColor"/>
              <circle cx="6" cy="26" r="3" fill="currentColor"/>
              <circle cx="26" cy="26" r="3" fill="currentColor"/>
              <path d="M16 9 L16 18 M16 18 L6 23 M16 18 L26 23" stroke="currentColor" strokeWidth="2" fill="none"/>
            </svg>
          </span>
          <div>
            <p className="brand-name font-bold text-sm m-0">NetPrint Console</p>
            <p className="brand-sub text-xs text-muted m-0">LAN printer provisioning guide</p>
          </div>
        </div>

        <nav className="nav flex flex-col gap-0.5" aria-label="Primary">
          {NAV_ITEMS.map(item => (
            <button
              key={item.route}
              className={`nav-item flex items-center gap-2.5 bg-transparent border-none text-muted text-left text-sm font-sans
                px-2.5 py-2 rounded-lg cursor-pointer transition-colors duration-150
                hover:bg-panel-2 hover:text-fg
                ${route === item.route ? '!bg-accent-dim !text-accent font-semibold' : ''}`}
              onClick={() => navigate(item.route)}
              data-route={item.route}
            >
              <span className="nav-dot w-[6px] h-[6px] rounded-full bg-current shrink-0 opacity-60"></span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-foot mt-auto flex flex-col gap-2">
          <button
            className="ghost-btn flex items-center gap-2 justify-start bg-panel border border-line text-fg px-3 py-2 rounded-lg cursor-pointer text-xs hover:border-accent"
            onClick={toggleTheme}
            type="button"
            aria-pressed={theme === 'light'}
            id="themeToggle"
          >
            <span aria-hidden="true">{theme === 'dark' ? '\uD83C\uDF19' : '\u2600\uFE0F'}</span>
            <span>{theme === 'dark' ? 'Dark mode' : 'Light mode'}</span>
          </button>
          <button
            className="ghost-btn flex items-center gap-2 justify-start bg-panel border border-line text-fg px-3 py-2 rounded-lg cursor-pointer text-xs hover:border-accent"
            onClick={() => window.print()}
            type="button"
            id="printBtn"
          >
            🖨 Print this page
          </button>
        </div>
      </aside>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-100 max-[980px]:block hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  )
}
