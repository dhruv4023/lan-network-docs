export default function Summary({ state }) {
  const lists = [
    { key: 'overview', label: 'Setup overview' },
    { key: 'verify', label: 'Network verification' },
  ]

  function getProgress(key) {
    const items = (state.checklists && state.checklists[key]) || []
    const total = items.length
    const done = items.filter(Boolean).length
    const pct = total ? Math.round((done / total) * 100) : 0
    return { total, done, pct }
  }

  return (
    <section data-route="summary">
      <h1>Configuration Summary</h1>
      <p className="lede text-muted max-w-[640px]">
        A consolidated reference of every IP plan and parameter set in this guide.
      </p>

      <div className="panel">
        <h2>Direct connection (single printer)</h2>
        <div className="kv-row">
          <span>Printer IP (example)</span><code data-copy="192.168.192.168">192.168.192.168</code>
          <span>Laptop manual IP</span><code data-copy="192.168.192.169">192.168.192.169</code>
          <span>Subnet mask</span><code data-copy="255.255.255.0">255.255.255.0</code>
          <span>Gateway</span><code data-copy="192.168.192.1">192.168.192.1</code>
          <span>DNS</span><code data-copy="8.8.8.8">8.8.8.8</code>
        </div>
      </div>

      <div className="panel">
        <h2>Switch only (multiple printers, no router)</h2>
        <div className="kv-row">
          <span>Laptop</span><code data-copy="192.168.1.10">192.168.1.10</code>
          <span>Printer 1</span><code data-copy="192.168.1.11">192.168.1.11</code>
          <span>Printer 2</span><code data-copy="192.168.1.12">192.168.1.12</code>
          <span>Printer 3</span><code data-copy="192.168.1.13">192.168.1.13</code>
          <span>Subnet mask</span><code data-copy="255.255.255.0">255.255.255.0</code>
          <span>Gateway</span><code data-copy="192.168.1.10">192.168.1.10</code>
          <span>DNS</span><code data-copy="8.8.8.8">8.8.8.8</code>
        </div>
      </div>

      <div className="panel">
        <h2>Router-based network</h2>
        <div className="kv-row">
          <span>Laptop</span><code data-copy="192.168.1.10">192.168.1.10</code>
          <span>Printer 1</span><code data-copy="192.168.1.11">192.168.1.11</code>
          <span>Printer 2</span><code data-copy="192.168.1.12">192.168.1.12</code>
          <span>Printer 3</span><code data-copy="192.168.1.13">192.168.1.13</code>
          <span>Subnet mask</span><code data-copy="255.255.255.0">255.255.255.0</code>
          <span>Gateway</span><code data-copy="192.168.1.1">192.168.1.1</code>
          <span>DNS</span><code data-copy="8.8.8.8">8.8.8.8</code>
        </div>
      </div>

      <div className="panel">
        <h2>Your checklist progress</h2>
        <div className="summary-progress">
          {lists.map(({ key, label }) => {
            const { total, done, pct } = getProgress(key)
            if (!total) return null
            return (
              <div key={key} className="summary-bar-row">
                <span className="label">{label}</span>
                <div className="summary-bar-track">
                  <div className="summary-bar-fill" style={{ width: pct + '%' }}></div>
                </div>
                <span>{done}/{total}</span>
              </div>
            )
          })}
          {!lists.some(({ key }) => (state.checklists && state.checklists[key] && state.checklists[key].length)) && (
            <p className="text-muted text-sm">No checklists completed yet.</p>
          )}
        </div>
      </div>
    </section>
  )
}
