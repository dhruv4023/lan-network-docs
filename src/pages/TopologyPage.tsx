import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store'
import { generateMac } from '../utils/ip'
import type { TopologyNode, DeviceType, Device, ConnectionType, CableMeta } from '../types'

/* ------------------------------------------------------------------ */
/*  Constants                                                         */
/* ------------------------------------------------------------------ */

const GRID = 20
const DEVICE_TYPES: { value: DeviceType; label: string }[] = [
  { value: 'printer', label: 'Printer' },
  { value: 'laptop', label: 'Laptop' },
  { value: 'desktop', label: 'Desktop' },
  { value: 'switch', label: 'Switch' },
  { value: 'access-point', label: 'Access Point' },
]

const DEVICE_SVGS: Record<string, string> = {
  router: 'M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.858 15.355-5.858 21.213 0',
  switch: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01',
  printer: 'M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z',
  laptop: 'M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0',
  'access-point': 'M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.858 15.355-5.858 21.213 0',
}

const PORT_LAYOUTS: Record<string, { id: string; dx: number; dy: number; label: string }[]> = {
  router: [
    { id: 'wan', dx: -50, dy: -15, label: 'WAN' },
    { id: 'lan1', dx: 20, dy: -15, label: 'L1' },
    { id: 'lan2', dx: 35, dy: -15, label: 'L2' },
    { id: 'lan3', dx: 20, dy: 15, label: 'L3' },
    { id: 'lan4', dx: 35, dy: 15, label: 'L4' },
  ],
  switch: [
    { id: 'p1', dx: -45, dy: -15, label: 'P1' },
    { id: 'p2', dx: -30, dy: -15, label: 'P2' },
    { id: 'p3', dx: -15, dy: -15, label: 'P3' },
    { id: 'p4', dx: 0, dy: -15, label: 'P4' },
    { id: 'p5', dx: 15, dy: -15, label: 'P5' },
    { id: 'p6', dx: 30, dy: -15, label: 'P6' },
    { id: 'p7', dx: 45, dy: -15, label: 'P7' },
  ],
  printer: [
    { id: 'lan', dx: 40, dy: 0, label: 'LAN' },
  ],
  laptop: [
    { id: 'eth', dx: -30, dy: 0, label: 'ETH' },
    { id: 'wifi', dx: 45, dy: -5, label: 'WiFi' },
  ],
}

function getTypeColor(type: string): string {
  const colors: Record<string, string> = { router: '#54e0c2', switch: '#f2b340', printer: '#9f8aff', laptop: '#54e0c2', desktop: '#ef6461', 'access-point': '#54e0c2' }
  return colors[type] || '#8da0b3'
}

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function snap(v: number) { return Math.round(v / GRID) * GRID }

/* Get port position relative to node center */
function getPortPos(node: TopologyNode, portId: string, type: string): { x: number; y: number } | null {
  const layout = PORT_LAYOUTS[type] || PORT_LAYOUTS.printer
  const port = layout.find(p => p.id === portId)
  if (!port) return { x: node.x, y: node.y }
  return { x: node.x + port.dx, y: node.y + port.dy }
}

/* Find nearest port on a device to a given point */
function findNearestPort(node: TopologyNode, type: string, px: number, py: number): { x: number; y: number; id: string } {
  const layout = PORT_LAYOUTS[type] || PORT_LAYOUTS.printer
  let best = { x: node.x, y: node.y, id: 'center' }
  let bestDist = Infinity
  layout.forEach(p => {
    const x = node.x + p.dx, y = node.y + p.dy
    const d = (x - px) ** 2 + (y - py) ** 2
    if (d < bestDist) { bestDist = d; best = { x, y, id: p.id } }
  })
  return best
}

/* ------------------------------------------------------------------ */
/*  Tooltip Component                                                 */
/* ------------------------------------------------------------------ */

