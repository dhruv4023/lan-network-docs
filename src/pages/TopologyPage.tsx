import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store'
import type { Device, RouterConfig, TopologyNode, CableMeta, DeviceType } from '../types'

/* ------------------------------------------------------------------ */
/*  Constants                                                         */
/* ------------------------------------------------------------------ */

const GRID = 20
const DEVICE_SVGS: Record<string, string> = {
  router: 'M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.858 15.355-5.858 21.213 0',
  switch: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01',
  printer: 'M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z',
  laptop: 'M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0',
  desktop: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z',
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
    { id: 'wifi', dx: 40, dy: -5, label: 'WiFi' },
  ],
  desktop: [
    { id: 'eth', dx: -35, dy: 0, label: 'ETH' },
  ],
}

function getTypeColor(type: string): string {
  const colors: Record<string, string> = { router: '#54e0c2', switch: '#f2b340', printer: '#9f8aff', laptop: '#54e0c2', desktop: '#ef6461', 'access-point': '#54e0c2' }
  return colors[type] || '#8da0b3'
}

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

/* ------------------------------------------------------------------ */
/*  Auto Layout & Connection Generation                                */
/* ------------------------------------------------------------------ */

const ROUTER_Y = 110
const INFRA_Y = 240
const END_Y = 370

interface LayoutResult {
  nodes: (TopologyNode & { deviceType?: string })[]
  cables: CableMeta[]
}

function computeLayout(devices: Device[], router: RouterConfig): LayoutResult {
  const ROUTER_NODE_ID = 'router-node'
  const nodes: (TopologyNode & { deviceType?: string })[] = []
  const cables: CableMeta[] = []

  nodes.push({ id: ROUTER_NODE_ID, deviceId: '', deviceType: 'router', x: 400, y: ROUTER_Y, connections: [] })

  if (devices.length === 0) return { nodes, cables }

  const sorted = [...devices].sort((a, b) => a.name.localeCompare(b.name))
  const switches = sorted.filter(d => d.type === 'switch')
  const aps = sorted.filter(d => d.type === 'access-point')
  const wired = sorted.filter(d => d.type === 'printer' || d.type === 'desktop')
  const wireless = sorted.filter(d => d.type === 'laptop')
  const infra = [...switches, ...aps]
  const infraCount = infra.length

  const SPACING_INFRA = 180
  const SPACING_END = 130
  const canvasCX = 400

  function createNode(devId: string, x: number, y: number): TopologyNode & { deviceType?: string } {
    const dev = sorted.find(d => d.id === devId)
    return { id: uid(), deviceId: devId, deviceType: dev?.type, x, y, connections: [] }
  }

  function cableKey(a: string, b: string): string {
    return [a, b].sort().join(':')
  }
  const cableKeys = new Set<string>()
  function addCable(src: string, tgt: string, type: 'ethernet' | 'wifi', speed: number, online: boolean) {
    const key = cableKey(src, tgt)
    if (cableKeys.has(key)) return
    cableKeys.add(key)
    cables.push({ id: uid(), sourceNodeId: src, targetNodeId: tgt, type, speed, status: online ? 'connected' : 'disconnected' })
  }

  if (infraCount === 0) {
    const allEnd = [...wired, ...wireless]
    const startX = canvasCX - ((allEnd.length - 1) * SPACING_END) / 2
    allEnd.forEach((dev, i) => {
      const n = createNode(dev.id, startX + i * SPACING_END, END_Y)
      nodes.push(n)
      addCable(ROUTER_NODE_ID, n.id, dev.connectionType || 'ethernet', dev.connectionSpeed || 1000, dev.online)
    })
    return { nodes, cables }
  }

  const infraStartX = canvasCX - ((infraCount - 1) * SPACING_INFRA) / 2
  infra.forEach((dev, i) => {
    const n = createNode(dev.id, infraStartX + i * SPACING_INFRA, INFRA_Y)
    nodes.push(n)
    addCable(ROUTER_NODE_ID, n.id, 'ethernet', 1000, dev.online)
  })

  const switchNodes = nodes.filter(n => n.deviceType === 'switch')
  const apNodes = nodes.filter(n => n.deviceType === 'access-point')

  const allEnd = [...wired, ...wireless]
  const endStartX = canvasCX - ((allEnd.length - 1) * SPACING_END) / 2
  allEnd.forEach((dev, i) => {
    const n = createNode(dev.id, endStartX + i * SPACING_END, END_Y)
    nodes.push(n)

    if (dev.type === 'laptop' || dev.connectionType === 'wifi') {
      const parent = apNodes.length > 0 ? apNodes[i % apNodes.length] : (switchNodes.length > 0 ? switchNodes[i % switchNodes.length] : nodes[0])
      addCable(parent.id, n.id, 'wifi', 0, dev.online)
    } else {
      const parent = switchNodes.length > 0 ? switchNodes[i % switchNodes.length] : nodes[0]
      addCable(parent.id, n.id, 'ethernet', dev.connectionSpeed || 1000, dev.online)
    }
  })

  return { nodes, cables }
}

