import { useEffect, useRef } from 'react'

function buildSearchIndex(container) {
  const index = []
  const blocks = container.querySelectorAll('h2, h3, li, summary, p')
  blocks.forEach(el => {
    const text = el.textContent.replace(/\s+/g, ' ').trim()
    if (text.length > 10) {
      routeTitle: 'Overview'
      index.push({ text, routeName: 'home', routeTitle: 'Overview', el })
    }
  })
  return index
}

export default function Home({ onNavigate, state, saveState, searchIndexRef }) {
  const ref = useRef(null)

  useEffect(() => {
    if (ref.current) {
      const index = buildSearchIndex(ref.current)
      const homeIndex = [
        { text: 'Get your thermal printers talking to your network in three topologies', routeName: 'home', routeTitle: 'Overview', el: ref.current.querySelector('h1') },
        { text: 'Identify your topology (direct / switch / router)', routeName: 'home', routeTitle: 'Overview', el: null },
        { text: 'Print a printer self‑test page to find its current IP', routeName: 'home', routeTitle: 'Overview', el: null },
        { text: 'Set a static IP, subnet mask, gateway and DNS on each printer', routeName: 'home', routeTitle: 'Overview', el: null },
        { text: 'Match the laptop\'s Ethernet adapter to the same subnet', routeName: 'home', routeTitle: 'Overview', el: null },
        { text: 'Add each printer to the ePOS Proxy app', routeName: 'home', routeTitle: 'Overview', el: null },
        { text: 'Verify every printer responds and prints a test job', routeName: 'home', routeTitle: 'Overview', el: null },
        { text: 'Many thermal printers ship with the same default static IP', routeName: 'home', routeTitle: 'Overview', el: null },
        { text: 'Keep one always‑on device connected to the same wired network', routeName: 'home', routeTitle: 'Overview', el: null },
      ]
      searchIndexRef.current = [...(searchIndexRef.current || []), ...homeIndex, ...index]
    }
  }, [])

  const handleChecklistChange = (key, index, checked) => {
    saveState(prev => {
      const values = [...((prev.checklists && prev.checklists[key]) || [])]
      values[index] = checked
      return {
        ...prev,
        checklists: { ...prev.checklists, [key]: values },
      }
    })
  }

  return (
    <section ref={ref} data-route="home">
      <div className="hero">
        <p className="eyebrow">Knowledge base · Receipt &amp; label printers</p>
        <h1 className="text-3xl font-bold mb-1">Get your thermal printers talking to your network — in three topologies.</h1>
        <p className="lede text-muted max-w-[640px]">
          This console turns the LAN printer configuration runbook into a guided, checkable, copy‑paste‑safe setup flow: direct connection, switch with no router, and full router-based deployments.
        </p>
        <div className="hero-actions flex gap-3 mt-4 flex-wrap">
          <button className="btn btn-primary" onClick={() => onNavigate('wizard')}>
            Start the setup wizard →
          </button>
        </div>
      </div>

      <div className="card-grid grid gap-4 my-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        <article
          className="topo-card bg-panel border border-line rounded-[10px] p-4 cursor-pointer transition-all duration-150 hover:border-accent hover:-translate-y-0.5 hover:shadow-lg text-inherit font-inherit text-left flex flex-col gap-3 min-h-full overflow-hidden"
          onClick={() => onNavigate('network', 'single')}
          role="button"
          tabIndex={0}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onNavigate('network', 'single') }}}
          aria-label="Open network setup for a single printer"
        >
          <h3 className="text-base font-semibold mt-0">① Single printer, no router</h3>
          <div className="diagram" aria-hidden="true">
            <div className="node">💻 Laptop</div>
            <div className="link"><span className="packet"></span></div>
            <div className="node">🖨 Printer</div>
          </div>
          <p className="text-muted text-xs m-0">One printer wired straight into your laptop with an Ethernet cable. Fastest path for a single till.</p>
        </article>

        <article
          className="topo-card bg-panel border border-line rounded-[10px] p-4 cursor-pointer transition-all duration-150 hover:border-accent hover:-translate-y-0.5 hover:shadow-lg text-inherit font-inherit text-left flex flex-col gap-3 min-h-full overflow-hidden"
          onClick={() => onNavigate('network', 'multi')}
          role="button"
          tabIndex={0}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onNavigate('network', 'multi') }}}
          aria-label="Open network setup for multiple printers with a switch"
        >
          <h3 className="text-base font-semibold mt-0">② Multiple printers, switch only</h3>
          <div className="diagram diagram-switch" aria-hidden="true">
            <div className="node">💻 Laptop</div>
            <div className="link"><span className="packet"></span></div>
            <div className="node">🔀 Switch</div>
            <div className="fanout">
              <div className="link short"><span className="packet"></span></div>
              <div className="link short"><span className="packet"></span></div>
              <div className="link short"><span className="packet"></span></div>
            </div>
            <div className="node-stack">
              <div className="node small">🖨 P1</div>
              <div className="node small">🖨 P2</div>
              <div className="node small">🖨 P3</div>
            </div>
          </div>
          <p className="text-muted text-xs m-0">No router on site — laptop and printers share a fixed-IP subnet through a gigabit switch.</p>
        </article>

        <article
          className="topo-card bg-panel border border-line rounded-[10px] p-4 cursor-pointer transition-all duration-150 hover:border-accent hover:-translate-y-0.5 hover:shadow-lg text-inherit font-inherit text-left flex flex-col gap-3 min-h-full overflow-hidden"
          onClick={() => onNavigate('router')}
          role="button"
          tabIndex={0}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onNavigate('router') }}}
          aria-label="Open router-based network setup"
        >
          <h3 className="text-base font-semibold mt-0">③ Router-based network</h3>
          <div className="diagram" aria-hidden="true">
            <div className="node">💻 Laptop</div>
            <div className="link"><span className="packet"></span></div>
            <div className="node">📡 Router</div>
            <div className="link"><span className="packet"></span></div>
            <div className="node">🖨 Printer</div>
          </div>
          <p className="text-muted text-xs m-0">Printers join the existing office Wi‑Fi router/LAN, with IPs reserved so they never drift.</p>
        </article>
      </div>

      <div className="overview-grid grid gap-4 items-start" style={{ gridTemplateColumns: '1.2fr 1fr' }}>
        <div className="panel">
          <h2 className="mt-0">What you&apos;ll configure</h2>
          <ul className="check-list" data-checklist="overview">
            {['Identify your topology (direct / switch / router)', 'Print a printer self‑test page to find its current IP', 'Set a static IP, subnet mask, gateway and DNS on each printer', 'Match the laptop\'s Ethernet adapter to the same subnet', 'Add each printer to the ePOS Proxy app', 'Verify every printer responds and prints a test job'].map((label, i) => (
              <li key={i}>
                <label>
                  <input
                    type="checkbox"
                    checked={!!((state.checklists && state.checklists['overview'] && state.checklists['overview'][i]))}
                    onChange={e => handleChecklistChange('overview', i, e.target.checked)}
                  />
                  {label}
                </label>
              </li>
            ))}
          </ul>
          <p className="hint text-muted text-xs">Progress saves automatically in this browser.</p>
        </div>
        <div className="panel warning-card">
          <h2 className="text-warn">⚠ Before you start</h2>
          <p>Many thermal printers ship with the <strong>same default static IP</strong>. If you connect several at once before configuring them, you will get IP conflicts. Always configure printers <strong>one at a time</strong>, disconnected from each other, before joining them to the shared switch or router.</p>
          <p>Keep one always‑on device (this laptop, or any PC) connected to the same wired network as the printers — some setups drop an idle printer from the network until traffic resumes.</p>
        </div>
      </div>
    </section>
  )
}