function DeviceTooltip({ dev, cx, cy }: { dev: Device; cx: number; cy: number }) {
  const reservations = useStore(s => s.reservations)
  const reservedIp = reservations.find(r => r.mac === dev.mac)?.ip

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.15 }}
      className="fixed z-50 pointer-events-none"
      style={{ left: Math.min(cx + 16, window.innerWidth - 290), top: Math.min(cy - 110, window.innerHeight - 320) }}
    >
      <div className="glass-strong rounded-xl p-4 w-[270px] shadow-2xl">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${dev.online ? 'bg-accent-dim/60' : 'bg-danger-dim/60'}`}>
            <svg className={`w-4.5 h-4.5 ${dev.online ? 'text-accent' : 'text-danger'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d={DEVICE_SVGS[dev.type] || DEVICE_SVGS.laptop} />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-sm">{dev.name}</p>
            <p className="text-muted text-[10px] capitalize">{dev.manufacturer || dev.type.replace('-', ' ')} {dev.model || ''}</p>
          </div>
          <span className={`ml-auto w-2.5 h-2.5 rounded-full shrink-0 ${dev.online ? 'bg-accent shadow-[0_0_8px_var(--color-accent)]' : 'bg-danger'}`} />
        </div>
        <div className="space-y-1 text-[11px]">
          {[
            ['Type', dev.type.replace('-', ' ')],
            ['MAC', dev.mac],
            ['IP', dev.ip || '—'],
            reservedIp ? ['Reserved IP', reservedIp] : null,
            ['Gateway', dev.gateway],
            ['Subnet', dev.subnet],
            ['Mode', dev.ipMode.toUpperCase()],
            ['Connection', dev.connectionType === 'ethernet' ? `${dev.connectionSpeed || 1000} Mbps Wired` : 'WiFi'],
            ['Status', dev.online ? 'Online' : 'Offline'],
            ['Firmware', dev.firmware || '—'],
            dev.lastSeen ? ['Last Seen', new Date(dev.lastSeen).toLocaleTimeString()] : null,
          ].filter(Boolean).map((row) => (
            <div key={row![0] as string} className="flex justify-between">
              <span className="text-muted">{row![0]}</span>
              <code className="text-fg font-mono">{row![1]}</code>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Side Panel                                                        */
/* ------------------------------------------------------------------ */

function SidePanel({ device, onClose, onEdit }: { device: Device; onClose: () => void; onEdit: () => void }) {
  const reservations = useStore(s => s.reservations)
  const simulateAction = useStore(s => s.simulateAction)
  const toggleDeviceStatus = useStore(s => s.toggleDeviceStatus)
  const pingDevice = useStore(s => s.pingDevice)
  const duplicateDevice = useStore(s => s.duplicateDevice)
  const removeDevice = useStore(s => s.removeDevice)
  const autoConfigure = useStore(s => s.autoConfigure)
  const devices = useStore(s => s.devices)
  const topology = useStore(s => s.topology)
  const cables = useStore(s => s.cables)
  const [tab, setTab] = useState<'general' | 'network' | 'dhcp' | 'diagnostics'>('general')

  const d = devices.find(x => x.id === device.id) || device
  const reservedIp = reservations.find(r => r.mac === d.mac)?.ip
  const conflict = devices.some(x => x.id !== d.id && x.ip === d.ip)
  const node = topology.find(n => n.deviceId === d.id)
  const connectedTo = node ? node.connections.map(id => {
    const n = topology.find(x => x.id === id)
    return n ? devices.find(y => y.id === n.deviceId)?.name : null
  }).filter(Boolean) : []

  const pingLatency = d.online ? Math.floor(Math.random() * 5 + 1) : null

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="glass-strong rounded-xl w-[300px] shrink-0 overflow-hidden flex flex-col max-h-[620px]"
    >
      <div className="flex items-center gap-3 p-4 border-b border-line/60">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${d.online ? 'bg-accent-dim/60' : 'bg-danger-dim/60'}`}>
          <svg className={`w-5 h-5 ${d.online ? 'text-accent' : 'text-danger'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d={DEVICE_SVGS[d.type] || DEVICE_SVGS.laptop} />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{d.name}</p>
          <p className="text-muted text-[10px]">{d.type.replace('-', ' ')} &middot; {d.ip || 'No IP'}</p>
        </div>
        <button onClick={onClose} className="text-muted hover:text-fg cursor-pointer bg-transparent border-none text-lg leading-none">&times;</button>
      </div>

      <div className="flex border-b border-line/60 text-[11px]">
        {(['general', 'network', 'dhcp', 'diagnostics'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-center cursor-pointer bg-transparent border-none font-medium transition-colors
              ${tab === t ? 'text-accent border-b-2 border-accent' : 'text-muted hover:text-fg'}`}
          >{t.charAt(0).toUpperCase() + t.slice(1)}</button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 text-xs">
        {tab === 'general' && (
          <div className="space-y-2">
            {[
              ['Name', d.name],
              ['Type', d.type.replace('-', ' ')],
              ['Manufacturer', d.manufacturer || '—'],
              ['Model', d.model || '—'],
              ['Firmware', d.firmware || '—'],
              ['MAC', d.mac],
              ['Status', d.online ? 'Online' : 'Offline'],
              ['Connection', d.connectionType === 'ethernet' ? 'Wired' : 'WiFi'],
              ['Speed', d.connectionSpeed ? `${d.connectionSpeed} Mbps` : '—'],
              ['Connected To', connectedTo.join(', ') || 'None'],
              ['Last Seen', d.lastSeen ? new Date(d.lastSeen).toLocaleString() : '—'],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between py-1 border-b border-line/30">
                <span className="text-muted">{l}</span>
                <code className="text-fg text-right">{v}</code>
              </div>
            ))}
          </div>
        )}

        {tab === 'network' && (
          <div className="space-y-2">
            {[
              ['IP Address', d.ip || '—'],
              ['IP Mode', d.ipMode.toUpperCase()],
              ['Gateway', d.gateway],
              ['Subnet Mask', d.subnet],
              ['DNS', '8.8.8.8'],
              ['Reserved IP', reservedIp || 'None'],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between py-1 border-b border-line/30">
                <span className="text-muted">{l}</span>
                <code className="text-fg">{v}</code>
              </div>
            ))}
            {conflict && (
              <div className="bg-danger-dim/60 border border-danger/40 rounded-lg p-2 text-danger text-[10px] mt-2">
                IP Conflict detected: {d.ip}
              </div>
            )}
          </div>
        )}

        {tab === 'dhcp' && (
          <div className="space-y-2">
            <div className="flex justify-between py-1">
              <span className="text-muted">DHCP Mode</span>
              <span className={`badge text-[10px] ${d.ipMode === 'dhcp' ? 'badge-accent' : 'badge-muted'}`}>{d.ipMode.toUpperCase()}</span>
            </div>
            {d.ipMode === 'dhcp' && (
              <>
                <div className="flex justify-between py-1">
                  <span className="text-muted">Lease IP</span>
                  <code className="text-accent">{d.ip || '—'}</code>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted">Reservation</span>
                  <span>{reservedIp ? `Yes (${reservedIp})` : 'None'}</span>
                </div>
              </>
            )}
          </div>
        )}

        {tab === 'diagnostics' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between py-1">
              <span className="text-muted">Status</span>
              <span className={`flex items-center gap-1.5 ${d.online ? 'text-accent' : 'text-danger'}`}>
                <span className={`w-2 h-2 rounded-full ${d.online ? 'bg-accent' : 'bg-danger'}`} />
                {d.online ? 'Online' : 'Offline'}
              </span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-muted">Gateway</span>
              <span className={d.online ? 'text-accent' : 'text-danger'}>{d.online ? 'Reachable' : 'Unreachable'}</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-muted">Internet</span>
              <span className={d.online ? 'text-accent' : 'text-danger'}>{d.online ? 'Connected' : 'Disconnected'}</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-muted">Ping Latency</span>
              <code className={d.online ? 'text-accent' : 'text-danger'}>{pingLatency ? `${pingLatency}ms` : '—'}</code>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-muted">Packet Loss</span>
              <code className={d.online ? 'text-accent' : 'text-danger'}>{d.online ? '0%' : '100%'}</code>
            </div>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-line/60 flex flex-wrap gap-1.5">
        <button onClick={onEdit} className="text-[10px] px-2.5 py-1.5 rounded-lg bg-accent-dim text-accent border border-accent/30 cursor-pointer hover:brightness-110">Edit</button>
        <button onClick={() => { toggleDeviceStatus(d.id); onClose() }} className="text-[10px] px-2.5 py-1.5 rounded-lg bg-panel-2 text-muted border border-line/60 cursor-pointer hover:border-accent">{d.online ? 'Offline' : 'Online'}</button>
        <button onClick={() => simulateAction('restart-printer', d.id)} className="text-[10px] px-2.5 py-1.5 rounded-lg bg-panel-2 text-muted border border-line/60 cursor-pointer hover:border-accent">Restart</button>
        <button onClick={() => { const to = devices.find(x => x.id !== d.id); if (to) pingDevice(d.id, to.id) }} className="text-[10px] px-2.5 py-1.5 rounded-lg bg-panel-2 text-muted border border-line/60 cursor-pointer hover:border-accent">Ping</button>
        <button onClick={() => { simulateAction('disconnect', d.id); onClose() }} className="text-[10px] px-2.5 py-1.5 rounded-lg bg-warn-dim text-warn border border-warn/30 cursor-pointer">Disconnect</button>
        <button onClick={() => { autoConfigure(d.id) }} className="text-[10px] px-2.5 py-1.5 rounded-lg bg-accent-dim text-accent border border-accent/30 cursor-pointer">Auto Config</button>
        <button onClick={() => { duplicateDevice(d.id); onClose() }} className="text-[10px] px-2.5 py-1.5 rounded-lg bg-panel-2 text-muted border border-line/60 cursor-pointer hover:border-accent">Duplicate</button>
        <button onClick={() => { removeDevice(d.id); onClose() }} className="text-[10px] px-2.5 py-1.5 rounded-lg bg-danger-dim text-danger border border-danger/30 cursor-pointer">Delete</button>
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Cable Editor Dialog                                               */
/* ------------------------------------------------------------------ */

function CableEditor({ fromNodeId, toNodeId, onClose }: { fromNodeId: string; toNodeId: string; onClose: () => void }) {
  const cables = useStore(s => s.cables)
  const connectDevices = useStore(s => s.connectDevices)
  const disconnectCable = useStore(s => s.disconnectCable)
  const updateCable = useStore(s => s.updateCable)
  const addLog = useStore(s => s.addLog)

  const existingCable = cables.find(c =>
    (c.sourceNodeId === fromNodeId && c.targetNodeId === toNodeId) ||
    (c.sourceNodeId === toNodeId && c.targetNodeId === fromNodeId)
  )

  const [type, setType] = useState<ConnectionType>(existingCable?.type || 'ethernet')
  const [speed, setSpeed] = useState(existingCable?.speed || 1000)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="modal-content !max-w-sm"
      onClick={e => e.stopPropagation()}
    >
      <h2 className="text-base font-semibold mt-0 mb-4">
        {existingCable ? 'Edit Connection' : 'New Connection'}
      </h2>
      <div className="space-y-3">
        <div>
          <label className="block text-muted text-xs mb-1">Connection Type</label>
          <select className="select-field" value={type} onChange={e => setType(e.target.value as ConnectionType)}>
            <option value="ethernet">Ethernet (Wired)</option>
            <option value="wifi">WiFi (Wireless)</option>
          </select>
        </div>
        {type === 'ethernet' && (
          <div>
            <label className="block text-muted text-xs mb-1">Speed</label>
            <select className="select-field" value={speed} onChange={e => setSpeed(Number(e.target.value))}>
              <option value={100}>100 Mbps</option>
              <option value={1000}>1 Gbps</option>
              <option value={10000}>10 Gbps</option>
            </select>
          </div>
        )}
        <div className="flex gap-2">
          {existingCable ? (
            <>
              <button onClick={() => { updateCable(existingCable.id, { type, speed }); addLog('Cable updated', 'info'); onClose() }} className="btn btn-primary text-xs flex-1">Update</button>
              <button onClick={() => { disconnectCable(fromNodeId, toNodeId); onClose() }} className="btn btn-danger text-xs">Delete</button>
            </>
          ) : (
            <button onClick={() => { connectDevices(fromNodeId, toNodeId); onClose() }} className="btn btn-primary text-xs flex-1">Connect</button>
          )}
          <button onClick={onClose} className="btn btn-ghost text-xs">Cancel</button>
        </div>
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Validation Warnings                                               */
/* ------------------------------------------------------------------ */

function getWarnings(devices: Device[], topology: TopologyNode[], cables: CableMeta[]) {
  const warns: string[] = []
  devices.forEach(d => {
    const node = topology.find(n => n.deviceId === d.id)
    if (!node) return
    if (node.connections.length === 0) warns.push(`${d.name} has no connections`)
    const conflict = devices.some(x => x.id !== d.id && x.ip === d.ip)
    if (conflict) warns.push(`IP conflict: ${d.name} (${d.ip})`)
    if (d.online && !d.ip) warns.push(`${d.name} is online but has no IP`)
  })
  cables.forEach(c => {
    if (c.sourceNodeId === c.targetNodeId) warns.push('Self-connected cable detected')
  })
  return [...new Set(warns)]
}

/* ------------------------------------------------------------------ */
/*  Auto Layout Helpers                                               */
/* ------------------------------------------------------------------ */

function applyAutoLayout(topology: TopologyNode[], devices: Device[], layout: string): TopologyNode[] {
  const deviceNodes = topology.filter(n => n.deviceId)
  const cx = 400, cy = 250

  return topology.map((n, i) => {
    if (!n.deviceId) return { ...n, x: cx, y: 50 }
    switch (layout) {
      case 'horizontal':
        return { ...n, x: 60 + (i - 1) * 140, y: cy, connections: n.connections }
      case 'vertical':
        return { ...n, x: cx, y: 100 + (i - 1) * 80, connections: n.connections }
      case 'grid': {
        const cols = Math.ceil(Math.sqrt(deviceNodes.length))
        return { ...n, x: 80 + ((i - 1) % cols) * 160, y: 120 + Math.floor((i - 1) / cols) * 100, connections: n.connections }
      }
      case 'tree': {
        const level = Math.min(i, 3)
        const siblings = Math.ceil(deviceNodes.length / 3)
        return { ...n, x: 100 + ((i - 1) % siblings) * (600 / Math.max(siblings, 1) + 1), y: 100 + level * 100, connections: n.connections }
      }
      case 'circle': {
        const angle = ((i - 1) / Math.max(deviceNodes.length - 1, 1)) * Math.PI * 2 - Math.PI / 2
        return { ...n, x: cx + 180 * Math.cos(angle), y: cy + 180 * Math.sin(angle), connections: n.connections }
      }
      default:
        return n
    }
  })
}

/* ------------------------------------------------------------------ */
/*  WiFi Signal Arcs                                                  */
/* ------------------------------------------------------------------ */

function WifiArcs({ cx, cy, color }: { cx: number; cy: number; color: string }) {
  return (
    <g opacity={0.5}>
      <path d={`M${cx - 8},${cy + 6} Q${cx},${cy - 2} ${cx + 8},${cy + 6}`} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <path d={`M${cx - 5},${cy + 3} Q${cx},${cy - 1} ${cx + 5},${cy + 3}`} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <path d={`M${cx - 2},${cy + 1} Q${cx},${cy - 1} ${cx + 2},${cy + 1}`} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </g>
  )
}

/* ------------------------------------------------------------------ */
/*  Port Dot                                                          */
/* ------------------------------------------------------------------ */

function PortDot({ cx, cy, label, connected }: { cx: number; cy: number; label: string; connected: boolean }) {
  return (
    <g>
      <rect x={cx - 4} y={cy - 4} width={8} height={8} rx={2}
        fill={connected ? '#54e0c2' : '#223040'}
        stroke={connected ? '#54e0c2' : '#161f2a'}
        strokeWidth={0.5}
      />
      {connected && <circle cx={cx} cy={cy} r={2} fill="#54e0c2" className="pulse-glow" />}
      <text x={cx} y={cy + 11} textAnchor="middle" fill="#8da0b3" fontSize={5}>{label}</text>
    </g>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Topology Page                                                */
/* ------------------------------------------------------------------ */

interface DragState {
  nodeId: string; startX: number; startY: number
  nodeStartX: number; nodeStartY: number
}

const MAX_UNDO = 20

export default function TopologyPage() {
  const devices = useStore(s => s.devices)
  const topology = useStore(s => s.topology)
  const cables = useStore(s => s.cables)
  const packets = useStore(s => s.packets)
  const router = useStore(s => s.router)
  const reservations = useStore(s => s.reservations)
  const updateTopology = useStore(s => s.updateTopology)
  const connectDevices = useStore(s => s.connectDevices)
  const disconnectCable = useStore(s => s.disconnectCable)
  const addDevice = useStore(s => s.addDevice)
  const updateDevice = useStore(s => s.updateDevice)
  const removeDevice = useStore(s => s.removeDevice)
  const simulateAction = useStore(s => s.simulateAction)
  const autoConfigure = useStore(s => s.autoConfigure)
  const duplicateDevice = useStore(s => s.duplicateDevice)
  const pingDevice = useStore(s => s.pingDevice)
  const toggleDeviceStatus = useStore(s => s.toggleDeviceStatus)
  const addLog = useStore(s => s.addLog)

  const svgRef = useRef<SVGSVGElement>(null)
  const [dragState, setDragState] = useState<DragState | null>(null)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [connecting, setConnecting] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [contextMenu, setContextMenu] = useState<{ nodeId: string; x: number; y: number } | null>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [showCableEditor, setShowCableEditor] = useState<{ from: string; to: string } | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showSidePanel, setShowSidePanel] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', ip: '', mac: '', type: 'printer' as DeviceType, ipMode: 'dhcp' as 'dhcp' | 'static', online: true })
  const [snapEnabled, setSnapEnabled] = useState(true)
  const [undoStack, setUndoStack] = useState<TopologyNode[][]>([])
  const [redoStack, setRedoStack] = useState<TopologyNode[][]>([])
  const [svgDimensions] = useState({ w: 800, h: 500 })

  const routerNode: TopologyNode = {
    id: 'router-node', deviceId: '',
    x: 400, y: 50,
    connections: topology.filter(n => n.connections.length > 0).map(n => n.id),
  }

  const nodeMap = new Map(topology.map(n => [n.id, n]))
  const deviceMap = new Map(devices.map(d => [d.id, d]))
  const warnings = getWarnings(devices, topology, cables)

  /* Undo/Redo */
  function pushUndo(nodes: TopologyNode[]) {
    setUndoStack(prev => [...prev.slice(-MAX_UNDO + 1), nodes])
    setRedoStack([])
  }

  function handleUndo() {
    if (undoStack.length === 0) return
    const prev = undoStack[undoStack.length - 1]
    setRedoStack(prev => [...prev, topology])
    setUndoStack(prev => prev.slice(0, -1))
    updateTopology(prev)
  }

  function handleRedo() {
    if (redoStack.length === 0) return
    const next = redoStack[redoStack.length - 1]
    pushUndo(topology)
    setRedoStack(prev => prev.slice(0, -1))
    updateTopology(next)
  }

  /* Add device from toolbar */
  function handleAddDevice(type: DeviceType) {
    const newId = uid()
    const mac = generateMac()
    const dev: Device = {
      id: newId, name: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      type, mac, connectionType: 'ethernet', ipMode: 'dhcp',
      ip: '', gateway: router.gateway, subnet: router.subnetMask,
      status: 'online', online: true,
    }
    addDevice(dev)
    addLog(`Click the new device to configure it`, 'info')
  }

  function openEdit(dev: Device) {
    setEditForm({ name: dev.name, ip: dev.ip, mac: dev.mac, type: dev.type, ipMode: dev.ipMode, online: dev.online })
    setShowEditModal(true)
  }

  function saveEdit() {
    if (!selectedNode) return
    const node = nodeMap.get(selectedNode)
    if (!node) return
    const dev = devices.find(d => d.id === node.deviceId)
    if (!dev) return
    updateDevice(dev.id, editForm)
    setShowEditModal(false)
    addLog(`Device "${editForm.name}" updated`, 'info')
  }

  /* Dragging */
  const handleMouseDown = useCallback((nodeId: string, e: React.MouseEvent) => {
    if (e.button !== 0 || contextMenu) return
    const node = nodeMap.get(nodeId)
    if (!node) return
    pushUndo(topology)
    setDragState({ nodeId, startX: e.clientX, startY: e.clientY, nodeStartX: node.x, nodeStartY: node.y })
    setSelectedNode(nodeId)
  }, [topology, contextMenu])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (e.buttons === 0) { setDragState(null); return }
    if (!dragState) return
    const dx = (e.clientX - dragState.startX) / zoom
    const dy = (e.clientY - dragState.startY) / zoom
    let nx = dragState.nodeStartX + dx
    let ny = dragState.nodeStartY + dy
    if (snapEnabled) { nx = snap(nx); ny = snap(ny) }
    nx = Math.max(20, Math.min(svgDimensions.w - 20, nx))
    ny = Math.max(20, Math.min(svgDimensions.h - 20, ny))
    const newNodes = topology.map(n => n.id === dragState.nodeId ? { ...n, x: nx, y: ny } : n)
    updateTopology(newNodes)
  }, [dragState, topology, updateTopology, zoom, snapEnabled, svgDimensions])

  const handleMouseUp = useCallback(() => setDragState(null), [])

  /* Canvas panning */
  function handleCanvasMouseDown(e: React.MouseEvent) {
    if (e.target === svgRef.current || (e.target as Element).tagName === 'svg') {
      setIsPanning(true)
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y })
    }
  }

  function handleCanvasMouseMove(e: React.MouseEvent) {
    if (isPanning) {
      setPanOffset({ x: e.clientX - panStart.x, y: e.clientY - panStart.y })
    }
  }

  function handleCanvasMouseUp() { setIsPanning(false) }

  /* Click / Double-click */
  function handleNodeClick(nodeId: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (connecting) {
      if (connecting !== nodeId) setShowCableEditor({ from: connecting, to: nodeId })
      setConnecting(null)
    } else {
      setSelectedNode(nodeId === selectedNode ? null : nodeId)
      setShowSidePanel(true)
    }
  }

  function handleNodeDoubleClick(nodeId: string) {
    const node = nodeMap.get(nodeId)
    if (!node) return
    const dev = devices.find(d => d.id === node.deviceId)
    if (dev) openEdit(dev)
  }

  function handleCanvasClick() {
    setContextMenu(null)
    if (!connecting) { setSelectedNode(null); setShowSidePanel(false) }
  }

  function handleContextMenu(nodeId: string, e: React.MouseEvent) {
    e.preventDefault()
    setContextMenu({ nodeId, x: e.clientX, y: e.clientY })
  }

  function handleMouseOver(nodeId: string, e: React.MouseEvent) {
    setHoveredNode(nodeId)
    setMousePos({ x: e.clientX, y: e.clientY })
  }

  /* Viewport calculation for mini-map */
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = useState({ w: 600, h: 400 })
  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setContainerSize({ w: rect.width, h: rect.height })
    }
  }, [])

  const viewportW = containerSize.w / zoom
  const viewportH = containerSize.h / zoom
  const viewportX = -panOffset.x / zoom + (svgDimensions.w - viewportW) / 2
  const viewportY = -panOffset.y / zoom + (svgDimensions.h - viewportH) / 2

  const selectedDevice = selectedNode
    ? devices.find(d => d.id === nodeMap.get(selectedNode)?.deviceId)
    : null
  const hoverDevice = hoveredNode
    ? devices.find(d => d.id === nodeMap.get(hoveredNode)?.deviceId)
    : null
  const hoverNode = hoveredNode ? nodeMap.get(hoveredNode) : null
  const ctxDev = contextMenu
    ? devices.find(d => d.id === nodeMap.get(contextMenu.nodeId)?.deviceId)
    : null
  const ctxNode = contextMenu ? nodeMap.get(contextMenu.nodeId) : null

  function handleAutoLayout(layout: string) {
    pushUndo(topology)
    updateTopology(applyAutoLayout(topology, devices, layout))
    addLog(`Auto layout: ${layout}`, 'info')
  }

  /* Build cable port map (which ports are connected) */
  const connectedPorts = new Map<string, Set<string>>()
  cables.forEach(c => {
    if (!connectedPorts.has(c.sourceNodeId)) connectedPorts.set(c.sourceNodeId, new Set())
    connectedPorts.get(c.sourceNodeId)!.add(c.targetNodeId)
    if (!connectedPorts.has(c.targetNodeId)) connectedPorts.set(c.targetNodeId, new Set())
    connectedPorts.get(c.targetNodeId)!.add(c.sourceNodeId)
  })

  return (
    <div className="space-y-4">
      <div className="page-header">
        <div>
          <h1>Network Topology</h1>
          <p>Build, configure, and troubleshoot your network</p>
        </div>
        {warnings.length > 0 && (
          <div className="flex gap-1.5">
            {warnings.slice(0, 2).map((w, i) => (
              <span key={i} className="badge badge-warn text-[10px]">{w}</span>
            ))}
          </div>
        )}
      </div>

      {/* ===================== FLOATING TOOLBAR ===================== */}
      <div className="topo-toolbar flex-wrap">
        <span className="text-muted text-[10px] font-semibold uppercase tracking-wider mr-1">Add:</span>
        {DEVICE_TYPES.map(t => (
          <button key={t.value} className="flex items-center gap-1.5 text-[11px]" onClick={() => handleAddDevice(t.value)}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d={DEVICE_SVGS[t.value] || DEVICE_SVGS.laptop} />
            </svg>
            {t.label}
          </button>
        ))}
        <span className="w-px h-5 bg-line/60 mx-1" />
        <button onClick={() => handleAutoLayout('horizontal')} title="Horizontal">&rarr; Horiz</button>
        <button onClick={() => handleAutoLayout('grid')} title="Grid">&#9638; Grid</button>
        <button onClick={() => handleAutoLayout('tree')} title="Tree">&darr; Tree</button>
        <button onClick={() => handleAutoLayout('circle')} title="Circle">&#9711; Circle</button>
        <span className="w-px h-5 bg-line/60 mx-1" />
        <button onClick={() => setZoom(z => Math.min(3, z + 0.15))}>+</button>
        <button onClick={() => setZoom(z => Math.max(0.3, z - 0.15))}>&minus;</button>
        <button onClick={() => { setZoom(1); setPanOffset({ x: 0, y: 0 }) }}>Fit</button>
        <button onClick={() => setSnapEnabled(!snapEnabled)} className={snapEnabled ? 'active' : ''}>Snap {snapEnabled ? 'ON' : 'OFF'}</button>
        <span className="w-px h-5 bg-line/60 mx-1" />
        <button onClick={() => setConnecting(connecting ? null : 'mode')} className={connecting ? 'active' : ''}>
          {connecting ? 'Cancel Connect' : 'Connect'}
        </button>
        {selectedNode && (
          <button onClick={() => setShowSidePanel(!showSidePanel)} className="active">
            {showSidePanel ? 'Hide Panel' : 'Panel'}
          </button>
        )}
        <span className="w-px h-5 bg-line/60 mx-1" />
        <button onClick={handleUndo} disabled={undoStack.length === 0} className={undoStack.length === 0 ? 'opacity-40' : ''} title="Undo">&larr; Undo</button>
        <button onClick={handleRedo} disabled={redoStack.length === 0} className={redoStack.length === 0 ? 'opacity-40' : ''} title="Redo">Redo &rarr;</button>
      </div>

      {/* ===================== CANVAS ===================== */}
      <div className="flex gap-4" ref={containerRef}>
        <div
          className="glass rounded-xl p-4 relative overflow-hidden flex-1"
          onMouseMove={e => { handleMouseMove(e); handleCanvasMouseMove(e) }}
          onMouseUp={e => { handleMouseUp(); handleCanvasMouseUp() }}
          onMouseLeave={e => { handleMouseUp(); handleCanvasMouseUp() }}
          onMouseDown={handleCanvasMouseDown}
          onClick={handleCanvasClick}
          style={{ cursor: isPanning ? 'grabbing' : dragState ? 'grabbing' : 'default' }}
        >
          {/* Mini map */}
          <div className="absolute bottom-3 right-3 z-20 bg-panel/90 backdrop-blur-sm border border-line/60 rounded-lg p-1.5 w-[130px] h-[90px]">
            <svg viewBox={`0 0 ${svgDimensions.w} ${svgDimensions.h}`} className="w-full h-full">
              {topology.map(n => {
                const dev = devices.find(d => d.id === n.deviceId)
                if (!dev) return null
                return <circle key={n.id} cx={n.x} cy={n.y} r={3} fill={dev.online ? '#54e0c2' : '#ef6461'} opacity={0.7} />
              })}
              <circle cx={400} cy={50} r={4} fill="#54e0c2" />
              {/* Viewport indicator */}
              <rect x={Math.max(0, viewportX)} y={Math.max(0, viewportY)}
                width={Math.min(viewportW, svgDimensions.w)}
                height={Math.min(viewportH, svgDimensions.h)}
                fill="none" stroke="#54e0c2" strokeWidth={1} strokeDasharray="2,2" opacity={0.6} />
            </svg>
          </div>

          {/* Zoom level indicator */}
          <div className="absolute top-3 left-3 z-20 bg-panel/80 backdrop-blur-sm border border-line/60 rounded-lg px-2.5 py-1 text-[10px] text-muted font-mono">
            {Math.round(zoom * 100)}%
          </div>

          <svg
            ref={svgRef}
            viewBox={`0 0 ${svgDimensions.w} ${svgDimensions.h}`}
            className="w-full h-auto transition-all duration-100"
            style={{
              transform: `scale(${zoom}) translate(${panOffset.x / zoom}px, ${panOffset.y / zoom}px)`,
              transformOrigin: 'center center',
              minHeight: '400px',
            }}
          >
            {/* Grid */}
            {snapEnabled && Array.from({ length: svgDimensions.w / GRID + 1 }, (_, i) => i * GRID).map(x => (
              <line key={`gx${x}`} x1={x} y1={0} x2={x} y2={svgDimensions.h} stroke="#161f2a" strokeWidth={0.5} />
            ))}
            {snapEnabled && Array.from({ length: svgDimensions.h / GRID + 1 }, (_, i) => i * GRID).map(y => (
              <line key={`gy${y}`} x1={0} y1={y} x2={svgDimensions.w} y2={y} stroke="#161f2a" strokeWidth={0.5} />
            ))}

            {/* Cables */}
            {cables.map(c => {
              const src = nodeMap.get(c.sourceNodeId)
              const tgt = nodeMap.get(c.targetNodeId)
              if (!src || !tgt) return null
              const isSelected = selectedNode === c.sourceNodeId || selectedNode === c.targetNodeId

              if (c.type === 'wifi') {
                return (
                  <g key={c.id}>
                    <line x1={src.x} y1={src.y} x2={tgt.x} y2={tgt.y}
                      stroke="#54e0c2" strokeWidth={1} strokeOpacity={0.2} strokeDasharray="3,6" />
                    <WifiArcs cx={(src.x + tgt.x) / 2} cy={(src.y + tgt.y) / 2} color="#54e0c2" />
                    <text x={(src.x + tgt.x) / 2} y={(src.y + tgt.y) / 2 - 10}
                      textAnchor="middle" fill="#8da0b3" fontSize={6}>WiFi</text>
                  </g>
                )
              }

              /* Ethernet: snap to nearest ports */
              const srcDev = devices.find(d => d.id === src.deviceId)
              const tgtDev = devices.find(d => d.id === tgt.deviceId)
              const srcPort = findNearestPort(src, srcDev?.type || 'printer', tgt.x, tgt.y)
              const tgtPort = findNearestPort(tgt, tgtDev?.type || 'printer', src.x, src.y)

              const strokeColor = c.status === 'connected'
                ? (isSelected ? '#54e0c2' : '#223040')
                : c.status === 'broken' ? '#ef6461' : '#4a2222'
              const connected = c.status === 'connected'

              return (
                <g key={c.id}>
                  <line x1={srcPort.x} y1={srcPort.y} x2={tgtPort.x} y2={tgtPort.y}
                    stroke={strokeColor} strokeWidth={connected ? (isSelected ? 2.5 : 1.5) : 1}
                    strokeOpacity={connected ? (isSelected ? 0.8 : 0.4) : 0.3}
                    strokeDasharray={c.status === 'disconnected' ? '4,4' : 'none'}
                    className="transition-all duration-200"
                  />
                  {connected && (
                    <text x={(srcPort.x + tgtPort.x) / 2} y={(srcPort.y + tgtPort.y) / 2 - 8}
                      textAnchor="middle" fill="#8da0b3" fontSize={7} className="select-none pointer-events-none">
                      {c.speed >= 1000 ? `${c.speed / 1000} Gbps` : `${c.speed} Mbps`}
                    </text>
                  )}
                </g>
              )
            })}

            {/* Packet animations */}
            {packets.map(pkt => {
              const src = nodeMap.get(pkt.sourceNodeId)
              const tgt = nodeMap.get(pkt.targetNodeId)
              if (!src || !tgt) return null
              const elapsed = Date.now() - pkt.timestamp
              const progress = Math.min(1, elapsed / 1500)

              /* Get port positions for packet endpoints */
              const srcDev = devices.find(d => d.id === src.deviceId)
              const srcPort = srcDev ? findNearestPort(src, srcDev.type, tgt.x, tgt.y) : { x: src.x, y: src.y }
              const tgtDev = devices.find(d => d.id === tgt.deviceId)
              const tgtPort = tgtDev ? findNearestPort(tgt, tgtDev.type, src.x, src.y) : { x: tgt.x, y: tgt.y }

              const x = srcPort.x + (tgtPort.x - srcPort.x) * progress
              const y = srcPort.y + (tgtPort.y - srcPort.y) * progress

              /* Select cable type for packet */
              const cable = cables.find(c =>
                (c.sourceNodeId === pkt.sourceNodeId && c.targetNodeId === pkt.targetNodeId) ||
                (c.sourceNodeId === pkt.targetNodeId && c.targetNodeId === pkt.sourceNodeId)
              )
              const isWifi = cable?.type === 'wifi'

              return (
                <g key={pkt.id}>
                  {isWifi ? (
                    <>
                      <circle cx={x} cy={y} r={3} fill="#54e0c2" opacity={0.6} />
                      <text x={x} y={y - 6} textAnchor="middle" fill="#54e0c2" fontSize={5} fontWeight={600}>{pkt.label}</text>
                    </>
                  ) : (
                    <>
                      <circle cx={x} cy={y} r={4} fill="#54e0c2" className="pulse-glow" />
                      <text x={x} y={y - 8} textAnchor="middle" fill="#54e0c2" fontSize={6} fontWeight={600}>{pkt.label}</text>
                    </>
                  )}
                </g>
              )
            })}

            {/* Router */}
            <g>
              <rect x={routerNode.x - 60} y={routerNode.y - 20} width={120} height={40} rx={10} fill="#1e463f" stroke="#54e0c2" strokeWidth={2} />
              <svg x={routerNode.x - 48} y={routerNode.y - 12} width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="#54e0c2" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={DEVICE_SVGS.router} />
              </svg>
              <text x={routerNode.x} y={routerNode.y - 2} textAnchor="middle" fill="#e8eef4" fontSize={12} fontWeight={600}>{router.name}</text>
              <text x={routerNode.x} y={routerNode.y + 14} textAnchor="middle" fill="#8da0b3" fontSize={10}>{router.lanIp}</text>
              <circle cx={routerNode.x + 55} cy={routerNode.y - 12} r={4} fill="#54e0c2" className="pulse-glow" />
              {/* Router ports */}
              {(PORT_LAYOUTS.router || []).map(p => {
                const connected = connectedPorts.has(routerNode.id) && connectedPorts.get(routerNode.id)!.size > 0
                return <PortDot key={p.id} cx={routerNode.x + p.dx} cy={routerNode.y + p.dy} label={p.label} connected={connected} />
              })}
            </g>

            {/* Device nodes */}
            {topology.map(node => {
              const dev = devices.find(d => d.id === node.deviceId)
              if (!dev) return null
              const isSelected = selectedNode === node.id
              const isConnecting = connecting === node.id
              const conflict = devices.some(x => x.id !== dev.id && x.ip === dev.ip)
              const color = getTypeColor(dev.type)
              const hasReservation = reservations.some(r => r.mac === dev.mac)
              const ports = PORT_LAYOUTS[dev.type] || []

              let statusColor = dev.online ? '#54e0c2' : '#ef6461'
              if (!dev.ip) statusColor = '#f2b340'
              if (conflict) statusColor = '#ef6461'

              const portConnections = new Set<string>()
              cables.forEach(c => {
                if (c.sourceNodeId === node.id) portConnections.add(c.targetNodeId)
                if (c.targetNodeId === node.id) portConnections.add(c.sourceNodeId)
              })

              return (
                <g key={node.id}
                  className="cursor-pointer"
                  onMouseDown={e => handleMouseDown(node.id, e)}
                  onClick={e => { e.stopPropagation(); handleNodeClick(node.id, e) }}
                  onDoubleClick={() => handleNodeDoubleClick(node.id)}
                  onContextMenu={e => handleContextMenu(node.id, e)}
                  onMouseEnter={e => handleMouseOver(node.id, e)}
                  onMouseLeave={() => setHoveredNode(null)}
                >
                  {/* Selection highlight */}
                  {isSelected && (
                    <rect x={node.x - 58} y={node.y - 25} width={116} height={50} rx={12}
                      fill="none" stroke="#54e0c2" strokeWidth={1} strokeDasharray="3,3" opacity={0.5} />
                  )}

                  <rect x={node.x - 55} y={node.y - 22} width={110} height={44} rx={10}
                    fill={conflict ? '#4a2222' : '#161f2a'}
                    stroke={
                      isConnecting ? '#54e0c2' :
                      isSelected ? '#54e0c2' :
                      conflict ? '#ef6461' :
                      dev.online ? '#223040' : '#4a2222'
                    }
                    strokeWidth={isSelected || isConnecting ? 2.5 : 1.5}
                    className="transition-all duration-100"
                  />
                  {/* Status LED */}
                  <circle cx={node.x - 45} cy={node.y - 13} r={3} fill={statusColor}
                    className={dev.online ? 'pulse-glow' : ''} />
                  {/* Device icon */}
                  <svg x={node.x - 42} y={node.y - 6} width={14} height={14} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={DEVICE_SVGS[dev.type] || DEVICE_SVGS.laptop} />
                  </svg>
                  {/* Hostname */}
                  <text x={node.x} y={node.y - 5} textAnchor="middle" fill="#e8eef4" fontSize={11} fontWeight={600}>{dev.name}</text>
                  {/* IP */}
                  <text x={node.x} y={node.y + 12} textAnchor="middle" fill="#8da0b3" fontSize={9}>{dev.ip || 'No IP'}</text>
                  {/* Reservation indicator */}
                  {hasReservation && (
                    <text x={node.x} y={node.y - 20} textAnchor="middle" fill="#9f8aff" fontSize={7} fontWeight={600}>RESERVED</text>
                  )}
                  {/* Device ports */}
                  {ports.map(p => {
                    const connected = portConnections.size > 0
                    return <PortDot key={p.id} cx={node.x + p.dx} cy={node.y + p.dy} label={p.label} connected={connected} />
                  })}
                </g>
              )
            })}
          </svg>
        </div>

        {/* ===================== SIDE PANEL ===================== */}
        <AnimatePresence>
          {showSidePanel && selectedDevice && (
            <SidePanel device={selectedDevice} onClose={() => { setShowSidePanel(false); setSelectedNode(null) }} onEdit={() => openEdit(selectedDevice)} />
          )}
        </AnimatePresence>
      </div>

      {/* ===================== CONTEXT MENU ===================== */}
      {contextMenu && ctxDev && ctxNode && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setContextMenu(null)} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="fixed z-50 glass-strong rounded-xl p-1.5 min-w-[170px] shadow-2xl"
            style={{ left: contextMenu.x, top: contextMenu.y }}>
            <p className="text-xs font-semibold px-3 py-1.5 text-muted">{ctxDev.name}</p>
            <div className="h-px bg-line/60 my-0.5" />
            {[
              { label: 'Edit Device', action: () => { openEdit(ctxDev); setContextMenu(null) } },
              { label: 'Auto Configure', action: () => { autoConfigure(ctxDev.id); setContextMenu(null) } },
              { label: ctxDev.online ? 'Set Offline' : 'Set Online', action: () => { toggleDeviceStatus(ctxDev.id); setContextMenu(null) } },
              { label: 'Restart', action: () => { simulateAction('restart-printer', ctxDev.id); setContextMenu(null) } },
              { label: 'Ping', action: () => { const to = devices.find(d => d.id !== ctxDev.id); if (to) { pingDevice(ctxDev.id, to.id); setContextMenu(null) } } },
              { label: ctxNode.connections.length > 0 ? 'Disconnect All' : 'Connect...', action: () => {
                if (ctxNode.connections.length > 0) {
                  ctxNode.connections.forEach(c => disconnectCable(ctxNode.id, c))
                } else { setConnecting(ctxNode.id) }
                setContextMenu(null)
              }},
              { label: 'Duplicate', action: () => { duplicateDevice(ctxDev.id); setContextMenu(null) } },
            ].map(item => (
              <button key={item.label} onClick={item.action}
                className="w-full text-left text-xs px-3 py-1.5 rounded-lg hover:bg-panel-2/60 text-fg cursor-pointer transition-colors">
                {item.label}
              </button>
            ))}
            <div className="h-px bg-line/60 my-0.5" />
            <button onClick={() => { setSelectedNode(contextMenu.nodeId); setShowSidePanel(true); setContextMenu(null) }}
              className="w-full text-left text-xs px-3 py-1.5 rounded-lg hover:bg-panel-2/60 text-accent cursor-pointer">View Details</button>
            <button onClick={() => { removeDevice(ctxDev.id); setContextMenu(null) }}
              className="w-full text-left text-xs px-3 py-1.5 rounded-lg hover:bg-danger-dim/60 text-danger cursor-pointer">Delete Device</button>
          </motion.div>
        </>
      )}

      {/* ===================== HOVER TOOLTIP ===================== */}
      <AnimatePresence>
        {hoverDevice && hoverNode && hoveredNode !== selectedNode && (
          <DeviceTooltip key={hoveredNode} dev={hoverDevice} cx={mousePos.x} cy={mousePos.y} />
        )}
      </AnimatePresence>

      {/* ===================== CABLE EDITOR MODAL ===================== */}
      <AnimatePresence>
        {showCableEditor && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="modal-overlay" onClick={() => setShowCableEditor(null)}>
            <CableEditor fromNodeId={showCableEditor.from} toNodeId={showCableEditor.to}
              onClose={() => setShowCableEditor(null)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===================== EDIT DEVICE MODAL ===================== */}
      <AnimatePresence>
        {showEditModal && selectedDevice && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="modal-overlay" onClick={() => setShowEditModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }} className="modal-content !max-w-sm" onClick={e => e.stopPropagation()}>
              <h2>Edit Device</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-muted text-xs mb-1">Hostname</label>
                  <input className="input-field" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-muted text-xs mb-1">IP Mode</label>
                    <select className="select-field" value={editForm.ipMode} onChange={e => {
                      setEditForm(f => ({ ...f, ipMode: e.target.value as 'dhcp' | 'static' }))
                    }}>
                      <option value="dhcp">DHCP</option>
                      <option value="static">Static IP</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-muted text-xs mb-1">MAC</label>
                    <input className="input-field" value={editForm.mac} onChange={e => setEditForm(f => ({ ...f, mac: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {editForm.ipMode === 'static' && (
                    <div>
                      <label className="block text-muted text-xs mb-1">IP Address</label>
                      <input className="input-field" value={editForm.ip} onChange={e => setEditForm(f => ({ ...f, ip: e.target.value }))} />
                    </div>
                  )}
                  <div>
                    <label className="block text-muted text-xs mb-1">Type</label>
                    <select className="select-field" value={editForm.type} onChange={e => setEditForm(f => ({ ...f, type: e.target.value as DeviceType }))}>
                      {DEVICE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-muted text-xs">Online</label>
                  <input type="checkbox" checked={editForm.online} onChange={e => setEditForm(f => ({ ...f, online: e.target.checked }))} className="accent-accent" />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-5">
                <button onClick={() => setShowEditModal(false)} className="btn btn-ghost text-xs">Cancel</button>
                <button onClick={saveEdit} className="btn btn-primary text-xs">Save</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