/* ------------------------------------------------------------------ */
/*  Health & Stats                                                     */
/* ------------------------------------------------------------------ */

function getNetworkHealth(devices: Device[], router: RouterConfig) {
  const total = devices.length
  const online = devices.filter(d => d.online).length
  const offline = devices.filter(d => !d.online).length
  const dhcp = devices.filter(d => d.ipMode === 'dhcp').length
  const staticIp = devices.filter(d => d.ipMode === 'static').length
  const conflicts = devices.filter(d => devices.some(x => x.id !== d.id && x.ip === d.ip && d.ip)).length
  const noIp = devices.filter(d => d.online && !d.ip).length

  return { total, online, offline, dhcp, staticIp, conflicts: conflicts / 2, noIp }
}

function getDeviceErrors(dev: Device, devices: Device[]): string[] {
  const errors: string[] = []
  if (!dev.online) errors.push('Offline')
  if (devices.some(x => x.id !== dev.id && x.ip === dev.ip && dev.ip)) errors.push('IP Conflict')
  if (dev.online && !dev.ip) errors.push('No IP')
  return errors
}

/* ------------------------------------------------------------------ */
/*  Wifi Signal Arcs                                                  */
/* ------------------------------------------------------------------ */

function WifiArcs({ cx, cy, color }: { cx: number; cy: number; color: string }) {
  return (
    <g opacity={0.6}>
      <path d={`M${cx - 8},${cy + 6} Q${cx},${cy - 2} ${cx + 8},${cy + 6}`} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <path d={`M${cx - 5},${cy + 3} Q${cx},${cy - 1} ${cx + 5},${cy + 3}`} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <path d={`M${cx - 2},${cy + 1} Q${cx},${cy - 1} ${cx + 2},${cy + 1}`} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </g>
  )
}

/* ------------------------------------------------------------------ */
/*  Device Tooltip                                                    */
/* ------------------------------------------------------------------ */

