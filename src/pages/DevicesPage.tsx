import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store'
import { isValidIp, generateMac } from '../utils/ip'
import type { Device, DeviceType, ConnectionType } from '../types'

const DEVICE_TYPES: { value: DeviceType; label: string; desc: string }[] = [
  { value: 'printer', label: 'Printer', desc: 'Thermal / Laser / Inkjet' },
  { value: 'laptop', label: 'Laptop', desc: 'Portable workstation' },
  { value: 'desktop', label: 'Desktop', desc: 'Desktop computer' },
  { value: 'switch', label: 'Switch', desc: 'Network switch' },
  { value: 'access-point', label: 'Access Point', desc: 'Wireless AP' },
]

const TYPE_SVGS: Record<string, string> = {
  printer: 'M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z',
  laptop: 'M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11a3.001 3.001 0 00-2.83 2',
  desktop: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  switch: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01',
  'access-point': 'M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.858 15.355-5.858 21.213 0',
}

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function DeviceCard({ d, onEdit, onRemove, onToggle }: { d: Device; onEdit: () => void; onRemove: () => void; onToggle: () => void }) {
  const devices = useStore(s => s.devices)
  const conflict = devices.some(x => x.id !== d.id && x.ip === d.ip)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`glass-card relative overflow-hidden ${conflict ? 'border-danger/40' : ''}`}
    >
      <div className={`absolute top-0 left-0 w-full h-[2px] ${d.online ? 'bg-accent' : 'bg-danger'}`} />
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${d.online ? 'bg-accent-dim/60' : 'bg-danger-dim/60'}`}>
          <svg className={`w-5 h-5 ${d.online ? 'text-accent' : 'text-danger'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d={TYPE_SVGS[d.type] || TYPE_SVGS.laptop} />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-sm truncate">{d.name}</p>
            {conflict && <span className="badge badge-danger text-[10px] px-1.5 py-0">IP Conflict</span>}
          </div>
          <p className="text-muted text-[11px] capitalize">{d.type.replace('-', ' ')}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <code className="text-[10px] px-1.5 py-0.5 rounded bg-panel-2/60 border border-line/40">{d.ip}</code>
            <span className={`badge text-[10px] px-1.5 py-0 ${d.ipMode === 'dhcp' ? 'badge-accent' : 'badge-muted'}`}>
              {d.ipMode.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <button onClick={onToggle} className={`text-[10px] px-2 py-1 rounded-lg border cursor-pointer transition-colors ${d.online ? 'badge-accent' : 'badge-danger'}`}>
              <span className={`status-dot ${d.online ? 'online' : 'offline'} mr-1 align-middle`} />
              {d.online ? 'Online' : 'Offline'}
            </button>
            <button onClick={onEdit} className="text-[10px] px-2 py-1 rounded-lg border border-line/60 text-muted cursor-pointer hover:border-accent hover:text-accent transition-colors">
              Edit
            </button>
            <button onClick={onRemove} className="text-[10px] px-2 py-1 rounded-lg border border-danger/30 text-danger cursor-pointer hover:bg-danger/10 transition-colors">
              Delete
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function DevicesPage() {
  const devices = useStore(s => s.devices)
  const addDevice = useStore(s => s.addDevice)
  const removeDevice = useStore(s => s.removeDevice)
  const updateDevice = useStore(s => s.updateDevice)
  const toggleDeviceStatus = useStore(s => s.toggleDeviceStatus)
  const router = useStore(s => s.router)
  const assignNextIp = useStore(s => s.assignNextIp)
  const assignDhcpIpAndUpdate = useStore(s => s.assignDhcpIpAndUpdate)
  const addLog = useStore(s => s.addLog)

  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')

  const [form, setForm] = useState<Partial<Device>>({
    name: '', type: 'printer', mac: generateMac(),
    connectionType: 'ethernet', ipMode: 'dhcp', ip: '',
    gateway: router.gateway, subnet: router.subnetMask, online: true,
  })

  const [errors, setErrors] = useState<string[]>([])

  const filtered = filter === 'all' ? devices : devices.filter(d => d.type === filter)

  function resetForm() {
    setForm({
      name: '', type: 'printer', mac: generateMac(),
      connectionType: 'ethernet', ipMode: 'dhcp', ip: '',
      gateway: router.gateway, subnet: router.subnetMask, online: true,
    })
    setErrors([])
    setEditing(null)
  }

  function openEdit(d: Device) {
    setForm({ ...d })
    setEditing(d.id)
    setErrors([])
    setShowModal(true)
  }

  function validate(): boolean {
    const errs: string[] = []
    if (!form.name?.trim()) errs.push('Device name is required')
    if (form.ipMode === 'static') {
      if (!form.ip || !isValidIp(form.ip)) errs.push('Invalid static IP')
      else {
        const dup = devices.find(d => d.id !== editing && d.ip === form.ip)
        if (dup) errs.push(`IP ${form.ip} used by ${dup.name}`)
        if (form.ip === router.lanIp) errs.push('Cannot use router LAN IP')
        if (form.ip === router.gateway) errs.push('Cannot use gateway IP')
        if (form.ip === '255.255.255.255') errs.push('Cannot use broadcast address')
      }
    }
    if (form.gateway && !isValidIp(form.gateway)) errs.push('Invalid gateway')
    if (form.subnet && !isValidIp(form.subnet)) errs.push('Invalid subnet mask')
    setErrors(errs)
    return errs.length === 0
  }

  function handleSave() {
    if (!validate()) return
    const ip = form.ipMode === 'dhcp'
      ? form.ip || assignDhcpIpAndUpdate(editing || 'new') || ''
      : form.ip || ''

    const device: Device = {
      id: editing || uid(),
      name: form.name || '',
      type: form.type as DeviceType || 'printer',
      mac: form.mac || generateMac(),
      connectionType: (form.connectionType as ConnectionType) || 'ethernet',
      ipMode: form.ipMode as 'dhcp' | 'static' || 'dhcp',
      ip,
      gateway: form.gateway || router.gateway,
      subnet: form.subnet || router.subnetMask,
      status: form.online ? 'online' : 'offline',
      online: form.online ?? true,
      firmware: form.type === 'printer' ? 'v2.1.4' : undefined,
    }

    if (editing) {
      updateDevice(editing, device)
      addLog(`Device "${device.name}" updated`, 'info')
    } else {
      addDevice(device)
    }
    setShowModal(false)
    resetForm()
  }

  const FILTERS = ['all', 'printer', 'laptop', 'desktop', 'switch', 'access-point']

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1>Devices</h1>
          <p>{devices.length} device{devices.length !== 1 ? 's' : ''} on network</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="tabs mb-0 border-b-0">
            {FILTERS.map(f => (
              <button
                key={f}
                className={`tab !text-[11px] !px-2.5 !py-1.5 ${filter === f ? 'is-active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'All' : f.replace('-', ' ')}
              </button>
            ))}
          </div>
          <button onClick={() => { resetForm(); setShowModal(true) }} className="btn btn-primary text-sm">
            + Add Device
          </button>
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="panel flex flex-col items-center justify-center py-12 text-muted"
          >
            <svg className="w-12 h-12 mb-3 text-muted/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p className="text-sm">No devices found</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(d => (
              <DeviceCard
                key={d.id}
                d={d}
                onEdit={() => openEdit(d)}
                onRemove={() => removeDevice(d.id)}
                onToggle={() => toggleDeviceStatus(d.id)}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="modal-content"
              onClick={e => e.stopPropagation()}
            >
              <h2>{editing ? 'Edit Device' : 'Add Device'}</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-muted text-xs mb-1.5">Device Name</label>
                  <input
                    type="text"
                    className="input-field"
                    value={form.name || ''}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Kitchen Printer"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-muted text-xs mb-1.5">Device Type</label>
                    <select
                      className="select-field"
                      value={form.type}
                      onChange={e => setForm(f => ({ ...f, type: e.target.value as DeviceType }))}
                    >
                      {DEVICE_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-muted text-xs mb-1.5">Connection</label>
                    <select
                      className="select-field"
                      value={form.connectionType}
                      onChange={e => setForm(f => ({ ...f, connectionType: e.target.value as ConnectionType }))}
                    >
                      <option value="ethernet">Ethernet</option>
                      <option value="wifi">WiFi</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-muted text-xs mb-1.5">IP Mode</label>
                    <select
                      className="select-field"
                      value={form.ipMode}
                      onChange={e => {
                        const mode = e.target.value as 'dhcp' | 'static'
                        if (mode === 'dhcp') {
                          const ip = assignDhcpIpAndUpdate(editing || 'new') || ''
                          setForm(f => ({ ...f, ipMode: mode, ip }))
                        } else {
                          setForm(f => ({ ...f, ipMode: mode }))
                        }
                      }}
                    >
                      <option value="dhcp">DHCP (Auto)</option>
                      <option value="static">Static IP</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-muted text-xs mb-1.5">MAC Address</label>
                    <input
                      type="text"
                      className="input-field"
                      value={form.mac || ''}
                      onChange={e => setForm(f => ({ ...f, mac: e.target.value }))}
                    />
                  </div>
                </div>
                {form.ipMode === 'static' && (
                  <div>
                    <label className="block text-muted text-xs mb-1.5">Static IP Address</label>
                    <input
                      type="text"
                      className="input-field"
                      value={form.ip || ''}
                      onChange={e => setForm(f => ({ ...f, ip: e.target.value }))}
                      placeholder="e.g. 192.168.1.50"
                    />
                  </div>
                )}
                {errors.length > 0 && (
                  <div className="bg-danger-dim/60 border border-danger/40 rounded-lg p-3">
                    {errors.map((e, i) => (
                      <p key={i} className="text-danger text-xs">{e}</p>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button onClick={() => setShowModal(false)} className="btn btn-ghost text-sm">Cancel</button>
                <button onClick={handleSave} className="btn btn-primary text-sm">
                  {editing ? 'Update' : 'Add'} Device
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
