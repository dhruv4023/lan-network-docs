function isValidIPv4(value) {
  const parts = value.trim().split('.')
  if (parts.length !== 4) return false
  return parts.every(p => /^\d{1,3}$/.test(p) && Number(p) >= 0 && Number(p) <= 255)
}

import { useState } from 'react'

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

export default function RouterConfig() {
  return (
    <section data-route="router">
      <h1>Router Configuration</h1>
      <p className="lede text-muted max-w-[640px]">
        Use this when printers join the same router/LAN as the laptop — typical for an existing office or shop network.
      </p>

      <div className="panel">
        <div className="diagram diagram-lg" aria-hidden="true">
          <div className="node">💻 Laptop<br /><small>192.168.1.10</small></div>
          <div className="link"><span className="packet"></span><em>Ethernet</em></div>
          <div className="node">📡 Router<br /><small>Gateway 192.168.1.1</small></div>
          <div className="link"><span className="packet"></span><em>Ethernet</em></div>
          <div className="node">🖨 Printer<br /><small>192.168.1.100</small></div>
        </div>

        <h2>IP assignment example</h2>
        <IPTable rows={[
          { device: 'Laptop', ip: '192.168.1.10' },
          { device: 'Printer 1', ip: '192.168.1.11' },
          { device: 'Printer 2', ip: '192.168.1.12' },
          { device: 'Printer 3', ip: '192.168.1.13' },
        ]} />

        <h2>Primary network parameters</h2>
        <div className="kv-row">
          <span>Subnet mask</span><code data-copy="255.255.255.0">255.255.255.0</code>
          <span>Default gateway</span><code data-copy="192.168.1.1">192.168.1.1</code>
          <span>DNS server</span><code data-copy="8.8.8.8">8.8.8.8</code>
        </div>

        <div className="callout">
          <strong>Important:</strong> reserve a fixed IP for each printer within the router&apos;s range (e.g. 192.168.1.1–192.168.1.255) so they always come back to the same address.
        </div>

        <h2>DHCP reservation vs. static IP</h2>
        <div className="compare-grid">
          <div className="compare-card">
            <h3>DHCP reservation</h3>
            <p>On the printer&apos;s self‑test page, check if DHCP is enabled. If it is, reserve a fixed IP for that printer&apos;s MAC address inside the router&apos;s settings — no printer‑side changes needed.</p>
          </div>
          <div className="compare-card">
            <h3>Static IP on the printer</h3>
            <p>If DHCP is disabled or unsupported, open the printer&apos;s network settings page directly and assign the IP, subnet, gateway and DNS by hand.</p>
          </div>
        </div>

        <h2>Configure printers one at a time</h2>
        <ol className="steps">
          <li>Connect only one printer directly to the laptop via Ethernet (no router or switch yet).</li>
          <li>Print a self‑test page and note the IP and whether DHCP is enabled.</li>
          <li>DHCP enabled → reserve its IP in the router and move to the next printer. DHCP disabled → continue below.</li>
          <li>
            Open a browser to the printer&apos;s IP and go to its Network Settings page.
            <div className="callout">
              If the page won&apos;t open, set a manual IP on the laptop first:
              <div className="kv-row">
                <span>IP</span><code data-copy="192.168.192.169">192.168.192.169</code>
                <span>Subnet</span><code data-copy="255.255.255.0">255.255.255.0</code>
                <span>Gateway</span><code data-copy="192.168.192.1">192.168.192.1</code>
                <span>DNS</span><code data-copy="8.8.8.8">8.8.8.8</code>
              </div>
            </div>
          </li>
          <li>Assign a unique static IP (e.g. 192.168.1.11), subnet 255.255.255.0, gateway 192.168.1.1, DNS 8.8.8.8. Save, restart if required, then disconnect and repeat for the next printer.</li>
        </ol>

        <h2>Connect the hardware</h2>
        <ol className="steps">
          <li>Connect the laptop to the router.</li>
          <li>Connect all configured printers to the same router.</li>
          <li>Power on the router and all printers.</li>
          <li>Not enough ports on the router? Add a network switch between the router and the printers.</li>
        </ol>

        <div className="callout callout-warn">
          <strong>Keep the link alive.</strong> Leave an always‑on wired device on the same network as the printer. Some setups make idle printers unreachable after a short period without an active device present.
        </div>
      </div>
    </section>
  )
}