function DeviceTooltip({ dev, cx, cy }: { dev: Device; cx: number; cy: number }) {
  const reservations = useStore(s => s.reservations)
  const reservedIp = reservations.find(r => r.mac === dev.mac)?.ip
  const errors = getDeviceErrors(dev, useStore(s => s.devices))

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.15 }}
      className="fixed z-50 pointer-events-none"
      style={{ left: Math.min(cx + 16, window.innerWidth - 300), top: Math.min(cy - 120, window.innerHeight - 340) }}
    >
      <div className="glass-strong rounded-xl p-4 w-[280px] shadow-2xl border border-line/40">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${errors.length > 0 ? 'bg-danger-dim/60' : dev.online ? 'bg-accent-dim/60' : 'bg-warn-dim/60'}`}>
            <svg className={`w-5 h-5 ${errors.length > 0 ? 'text-danger' : dev.online ? 'text-accent' : 'text-warn'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d={DEVICE_SVGS[dev.type] || DEVICE_SVGS.laptop} />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-sm">{dev.name}</p>
            <p className="text-muted text-[10px] capitalize">{dev.manufacturer || dev.type.replace('-', ' ')} {dev.model || ''}</p>
          </div>
          {errors.length > 0 ? (
            <span className="ml-auto w-2.5 h-2.5 rounded-full shrink-0 bg-danger shadow-[0_0_8px_var(--color-danger)]" />
          ) : dev.online ? (
            <span className="ml-auto w-2.5 h-2.5 rounded-full shrink-0 bg-accent shadow-[0_0_8px_var(--color-accent)]" />
          ) : (
            <span className="ml-auto w-2.5 h-2.5 rounded-full shrink-0 bg-warn" />
          )}
        </div>
        {errors.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {errors.map(e => (
              <span key={e} className="badge badge-danger text-[9px]">{e}</span>
            ))}
          </div>
        )}
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
          ].filter((r): r is [string, string] => r !== null).map(([label, value]) => (
            <div key={label} className="flex justify-between">
              <span className="text-muted">{label}</span>
              <code className="text-fg font-mono">{value}</code>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Cable Tooltip                                                     */
/* ------------------------------------------------------------------ */

function CableTooltip({ cable, srcName, tgtName, cx, cy }: { cable: CableMeta; srcName: string; tgtName: string; cx: number; cy: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.15 }}
      className="fixed z-50 pointer-events-none"
      style={{ left: Math.min(cx + 12, window.innerWidth - 220), top: Math.min(cy - 70, window.innerHeight - 180) }}
    >
      <div className="glass-strong rounded-xl p-3 w-[200px] shadow-2xl border border-line/40">
        <p className="font-semibold text-xs mb-2">
          {cable.type === 'wifi' ? 'WiFi' : `${cable.speed >= 1000 ? `${cable.speed / 1000} Gbps` : `${cable.speed} Mbps`} Ethernet`}
        </p>
        <div className="space-y-1 text-[10px]">
          <div className="flex justify-between"><span className="text-muted">Type</span><span className="text-fg capitalize">{cable.type === 'wifi' ? 'Wireless' : 'Wired'}</span></div>
          {cable.type === 'ethernet' && <div className="flex justify-between"><span className="text-muted">Speed</span><span className="text-fg">{cable.speed >= 1000 ? `${cable.speed / 1000} Gbps` : `${cable.speed} Mbps`}</span></div>}
          <div className="flex justify-between"><span className="text-muted">Source</span><span className="text-fg">{srcName}</span></div>
          <div className="flex justify-between"><span className="text-muted">Target</span><span className="text-fg">{tgtName}</span></div>
          <div className="flex justify-between">
            <span className="text-muted">Status</span>
            <span className={`flex items-center gap-1 ${cable.status === 'connected' ? 'text-accent' : cable.status === 'broken' ? 'text-danger' : 'text-warn'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cable.status === 'connected' ? 'bg-accent' : cable.status === 'broken' ? 'bg-danger' : 'bg-warn'}`} />
              {cable.status === 'connected' ? 'Connected' : cable.status === 'broken' ? 'Broken' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Side Panel (Quick Actions, No Editing)                            */
/* ------------------------------------------------------------------ */

function SidePanel({ device, onClose }: { device: Device; onClose: () => void }) {
  const reservations = useStore(s => s.reservations)
  const toggleDeviceStatus = useStore(s => s.toggleDeviceStatus)
  const pingDevice = useStore(s => s.pingDevice)
  const setPage = useStore(s => s.setPage)
  const devices = useStore(s => s.devices)
  const d = devices.find(x => x.id === device.id) || device
  const reservedIp = reservations.find(r => r.mac === d.mac)?.ip
  const conflict = devices.some(x => x.id !== d.id && x.ip === d.ip)
  const errors = getDeviceErrors(d, devices)

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="glass-strong rounded-xl w-[270px] shrink-0 overflow-hidden flex flex-col max-h-[560px] border border-line/40"
    >
      <div className="flex items-center gap-3 p-4 border-b border-line/60">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${errors.length > 0 ? 'bg-danger-dim/60' : d.online ? 'bg-accent-dim/60' : 'bg-warn-dim/60'}`}>
          <svg className={`w-5 h-5 ${errors.length > 0 ? 'text-danger' : d.online ? 'text-accent' : 'text-warn'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d={DEVICE_SVGS[d.type] || DEVICE_SVGS.laptop} />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{d.name}</p>
          <p className="text-muted text-[10px]">{d.type.replace('-', ' ')} &middot; {d.ip || 'No IP'}</p>
        </div>
        <button onClick={onClose} className="text-muted hover:text-fg cursor-pointer bg-transparent border-none text-lg leading-none">&times;</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 text-xs">
        {errors.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {errors.map(e => (
              <span key={e} className="badge badge-danger text-[9px]">{e}</span>
            ))}
          </div>
        )}
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
            ['Last Seen', d.lastSeen ? new Date(d.lastSeen).toLocaleString() : '—'],
          ].map(([l, v]) => (
            <div key={l} className="flex justify-between py-1 border-b border-line/30">
              <span className="text-muted">{l}</span>
              <code className="text-fg text-right">{v}</code>
            </div>
          ))}
        </div>
        {d.ip && (
          <div className="space-y-1 mt-3 pt-2 border-t border-line/30">
            <p className="text-muted text-[10px] font-semibold uppercase tracking-wider">Network</p>
            {[
              ['IP', d.ip],
              ['Mode', d.ipMode.toUpperCase()],
              ['Gateway', d.gateway],
              ['Subnet', d.subnet],
              reservedIp ? ['Reserved IP', reservedIp] : null,
            ].filter((r): r is [string, string] => r !== null).map(([l, v]) => (
              <div key={l} className="flex justify-between py-0.5">
                <span className="text-muted">{l}</span>
                <code className="text-fg text-right">{v}</code>
              </div>
            ))}
            {conflict && (
              <div className="bg-danger-dim/60 border border-danger/40 rounded-lg p-2 text-danger text-[10px] mt-1">
                IP Conflict: {d.ip}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-3 border-t border-line/60 flex flex-wrap gap-1.5">
        <button onClick={() => setPage('devices')}
          className="text-[10px] px-2.5 py-1.5 rounded-lg bg-accent-dim text-accent border border-accent/30 cursor-pointer hover:brightness-110">Edit in Devices</button>
        <button onClick={() => { toggleDeviceStatus(d.id) }}
          className="text-[10px] px-2.5 py-1.5 rounded-lg bg-panel-2 text-muted border border-line/60 cursor-pointer hover:border-accent">{d.online ? 'Take Offline' : 'Bring Online'}</button>
        <button onClick={() => { const to = devices.find(x => x.id !== d.id); if (to) pingDevice(d.id, to.id) }}
          className="text-[10px] px-2.5 py-1.5 rounded-lg bg-panel-2 text-muted border border-line/60 cursor-pointer hover:border-accent">Ping</button>
        <button onClick={() => setPage('devices')}
          className="text-[10px] px-2.5 py-1.5 rounded-lg bg-panel-2 text-muted border border-line/60 cursor-pointer hover:border-accent">Locate in List</button>
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Topology Page                                                */
/* ------------------------------------------------------------------ */

export default function TopologyPage() {
  const devices = useStore(s => s.devices)
  const router = useStore(s => s.router)
  const reservations = useStore(s => s.reservations)
  const packets = useStore(s => s.packets)
  const updateTopology = useStore(s => s.updateTopology)
  const pingDevice = useStore(s => s.pingDevice)
  const toggleDeviceStatus = useStore(s => s.toggleDeviceStatus)
  const setPage = useStore(s => s.setPage)
  const addLog = useStore(s => s.addLog)

  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(1)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [hoveredCable, setHoveredCable] = useState<string | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [containerSize, setContainerSize] = useState({ w: 600, h: 400 })
  const [showGrid, setShowGrid] = useState(false)

  /* ---- Compute auto-layout ---- */
  const layout = useMemo(() => computeLayout(devices, router), [devices, router])

  useEffect(() => {
    if (layout.nodes.length > 0) {
      const existingIds = new Set(layout.nodes.map(n => n.id))
      const prevTopology = useStore.getState().topology
      const prevIds = new Set(prevTopology.map(n => n.id))
      const allInPrev = [...existingIds].every(id => prevIds.has(id))
      const allInExisting = [...prevIds].every(id => existingIds.has(id))
      if (!allInPrev || !allInExisting) {
        updateTopology(layout.nodes)
      }
    }
  }, [layout.nodes, updateTopology])

  /* ---- Update cables in store ---- */
  useEffect(() => {
    const prevCables = useStore.getState().cables
    const newKeys = new Set(layout.cables.map(c => [c.sourceNodeId, c.targetNodeId].sort().join(':')))
    const prevKeys = new Set(prevCables.map(c => [c.sourceNodeId, c.targetNodeId].sort().join(':')))
    const changed = newKeys.size !== prevKeys.size || [...newKeys].some(k => !prevKeys.has(k))
    if (changed) {
      useStore.setState({ cables: layout.cables })
    }
  }, [layout.cables])

  /* ---- Container size ---- */
  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setContainerSize({ w: rect.width, h: rect.height })
    }
  }, [])

  const svgW = 800
  const svgH = 500

  const viewportW = containerSize.w / zoom
  const viewportH = containerSize.h / zoom
  const viewportX = -panOffset.x / zoom + (svgW - viewportW) / 2
  const viewportY = -panOffset.y / zoom + (svgH - viewportH) / 2

  const nodeMap = useMemo(() => {
    const m = new Map<string, (typeof layout.nodes)[0]>()
    layout.nodes.forEach(n => m.set(n.id, n))
    return m
  }, [layout.nodes])

  const deviceMap = useMemo(() => {
    const m = new Map<string, Device>()
    devices.forEach(d => m.set(d.id, d))
    return m
  }, [devices])

  const selectedDevice = selectedNode
    ? layout.nodes.find(n => n.id === selectedNode)?.deviceId
    : null
  const selectedDeviceData = selectedDevice ? devices.find(d => d.id === selectedDevice) || null : null

  const hoverDevice = hoveredNode
    ? devices.find(d => d.id === layout.nodes.find(n => n.id === hoveredNode)?.deviceId)
    : null

  const hoverNode = hoveredNode ? nodeMap.get(hoveredNode) : null

  const health = useMemo(() => getNetworkHealth(devices, router), [devices, router])

  const conflicts = useMemo(() => {
    const ips = new Map<string, string[]>()
    devices.forEach(d => { if (d.ip) { const list = ips.get(d.ip) || []; list.push(d.name); ips.set(d.ip, list) } })
    return [...ips.entries()].filter(([, names]) => names.length > 1)
  }, [devices])

  /* ---- Pan handlers ---- */
  function handleCanvasMouseDown(e: React.MouseEvent) {
    if (e.button !== 0) return
    const el = e.target as Element
    if (el.closest('[data-node]') || el.closest('[data-cable]')) return
    setIsPanning(true)
    setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y })
  }

  function handleCanvasMouseMove(e: React.MouseEvent) {
    if (isPanning) setPanOffset({ x: e.clientX - panStart.x, y: e.clientY - panStart.y })
  }

  function handleCanvasMouseUp() { setIsPanning(false) }

  function handleNodeClick(nodeId: string) {
    setSelectedNode(nodeId === selectedNode ? null : nodeId)
  }

  function handleCanvasClick() {
    setSelectedNode(null)
    setHoveredNode(null)
  }

  /* ---- Keyboard: Escape close panel ---- */
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setSelectedNode(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  /* ---- Auto re-layout button ---- */
  function handleForceRelayout() {
    const { nodes, cables } = computeLayout(devices, router)
    updateTopology(nodes)
    useStore.setState({ cables })
    addLog('Topology auto-layout refreshed', 'info')
  }

  /* ---- Filter cables to match current layout ---- */
  const nodeIds = useMemo(() => new Set(layout.nodes.map(n => n.id)), [layout.nodes])
  const displayCables = useMemo(
    () => layout.cables.filter(c => nodeIds.has(c.sourceNodeId) && nodeIds.has(c.targetNodeId)),
    [layout.cables, nodeIds]
  )

  return (
    <div className="space-y-4">
      {/* ===================== HEADER ===================== */}
      <div className="page-header">
        <div>
          <h1>Network Topology</h1>
          <p>Live visualization of your network configuration</p>
        </div>
      </div>

      {/* ===================== HEALTH CARD ===================== */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-xl p-4"
      >
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${health.online > 0 ? 'bg-accent shadow-[0_0_8px_var(--color-accent)]' : 'bg-danger'}`} />
              <span className="text-sm font-semibold">
                Network Status
              </span>
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${health.conflicts > 0 || health.noIp > 0 ? 'bg-warn-dim text-warn' : 'bg-accent-dim text-accent'}`}>
                {health.conflicts > 0 || health.noIp > 0 ? 'Issues Found' : 'Healthy'}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 text-[11px]">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-accent" /> {health.online} Connected</span>
            {health.offline > 0 && <span className="flex items-center gap-1 text-warn"><span className="w-1.5 h-1.5 rounded-full bg-warn" /> {health.offline} Offline</span>}
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#9f8aff]" /> {health.dhcp} DHCP</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#f2b340]" /> {health.staticIp} Static</span>
            {health.conflicts > 0 && <span className="flex items-center gap-1 text-danger"><span className="w-1.5 h-1.5 rounded-full bg-danger" /> {health.conflicts} Conflict{health.conflicts > 1 ? 's' : ''}</span>}
            {health.noIp > 0 && <span className="flex items-center gap-1 text-danger"><span className="w-1.5 h-1.5 rounded-full bg-danger" /> {health.noIp} No IP</span>}
          </div>
        </div>
      </motion.div>

      {/* ===================== TOOLBAR ===================== */}
      <div className="topo-toolbar flex-wrap">
        <span className="text-muted text-[10px] font-semibold uppercase tracking-wider mr-2">View:</span>
        <button onClick={() => setZoom(z => Math.min(3, z + 0.2))} title="Zoom In">+</button>
        <button onClick={() => setZoom(z => Math.max(0.3, z - 0.2))} title="Zoom Out">&minus;</button>
        <button onClick={() => { setZoom(1); setPanOffset({ x: 0, y: 0 }) }} title="Fit to Screen">Fit</button>
        <button onClick={() => setShowGrid(!showGrid)} className={showGrid ? 'active' : ''} title="Toggle Grid">Grid</button>
        <span className="w-px h-5 bg-line/60 mx-1" />
        <button onClick={handleForceRelayout} title="Auto Layout">Auto Layout</button>
        <span className="w-px h-5 bg-line/60 mx-1" />
        <span className="text-muted text-[10px]">{layout.nodes.length - 1} device{layout.nodes.length - 1 !== 1 ? 's' : ''} &middot; {displayCables.length} connection{displayCables.length !== 1 ? 's' : ''}</span>
      </div>

      {/* ===================== CANVAS ===================== */}
      <div className="flex gap-4" ref={containerRef}>
        <div
          className="glass rounded-xl p-4 relative overflow-hidden flex-1"
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
          onMouseDown={handleCanvasMouseDown}
          onClick={handleCanvasClick}
          style={{ cursor: isPanning ? 'grabbing' : 'default', minHeight: '400px' }}
        >
          {/* Mini map */}
          <div className="absolute bottom-3 right-3 z-20 bg-panel/90 backdrop-blur-sm border border-line/60 rounded-lg p-1.5 w-[130px] h-[90px]">
            <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-full">
              {layout.nodes.map(n => {
                const dev = n.deviceId ? devices.find(d => d.id === n.deviceId) : null
                if (!dev && n.id !== 'router-node') return null
                const online = n.id === 'router-node' ? true : dev?.online
                return <circle key={n.id} cx={n.x} cy={n.y} r={n.id === 'router-node' ? 4 : 3} fill={online ? '#54e0c2' : '#ef6461'} opacity={0.7} />
              })}
              <rect x={Math.max(0, viewportX)} y={Math.max(0, viewportY)}
                width={Math.min(viewportW, svgW)} height={Math.min(viewportH, svgH)}
                fill="none" stroke="#54e0c2" strokeWidth={1} strokeDasharray="2,2" opacity={0.6} />
            </svg>
          </div>

          {/* Zoom level */}
          <div className="absolute top-3 left-3 z-20 bg-panel/80 backdrop-blur-sm border border-line/60 rounded-lg px-2.5 py-1 text-[10px] text-muted font-mono">
            {Math.round(zoom * 100)}%
          </div>

          <svg
            ref={svgRef}
            viewBox={`0 0 ${svgW} ${svgH}`}
            className="w-full h-auto"
            style={{
              transform: `scale(${zoom}) translate(${panOffset.x / zoom}px, ${panOffset.y / zoom}px)`,
              transformOrigin: 'center center',
              minHeight: '400px',
            }}
          >
            {/* Grid */}
            {showGrid && Array.from({ length: svgW / GRID + 1 }, (_, i) => i * GRID).map(x => (
              <line key={`gx${x}`} x1={x} y1={0} x2={x} y2={svgH} stroke="#161f2a" strokeWidth={0.5} />
            ))}
            {showGrid && Array.from({ length: svgH / GRID + 1 }, (_, i) => i * GRID).map(y => (
              <line key={`gy${y}`} x1={0} y1={y} x2={svgW} y2={y} stroke="#161f2a" strokeWidth={0.5} />
            ))}

            {/* =================== CABLES =================== */}
            {displayCables.map(c => {
              const src = nodeMap.get(c.sourceNodeId)
              const tgt = nodeMap.get(c.targetNodeId)
              if (!src || !tgt) return null
              const isHovered = hoveredCable === c.id

              if (c.type === 'wifi') {
                const color = c.status === 'connected' ? '#54e0c2' : c.status === 'broken' ? '#ef6461' : '#f2b340'
                return (
                  <g key={c.id} data-cable={c.id}>
                    <line x1={src.x} y1={src.y} x2={tgt.x} y2={tgt.y}
                      stroke={color} strokeWidth={isHovered ? 2 : 1}
                      strokeOpacity={c.status === 'connected' ? 0.3 : 0.15}
                      strokeDasharray="4,6"
                      onMouseEnter={() => setHoveredCable(c.id)}
                      onMouseLeave={() => setHoveredCable(null)}
                      className="transition-all duration-200" />
                    <WifiArcs cx={(src.x + tgt.x) / 2} cy={(src.y + tgt.y) / 2} color={color} />
                    <text x={(src.x + tgt.x) / 2} y={(src.y + tgt.y) / 2 - 12}
                      textAnchor="middle" fill={color} fontSize={6} opacity={0.6}>WiFi</text>
                  </g>
                )
              }

              const srcDev = src.deviceId ? devices.find(d => d.id === src.deviceId) : null
              const tgtDev = tgt.deviceId ? devices.find(d => d.id === tgt.deviceId) : null
              const strokeColor = c.status === 'connected'
                ? (isHovered ? '#54e0c2' : '#2a4a4a')
                : c.status === 'broken' ? '#ef6461' : '#4a2222'
              const strokeWidth = isHovered ? 2.5 : c.status === 'connected' ? 1.5 : 1
              const dashArray = c.status === 'disconnected' ? '5,4' : 'none'

              const midX = (src.x + tgt.x) / 2
              const midY = (src.y + tgt.y) / 2

              return (
                <g key={c.id} data-cable={c.id}>
                  <line x1={src.x} y1={src.y} x2={tgt.x} y2={tgt.y}
                    stroke={strokeColor} strokeWidth={strokeWidth}
                    strokeDasharray={dashArray}
                    strokeLinecap="round"
                    onMouseEnter={() => setHoveredCable(c.id)}
                    onMouseLeave={() => setHoveredCable(null)}
                    className="transition-all duration-200" />
                  {isHovered && c.status === 'connected' && (
                    <text x={midX} y={midY - 8} textAnchor="middle" fill="#54e0c2" fontSize={7} fontWeight={600}>
                      {c.speed >= 1000 ? `${c.speed / 1000} Gbps` : `${c.speed} Mbps`}
                    </text>
                  )}
                </g>
              )
            })}

            {/* =================== PACKET ANIMATIONS =================== */}
            {packets.map(pkt => {
              const src = nodeMap.get(pkt.sourceNodeId)
              const tgt = nodeMap.get(pkt.targetNodeId)
              if (!src || !tgt) return null
              const elapsed = Date.now() - pkt.timestamp
              const progress = Math.min(1, elapsed / 1500)
              const x = src.x + (tgt.x - src.x) * progress
              const y = src.y + (tgt.y - src.y) * progress
              const cable = displayCables.find(c =>
                (c.sourceNodeId === pkt.sourceNodeId && c.targetNodeId === pkt.targetNodeId) ||
                (c.sourceNodeId === pkt.targetNodeId && c.targetNodeId === pkt.sourceNodeId)
              )
              const isWifi = cable?.type === 'wifi'

              return (
                <g key={pkt.id}>
                  {isWifi ? (
                    <>
                      <circle cx={x} cy={y} r={3} fill="#54e0c2" opacity={0.5} />
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

            {/* =================== ROUTER =================== */}
            <g>
              <defs>
                <filter id="router-shadow">
                  <feDropShadow dx={0} dy={2} stdDeviation={4} floodColor="#54e0c2" floodOpacity={0.25} />
                </filter>
              </defs>
              <rect x={400 - 65} y={ROUTER_Y - 22} width={130} height={44} rx={12}
                fill="#1e463f" stroke="#54e0c2" strokeWidth={2} filter="url(#router-shadow)" />
              <svg x={400 - 52} y={ROUTER_Y - 13} width={18} height={18} fill="none" viewBox="0 0 24 24" stroke="#54e0c2" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={DEVICE_SVGS.router} />
              </svg>
              <text x={400} y={ROUTER_Y - 4} textAnchor="middle" fill="#e8eef4" fontSize={12} fontWeight={600}>{router.name}</text>
              <text x={400} y={ROUTER_Y + 14} textAnchor="middle" fill="#8da0b3" fontSize={10}>{router.lanIp}</text>
              <circle cx={400 + 58} cy={ROUTER_Y - 14} r={4} fill="#54e0c2" className="pulse-glow" />

              {/* Router ports */}
              {(PORT_LAYOUTS.router || []).map(p => (
                <g key={p.id}>
                  <rect x={400 + p.dx - 3} y={ROUTER_Y + p.dy - 3} width={6} height={6} rx={1.5}
                    fill="#54e0c2" stroke="#54e0c2" strokeWidth={0.5} />
                </g>
              ))}
            </g>

            {/* =================== DEVICE NODES =================== */}
            {layout.nodes.map(node => {
              const dev = node.deviceId ? devices.find(d => d.id === node.deviceId) : null
              if (node.id === 'router-node') return null
              if (!dev) return null

              const isSelected = selectedNode === node.id
              const isHovered = hoveredNode === node.id
              const errors = getDeviceErrors(dev, devices)
              const hasError = errors.length > 0
              const color = getTypeColor(dev.type)
              const hasReservation = reservations.some(r => r.mac === dev.mac)

              let borderColor = dev.online ? '#2a4a4a' : '#3a2222'
              let statusDotColor = dev.online ? '#54e0c2' : '#f2b340'
              if (hasError) { borderColor = '#ef6461'; statusDotColor = '#ef6461' }

              if (isSelected) borderColor = '#54e0c2'
              if (isHovered) borderColor = '#54e0c2'

              return (
                <g key={node.id}
                  data-node={node.id}
                  onClick={e => { e.stopPropagation(); handleNodeClick(node.id) }}
                  onMouseEnter={e => { setHoveredNode(node.id); setMousePos({ x: e.clientX, y: e.clientY }) }}
                  onMouseLeave={() => setHoveredNode(null)}
                  className="cursor-pointer transition-all duration-150"
                >
                  {/* Selection ring */}
                  {isSelected && (
                    <rect x={node.x - 62} y={node.y - 26} width={124} height={52} rx={14}
                      fill="none" stroke="#54e0c2" strokeWidth={1.5} strokeDasharray="3,3" opacity={0.6} />
                  )}

                  {/* Device card */}
                  <rect x={node.x - 58} y={node.y - 22} width={116} height={44} rx={10}
                    fill={hasError ? '#2a1818' : (dev.online ? '#1a2430' : '#1e1a18')}
                    stroke={borderColor}
                    strokeWidth={isSelected ? 2 : isHovered ? 2 : 1.5}
                    className="transition-all duration-150" />

                  {/* Status dot */}
                  <circle cx={node.x - 48} cy={node.y - 12} r={3}
                    fill={statusDotColor}
                    className={dev.online && !hasError ? 'pulse-glow' : ''} />

                  {/* Error icon */}
                  {hasError && (
                    <text x={node.x - 48} y={node.y - 12} textAnchor="middle" fontSize={7} fill="#ef6461">!</text>
                  )}

                  {/* Reservation badge */}
                  {hasReservation && !hasError && (
                    <text x={node.x - 48} y={node.y + 14} textAnchor="middle" fill="#9f8aff" fontSize={6} fontWeight={600}>R</text>
                  )}

                  {/* Device icon */}
                  <svg x={node.x - 44} y={node.y - 7} width={14} height={14} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={DEVICE_SVGS[dev.type] || DEVICE_SVGS.laptop} />
                  </svg>

                  {/* Hostname */}
                  <text x={node.x} y={node.y - 4} textAnchor="middle" fill="#e8eef4" fontSize={10} fontWeight={600}>{dev.name}</text>

                  {/* IP */}
                  <text x={node.x} y={node.y + 13} textAnchor="middle" fill={hasError ? '#ef6461' : '#8da0b3'} fontSize={8}>
                    {hasError ? errors[0] : (dev.ip || 'No IP')}
                  </text>
                </g>
              )
            })}

            {/* =================== INTERNET LABEL =================== */}
            <g>
              <text x={400} y={40} textAnchor="middle" fill="#8da0b3" fontSize={11} fontWeight={600} letterSpacing={2}>INTERNET</text>
              <line x1={400} y1={48} x2={400} y2={78} stroke="#223040" strokeWidth={1.5} strokeDasharray="3,3" />
            </g>
          </svg>
        </div>

        {/* ===================== SIDE PANEL ===================== */}
        <AnimatePresence>
          {selectedNode && selectedDeviceData && (
            <SidePanel key={selectedNode} device={selectedDeviceData} onClose={() => setSelectedNode(null)} />
          )}
        </AnimatePresence>
      </div>

      {/* ===================== HOVER TOOLTIP ===================== */}
      <AnimatePresence>
        {hoverDevice && hoverNode && hoveredNode !== selectedNode && (
          <DeviceTooltip key={hoveredNode} dev={hoverDevice} cx={mousePos.x} cy={mousePos.y} />
        )}
      </AnimatePresence>

      {/* ===================== CABLE TOOLTIP ===================== */}
      <AnimatePresence>
        {hoveredCable && (() => {
          const c = displayCables.find(x => x.id === hoveredCable)
          if (!c) return null
          const src = nodeMap.get(c.sourceNodeId)
          const tgt = nodeMap.get(c.targetNodeId)
          if (!src || !tgt) return null
          const srcName = src.id === 'router-node' ? 'Router' : (devices.find(d => d.id === src.deviceId)?.name || '?')
          const tgtName = tgt.id === 'router-node' ? 'Router' : (devices.find(d => d.id === tgt.deviceId)?.name || '?')
          return <CableTooltip key={c.id} cable={c} srcName={srcName} tgtName={tgtName} cx={mousePos.x} cy={mousePos.y} />
        })()}
      </AnimatePresence>

      {/* ===================== LEGEND ===================== */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-xl p-3"
      >
        <div className="flex items-center gap-4 text-[10px] text-muted flex-wrap">
          <span className="font-semibold uppercase tracking-wider">Legend</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent" /> Online</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-warn" /> Offline</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-danger" /> Error</span>
          <span className="w-px h-3 bg-line/60" />
          <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-[#2a4a4a]" /> Ethernet</span>
          <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-[#2a4a4a]" style={{ borderTop: '1px dashed #2a4a4a', height: 0 }} /> WiFi</span>
          <span className="w-px h-3 bg-line/60" />
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#9f8aff]" /> DHCP</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#f2b340]" /> Static</span>
        </div>
      </motion.div>
    </div>
  )
}
