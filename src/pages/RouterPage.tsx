import { useState } from 'react'
import { useStore } from '../store'
import { isValidIp, calcIp } from '../utils/ip'

export default function RouterPage() {
  const router = useStore(s => s.router)
  const updateRouter = useStore(s => s.updateRouter)
  const addLog = useStore(s => s.addLog)

  const [form, setForm] = useState({ ...router })
  const ipInfo = calcIp(form.lanIp, form.subnetMask)
  const valid = isValidIp(form.lanIp) && isValidIp(form.subnetMask)

  function handleSave() {
    updateRouter(form)
    addLog('Router configuration updated', 'info')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Router Configuration</h1>
        <p className="text-muted text-sm">Configure your LAN router settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-panel border border-line rounded-lg p-5 space-y-4">
          <h2 className="text-lg font-semibold mt-0">Settings</h2>
          {[
            { label: 'Router Name', key: 'name', type: 'text' },
            { label: 'LAN IP', key: 'lanIp', type: 'text' },
            { label: 'Subnet Mask', key: 'subnetMask', type: 'text' },
            { label: 'Gateway', key: 'gateway', type: 'text' },
            { label: 'DNS Server', key: 'dnsServer', type: 'text' },
          ].map(field => (
            <div key={field.key}>
              <label className="block text-muted text-xs mb-1">{field.label}</label>
              <input
                type={field.type}
                className="w-full bg-bg-soft border border-line rounded-md px-3 py-2 text-sm text-fg font-mono focus:outline-none focus:border-accent"
                value={(form as any)[field.key]}
                onChange={e => {
                  const v = e.target.value
                  if (field.key === 'name') setForm(f => ({ ...f, name: v }))
                  else if (isValidIp(v) || v === '' || /^[\d.]*$/.test(v)) {
                    setForm(f => ({ ...f, [field.key]: v }))
                  }
                }}
              />
              {(field.key === 'lanIp' || field.key === 'subnetMask') && (form as any)[field.key] && !isValidIp((form as any)[field.key]) && (
                <p className="text-danger text-xs mt-1">Invalid IP address</p>
              )}
            </div>
          ))}

          <div className="flex items-center gap-3">
            <label className="text-muted text-sm">DHCP Enabled</label>
            <button
              className={`relative w-10 h-5 rounded-full transition-colors ${form.dhcpEnabled ? 'bg-accent' : 'bg-panel-2'} border border-line cursor-pointer`}
              onClick={() => setForm(f => ({ ...f, dhcpEnabled: !f.dhcpEnabled }))}
            >
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${form.dhcpEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>

          {form.dhcpEnabled && (
            <>
              {[
                { label: 'DHCP Range Start', key: 'dhcpRangeStart' },
                { label: 'DHCP Range End', key: 'dhcpRangeEnd' },
              ].map(field => (
                <div key={field.key}>
                  <label className="block text-muted text-xs mb-1">{field.label}</label>
                  <input
                    type="text"
                    className="w-full bg-bg-soft border border-line rounded-md px-3 py-2 text-sm text-fg font-mono focus:outline-none focus:border-accent"
                    value={(form as any)[field.key]}
                    onChange={e => {
                      const v = e.target.value
                      if (isValidIp(v) || v === '' || /^[\d.]*$/.test(v)) {
                        setForm(f => ({ ...f, [field.key]: v }))
                      }
                    }}
                  />
                </div>
              ))}
              <div>
                <label className="block text-muted text-xs mb-1">Lease Time (minutes)</label>
                <input
                  type="number"
                  className="w-full bg-bg-soft border border-line rounded-md px-3 py-2 text-sm text-fg focus:outline-none focus:border-accent"
                  value={form.leaseTime}
                  onChange={e => setForm(f => ({ ...f, leaseTime: Math.max(1, parseInt(e.target.value) || 1) }))}
                />
              </div>
            </>
          )}

          <button onClick={handleSave} className="btn btn-primary w-full">
            Save Configuration
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-panel border border-line rounded-lg p-5">
            <h2 className="text-lg font-semibold mt-0">Subnet Calculator</h2>
            {valid ? (
              <div className="space-y-2 text-sm">
                {[
                  ['Network Address', ipInfo.networkAddress],
                  ['Broadcast Address', ipInfo.broadcastAddress],
                  ['CIDR Notation', `/${ipInfo.cidr}`],
                  ['First Usable IP', ipInfo.firstHost],
                  ['Last Usable IP', ipInfo.lastHost],
                  ['Total Hosts', ipInfo.totalHosts],
                  ['Usable Hosts', ipInfo.usableHosts],
                ].map(([l, v]) => (
                  <div key={l as string} className="flex items-center gap-3 py-1">
                    <span className="text-muted w-36 shrink-0 text-xs">{l as string}</span>
                    <span className="font-mono text-xs">{String(v)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-danger text-sm">Enter valid IP and subnet mask</p>
            )}
          </div>

          <div className="bg-panel border border-line rounded-lg p-5">
            <h2 className="text-lg font-semibold mt-0">Binary Representation</h2>
            {valid ? (
              <div className="space-y-2 text-xs font-mono">
                <div><span className="text-muted block text-[10px]">IP</span> {ipInfo.binaryIp}</div>
                <div><span className="text-muted block text-[10px]">Subnet</span> {ipInfo.binarySubnet}</div>
                <div><span className="text-muted block text-[10px]">Network</span> {ipInfo.binaryNetwork}</div>
                <div><span className="text-muted block text-[10px]">Broadcast</span> {ipInfo.binaryBroadcast}</div>
              </div>
            ) : (
              <p className="text-danger text-sm">Enter valid IP and subnet mask</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
