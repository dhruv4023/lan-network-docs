import { useState, useEffect, useCallback } from 'react'

function isValidIPv4(value) {
  const parts = value.trim().split('.')
  if (parts.length !== 4) return false
  return parts.every(p => /^\d{1,3}$/.test(p) && Number(p) >= 0 && Number(p) <= 255)
}

function IPTable({ rows: defaultRows }) {
  const [rows, setRows] = useState(defaultRows)

  const updateIP = (index, value) => {
    setRows(prev => prev.map((r, i) => i === index ? { ...r, ip: value } : r))
  }

  const seen = {}
  rows.forEach(r => {
    const v = r.ip.trim()
    seen[v] = (seen[v] || 0) + 1
  })

  function handleCopy(text, btn) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => flashCopied(btn)).catch(() => fallbackCopy(text, btn))
    } else {
      fallbackCopy(text, flashCopied.bind(null, btn))
    }
  }

  function flashCopied(btn) {
    const orig = btn.textContent
    btn.textContent = 'Copied!'
    setTimeout(() => { btn.textContent = orig }, 1200)
  }

  function fallbackCopy(text, done) {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    try { document.execCommand('copy') } catch {}
    document.body.removeChild(ta)
    done()
  }

  return (
    <table className="ip-table">
      <thead>
        <tr><th>Device</th><th>IP address</th><th></th></tr>
      </thead>
      <tbody>
        {rows.map((row, i) => {
          const v = row.ip.trim()
          const valid = isValidIPv4(v)
          const duplicate = valid && seen[v] > 1
          return (
            <tr key={i}>
              <td>{row.device}</td>
              <td>
                <input
                  className={`ip-input ${!valid ? 'is-invalid' : ''} ${duplicate ? 'is-duplicate' : ''}`}
                  value={row.ip}
                  onChange={e => updateIP(i, e.target.value)}
                  data-validate="ip"
                />
              </td>
              <td>
                <button className="copy-btn" onClick={e => handleCopy(row.ip, e.target)}>Copy</button>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

export default function NetworkSetup({ state, saveState }) {
  const [tab, setTab] = useState((state.routeTabs && state.routeTabs.network) || 'single')

  useEffect(() => {
    saveState(prev => ({
      ...prev,
      routeTabs: { ...prev.routeTabs, network: tab },
    }))
  }, [tab])

  return (
    <section data-route="network">
      <h1>Without router</h1>
      <p className="lede text-muted max-w-[640px]">
        Choose the physical layout that matches your store, then mirror the IP plan below.
      </p>

      <div className="tabs">
        <button
          className={`tab ${tab === 'single' ? 'is-active' : ''}`}
          onClick={() => setTab('single')}
          data-tab="single"
        >
          Single printer, direct
        </button>
        <button
          className={`tab ${tab === 'multi' ? 'is-active' : ''}`}
          onClick={() => setTab('multi')}
          data-tab="multi"
        >
          Multiple printers, switch only
        </button>
      </div>

      {tab === 'single' && (
        <div className="tab-panel is-active" data-tabpanel="single">
          <div className="panel">
            <h2>Connect a single printer directly to your laptop</h2>
            <div className="diagram diagram-lg" aria-hidden="true">
              <div className="node">💻 Laptop</div>
              <div className="link"><span className="packet"></span><em>Ethernet</em></div>
              <div className="node">🖨 Printer</div>
            </div>
            <ol className="steps">
              <li>Connect the printer directly to your laptop using an Ethernet cable.</li>
              <li>
                Determine the printer&apos;s current IP address — it may print a receipt containing the IP automatically.
                <div className="callout">
                  <strong>No receipt printed?</strong> Run a self‑test:
                  <ol className="steps nested">
                    <li>Turn the printer off.</li>
                    <li>Press and hold the <kbd>FEED</kbd> button.</li>
                    <li>Turn the printer on while still holding <kbd>FEED</kbd>.</li>
                    <li>Release once the self‑test page prints — it lists the printer&apos;s IP, subnet and gateway.</li>
                  </ol>
                </div>
              </li>
              <li>
                Open a browser and enter the printer&apos;s IP address. Example:
                <div className="kv-row">
                  <span>IP address</span><code data-copy="192.168.192.168">192.168.192.168</code>
                  <span>Subnet</span><code data-copy="255.255.255.0">255.255.255.0</code>
                  <span>Gateway</span><code data-copy="192.168.192.168">192.168.192.168</code>
                </div>
              </li>
              <li>If the configuration page opens, skip to step 6.</li>
              <li>
                If it does <strong>not</strong> open, set a manual IP on your laptop&apos;s Ethernet adapter:
                <div className="config-table">
                  <div className="config-row"><span>IP address</span><code data-copy="192.168.192.169">192.168.192.169</code></div>
                  <div className="config-row"><span>Subnet mask</span><code data-copy="255.255.255.0">255.255.255.0</code></div>
                  <div className="config-row"><span>Default gateway</span><code data-copy="192.168.192.1">192.168.192.1</code></div>
                  <div className="config-row"><span>Preferred DNS</span><code data-copy="8.8.8.8">8.8.8.8</code></div>
                </div>
                <p className="hint mt-2">Path: Network &amp; Internet Settings → Ethernet → adapter properties → IPv4.</p>
              </li>
              <li>The printer configuration page should now open.</li>
              <li>In the ePOS Proxy app, click <strong>+ Add Network Printer</strong>, enter the printer IP, and click <strong>Add</strong>.</li>
            </ol>
          </div>
        </div>
      )}

      {tab === 'multi' && (
        <div className="tab-panel is-active" data-tabpanel="multi">
          <div className="panel">
            <h2>Multiple printers via a switch — no router</h2>
            <p className="text-muted text-sm">For stores with several printers and no router: every device gets a fixed IP on the same subnet, connected through an unmanaged switch.</p>
            <div className="diagram diagram-lg" aria-hidden="true">
              <div className="node">💻 Laptop</div>
              <div className="link"><span className="packet"></span></div>
              <div className="node">🔀 8‑port switch</div>
              <div className="fanout">
                <div className="link short"><span className="packet"></span></div>
                <div className="link short"><span className="packet"></span></div>
                <div className="link short"><span className="packet"></span></div>
              </div>
              <div className="node-stack">
                <div className="node small">🖨 Printer 1</div>
                <div className="node small">🖨 Printer 2</div>
                <div className="node small">🖨 Printer 3</div>
              </div>
            </div>

            <h3 className="text-lg font-semibold mt-4 mb-2">IP assignment plan</h3>
            <IPTable rows={[
              { device: 'Laptop', ip: '192.168.1.10' },
              { device: 'Printer 1', ip: '192.168.1.11' },
              { device: 'Printer 2', ip: '192.168.1.12' },
              { device: 'Printer 3', ip: '192.168.1.13' },
            ]} />
            <p className="hint text-muted text-xs">Edit any address — duplicates and malformed IPs are flagged instantly.</p>

            <h3 className="text-lg font-semibold mt-4 mb-2">Primary network parameters</h3>
            <div className="kv-row">
              <span>Subnet mask</span><code data-copy="255.255.255.0">255.255.255.0</code>
              <span>Default gateway</span><code data-copy="192.168.1.10">192.168.1.10</code>
              <span>DNS server</span><code data-copy="8.8.8.8">8.8.8.8</code>
            </div>

            <div className="callout callout-warn">
              <strong>Configure printers one at a time.</strong> Many printers ship with the same default static IP. Connect only one printer at a time directly to the laptop, assign its unique static IP, disable DHCP if needed, then disconnect it and repeat for the next printer — <em>before</em> wiring everything to the switch.
            </div>

            <ol className="steps">
              <li>Connect the laptop to the network switch.</li>
              <li>Connect all (already‑configured) printers to the same switch.</li>
              <li>Power on the switch and all printers.</li>
              <li>Set the laptop&apos;s Ethernet adapter to a static IP matching the plan above (e.g. 192.168.1.10 / 255.255.255.0, gateway 192.168.1.1, DNS 8.8.8.8).</li>
              <li>In ePOS Proxy, add each printer: <strong>+ Add Network Printer</strong> → enter its IP → <strong>Add</strong>.</li>
            </ol>
          </div>
        </div>
      )}
    </section>
  )
}
