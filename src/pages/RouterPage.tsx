import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../store'
import { isValidIp, calcIp } from '../utils/ip'

export default function RouterPage() {
  const router = useStore(s => s.router)
  const devices = useStore(s => s.devices)
  const updateRouter = useStore(s => s.updateRouter)
  const addLog = useStore(s => s.addLog)
  const simulateAction = useStore(s => s.simulateAction)

  const [form, setForm] = useState({ ...router })
  const [saving, setSaving] = useState(false)

  const ipInfo = useMemo(() => calcIp(form.lanIp, form.subnetMask), [form.lanIp, form.subnetMask])
  const valid = isValidIp(form.lanIp) && isValidIp(form.subnetMask)

  const onlineDevices = devices.filter(d => d.online).length

  function handleSave() {
    setSaving(true)
    updateRouter(form)
    addLog('Router configuration updated', 'info')
    setTimeout(() => setSaving(false), 300)
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1>Router Configuration</h1>
          <p>Configure your LAN router settings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 panel space-y-5"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold mt-0">Settings</h2>
            <span className="badge badge-accent">
              <span className={`status-dot ${router.dhcpEnabled ? 'online' : 'offline'}`} />
              {router.dhcpEnabled ? 'DHCP Enabled' : 'DHCP Disabled'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Router Name', key: 'name', type: 'text' },
              { label: 'LAN IP', key: 'lanIp', type: 'text' },
              { label: 'Subnet Mask', key: 'subnetMask', type: 'text' },
              { label: 'Gateway', key: 'gateway', type: 'text' },
              { label: 'DNS Server', key: 'dnsServer', type: 'text' },
            ].map(field => (
              <div key={field.key}>
                <label className="block text-muted text-xs mb-1.5">{field.label}</label>
                <input
                  type={field.type}
                  className="input-field"
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
          </div>

          <div className="flex items-center justify-between rounded-xl border border-line/60 bg-panel-2/40 px-5 py-3.5">
            <div>
              <h4 className="font-medium text-sm">DHCP Server</h4>
              <p className="text-xs text-muted">Enable automatic IP assignment</p>
            </div>
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, dhcpEnabled: !f.dhcpEnabled }))}
              className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-200 cursor-pointer
                ${form.dhcpEnabled
                  ? 'bg-accent-dim text-accent border border-accent/40'
                  : 'bg-danger-dim text-danger border border-danger/40'
                }`}
            >
              <span className={`h-2.5 w-2.5 rounded-full ${form.dhcpEnabled ? 'bg-accent' : 'bg-danger'}`} />
              {form.dhcpEnabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          {form.dhcpEnabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              {[
                { label: 'DHCP Range Start', key: 'dhcpRangeStart' },
                { label: 'DHCP Range End', key: 'dhcpRangeEnd' },
                { label: 'Lease Time (minutes)', key: 'leaseTime', type: 'number' },
              ].map(field => (
                <div key={field.key}>
                  <label className="block text-muted text-xs mb-1.5">{field.label}</label>
                  {field.type === 'number' ? (
                    <input
                      type="number"
                      className="input-field"
                      value={form.leaseTime}
                      onChange={e => setForm(f => ({ ...f, leaseTime: Math.max(1, parseInt(e.target.value) || 1) }))}
                    />
                  ) : (
                    <input
                      type="text"
                      className="input-field"
                      value={(form as any)[field.key]}
                      onChange={e => {
                        const v = e.target.value
                        if (isValidIp(v) || v === '' || /^[\d.]*$/.test(v)) {
                          setForm(f => ({ ...f, [field.key]: v }))
                        }
                      }}
                    />
                  )}
                </div>
              ))}
            </motion.div>
          )}

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            className="btn btn-primary w-full"
          >
            {saving ? 'Saving...' : 'Save Configuration'}
          </motion.button>
        </motion.div>

        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="panel"
          >
            <h2 className="text-base font-semibold mt-0 mb-4">Router Status</h2>
            <div className="flex flex-col items-center gap-3 mb-4">
              <div className={`w-16 h-16 rounded-2xl bg-accent-dim/60 border-2 border-accent/40 flex items-center justify-center ${router.dhcpEnabled ? 'pulse-glow' : ''}`}>
                <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.858 15.355-5.858 21.213 0" />
                </svg>
              </div>
              <p className="font-semibold text-sm">{router.name}</p>
              <div className="flex gap-2 text-xs">
                <span className="badge badge-accent">
                  <span className="status-dot online" />
                  {onlineDevices} connected
                </span>
                <span className="badge badge-muted">{router.lanIp}</span>
              </div>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted">Uptime</span>
                <span className="font-mono">{Math.floor(Math.random() * 24)}h {Math.floor(Math.random() * 60)}m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">CPU</span>
                <span className="font-mono">{Math.floor(Math.random() * 30 + 10)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Memory</span>
                <span className="font-mono">{Math.floor(Math.random() * 40 + 30)}%</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="panel"
          >
            <h2 className="text-base font-semibold mt-0 mb-3">Actions</h2>
            <div className="flex flex-col gap-2">
              <button onClick={() => simulateAction('restart-router')} className="btn btn-ghost text-xs w-full justify-center">
                Restart Router
              </button>
            </div>
          </motion.div>

          {valid && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="panel"
            >
              <h2 className="text-base font-semibold mt-0 mb-3">Subnet</h2>
              <div className="space-y-1.5 text-xs">
                {[
                  ['Network', ipInfo.networkAddress],
                  ['Broadcast', ipInfo.broadcastAddress],
                  ['CIDR', `/${ipInfo.cidr}`],
                  ['Usable', ipInfo.usableHosts],
                ].map(([l, v]) => (
                  <div key={l as string} className="flex items-center gap-3 py-0.5">
                    <span className="text-muted w-20 shrink-0">{l as string}</span>
                    <code className="text-xs">{String(v)}</code>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
