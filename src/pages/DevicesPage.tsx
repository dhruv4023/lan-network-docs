import { useState } from 'react'
import { useStore } from '../store'
import { isValidIp, generateMac } from '../utils/ip'
import type { Device, DeviceType, ConnectionType } from '../types'

const DEVICE_TYPES: { value: DeviceType; label: string }[] = [
  { value: 'printer', label: 'Thermal Printer' },
  { value: 'laptop', label: 'Laptop' },
  { value: 'desktop', label: 'Desktop' },
  { value: 'router', label: 'Router' },
  { value: 'switch', label: 'Switch' },
  { value: 'access-point', label: 'Access Point' },
]

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export default function DevicesPage() {
  const devices = useStore(s => s.devices)
  const addDevice = useStore(s => s.addDevice)
  const removeDevice = useStore(s => s.removeDevice)
  const updateDevice = useStore(s => s.updateDevice)
  const toggleDeviceStatus = useStore(s => s.toggleDeviceStatus)
  const router = useStore(s => s.router)
  const reservations = useStore(s => s.reservations)
  const assignNextIp = useStore(s => s.assignNextIp)
  const addLog = useStore(s => s.addLog)

  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)

  const [form, setForm] = useState<Partial<Device>>({
    name: '',
    type: 'printer',
    mac: generateMac(),
    connectionType: 'ethernet',
    ipMode: 'dhcp',
    ip: '',
    gateway: router.gateway,
    subnet: router.subnetMask,
    online: true,
  })

  const [errors, setErrors] = useState<string[]>([])

  function resetForm() {
    setForm({
      name: '',
      type: 'printer',
      mac: generateMac(),
      connectionType: 'ethernet',
      ipMode: 'dhcp',
      ip: '',
      gateway: router.gateway,
      subnet: router.subnetMask,
      online: true,
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
      if (!form.ip || !isValidIp(form.ip)) errs.push('Invalid static IP address')
      else {
        const dup = devices.find(d => d.id !== editing && d.ip === form.ip)
        if (dup) errs.push(`IP ${form.ip} is already in use by ${dup.name}`)
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
      ? assignNextIp(editing || 'new') || ''
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

  function getTypeIcon(type: DeviceType): string {
    const icons: Record<DeviceType, string> = {
      printer: '\uD83D\uDDA8', laptop: '\uD83D\uDCBB', desktop: '\uD83D\uDDA5',
      router: '\uD83D\uDCE1', switch: '\uD83D\uDD00', 'access-point': '\uD83D\uDCF6',
    }
    return icons[type] || '\u2753'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Devices</h1>
          <p className="text-muted text-sm">{devices.length} device{devices.length !== 1 ? 's' : ''} on network</p>
        </div>
        <button onClick={() => { resetForm(); setShowModal(true) }} className="btn btn-primary text-sm">
          + Add Device
        </button>
      </div>

      <div className="bg-panel border border-line rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-panel-2">
              {['Device', 'Type', 'MAC', 'IP', 'Mode', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-muted text-xs uppercase tracking-wider font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {devices.map(d => {
              const conflict = devices.some(x => x.id !== d.id && x.ip === d.ip)
              return (
                <tr key={d.id} className="border-t border-line hover:bg-panel-2 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span>{getTypeIcon(d.type)}</span>
                      <span className="font-medium">{d.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted text-xs capitalize">{d.type.replace('-', ' ')}</td>
                  <td className="px-4 py-3 font-mono text-xs">{d.mac}</td>
                  <td className="px-4 py-3">
                    <span className={`font-mono text-xs ${conflict ? 'text-danger' : ''}`}>{d.ip}</span>
                    {conflict && <span className="text-danger text-[10px] ml-1">⚠</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${d.ipMode === 'dhcp' ? 'bg-accent-dim text-accent' : 'bg-[#2a1f5e] text-[#9f8aff]'}`}>
                      {d.ipMode.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleDeviceStatus(d.id)}
                      className={`text-xs px-2 py-0.5 rounded-full border cursor-pointer transition-colors
                        ${d.online ? 'bg-accent-dim text-accent border-accent-dim' : 'bg-danger-dim text-danger border-danger-dim'}`}
                    >
                      {d.online ? 'Online' : 'Offline'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(d)} className="text-xs px-2 py-1 rounded bg-panel-2 border border-line text-muted cursor-pointer hover:border-accent">Edit</button>
                      <button onClick={() => removeDevice(d.id)} className="text-xs px-2 py-1 rounded bg-danger-dim text-danger border border-danger-dim cursor-pointer hover:border-danger">Del</button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-panel border border-line rounded-xl p-6 w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mt-0 mb-4">{editing ? 'Edit Device' : 'Add Device'}</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-muted text-xs mb-1">Device Name</label>
                <input
                  type="text"
                  className="w-full bg-bg-soft border border-line rounded-md px-3 py-2 text-sm text-fg focus:outline-none focus:border-accent"
                  value={form.name || ''}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Kitchen Printer"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted text-xs mb-1">Device Type</label>
                  <select
                    className="w-full bg-bg-soft border border-line rounded-md px-3 py-2 text-sm text-fg focus:outline-none focus:border-accent"
                    value={form.type}
                    onChange={e => setForm(f => ({ ...f, type: e.target.value as DeviceType }))}
                  >
                    {DEVICE_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-muted text-xs mb-1">Connection Type</label>
                  <select
                    className="w-full bg-bg-soft border border-line rounded-md px-3 py-2 text-sm text-fg focus:outline-none focus:border-accent"
                    value={form.connectionType}
                    onChange={e => setForm(f => ({ ...f, connectionType: e.target.value as ConnectionType }))}
                  >
                    <option value="ethernet">Ethernet</option>
                    <option value="wifi">WiFi</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted text-xs mb-1">IP Mode</label>
                  <select
                    className="w-full bg-bg-soft border border-line rounded-md px-3 py-2 text-sm text-fg focus:outline-none focus:border-accent"
                    value={form.ipMode}
                    onChange={e => {
                      const mode = e.target.value as 'dhcp' | 'static'
                      setForm(f => ({
                        ...f,
                        ipMode: mode,
                        ip: mode === 'dhcp' ? '' : f.ip,
                      }))
                    }}
                  >
                    <option value="dhcp">DHCP</option>
                    <option value="static">Static IP</option>
                  </select>
                </div>
                <div>
                  <label className="block text-muted text-xs mb-1">MAC Address</label>
                  <input
                    type="text"
                    className="w-full bg-bg-soft border border-line rounded-md px-3 py-2 text-sm text-fg font-mono focus:outline-none focus:border-accent"
                    value={form.mac || ''}
                    onChange={e => setForm(f => ({ ...f, mac: e.target.value }))}
                  />
                </div>
              </div>
              {form.ipMode === 'static' && (
                <div>
                  <label className="block text-muted text-xs mb-1">Static IP Address</label>
                  <input
                    type="text"
                    className="w-full bg-bg-soft border border-line rounded-md px-3 py-2 text-sm text-fg font-mono focus:outline-none focus:border-accent"
                    value={form.ip || ''}
                    onChange={e => setForm(f => ({ ...f, ip: e.target.value }))}
                    placeholder="e.g. 192.168.1.50"
                  />
                </div>
              )}
              {errors.length > 0 && (
                <div className="bg-danger-dim border border-danger rounded-md p-3">
                  {errors.map((e, i) => (
                    <p key={i} className="text-danger text-xs">{e}</p>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setShowModal(false)} className="btn btn-ghost text-sm">Cancel</button>
              <button onClick={handleSave} className="btn btn-primary text-sm">
                {editing ? 'Update' : 'Add'} Device
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
