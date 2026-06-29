import { create } from 'zustand'
import { persistState, loadState, clearAll } from '../lib/storage'
import * as ip from '../utils/ip'
import { findNextAvailableIp, getLeaseExpiry } from '../utils/dhcp'
import { getDefaultState, generateMac } from '../data/scenarios'
import type {
  NetworkState, RouterConfig, Device, DhcpReservation,
  DhcpLease, LogEntry, TopologyNode, DeviceStatus,
  CableMeta, PacketAnim, ConnectionType, CableStatus,
} from '../types'

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function log(state: NetworkState, msg: string, severity: LogEntry['severity']): LogEntry {
  return { id: uid(), timestamp: new Date().toISOString(), message: msg, severity }
}

const defaults = getDefaultState()

const saved = loadState()
const initialState: NetworkState = saved || {
  router: defaults.router,
  devices: defaults.devices as Device[],
  reservations: [],
  leases: [],
  topology: defaults.topology as TopologyNode[],
  cables: [],
  packets: [],
  logs: [{
    id: uid(),
    timestamp: new Date().toISOString(),
    message: 'Network simulator initialized. Default topology created.',
    severity: 'info',
  }],
  settings: { theme: 'dark', sidebarOpen: true, activePage: 'dashboard' },
}

export const useStore = create<NetworkState & {
  setTheme: (t: 'dark' | 'light') => void
  setPage: (p: string) => void
  toggleSidebar: () => void
  updateRouter: (r: Partial<RouterConfig>) => void
  addDevice: (d: Device) => void
  removeDevice: (id: string) => void
  updateDevice: (id: string, d: Partial<Device>) => void
  toggleDeviceStatus: (id: string) => void
  addReservation: (r: Omit<DhcpReservation, 'id' | 'status'>) => void
  removeReservation: (id: string) => void
  releaseLease: (id: string) => void
  renewLease: (id: string) => void
  addLog: (msg: string, severity: LogEntry['severity']) => void
  resetNetwork: () => void
  applyScenario: (scenarioId: string) => void
  addLease: (hostname: string, mac: string, ip: string) => void
  assignNextIp: (deviceId: string) => string | null
  assignDhcpIp: (deviceId: string) => string | null
  assignDhcpIpAndUpdate: (deviceId: string) => string | null
  updateTopology: (nodes: TopologyNode[]) => void
  connectDevices: (fromId: string, toId: string) => void
  disconnectCable: (fromId: string, toId: string) => void
  simulateAction: (action: string, deviceId?: string) => void
  autoConfigure: (deviceId: string) => void
  duplicateDevice: (deviceId: string) => void
  addCable: (c: Omit<CableMeta, 'id'>) => void
  removeCable: (id: string) => void
  updateCable: (id: string, upd: Partial<CableMeta>) => void
  addPacketAnim: (sourceNodeId: string, targetNodeId: string, label: string) => void
  clearPackets: () => void
  pingDevice: (fromId: string, toId: string) => void
}>()((set, get) => ({
  ...initialState,

  setTheme: (t) => set(s => {
    const next = { ...s, settings: { ...s.settings, theme: t } }
    persistState(next)
    return next
  }),

  setPage: (p) => set(s => {
    const next = { ...s, settings: { ...s.settings, activePage: p } }
    persistState(next)
    return next
  }),

  toggleSidebar: () => set(s => {
    const next = { ...s, settings: { ...s.settings, sidebarOpen: !s.settings.sidebarOpen } }
    persistState(next)
    return next
  }),

  updateRouter: (r) => set(s => {
    const router = { ...s.router, ...r }
    const next = { ...s, router, logs: [...s.logs, log(s, `Router configuration updated`, 'info')] }
    persistState(next)
    return next
  }),

  addDevice: (d) => set(s => {
    const devices = [...s.devices, d]
    const topoNode: TopologyNode = { id: uid(), deviceId: d.id, x: 200 + Math.random() * 400, y: 250 + Math.random() * 200, connections: [] }
    const topology = [...s.topology, topoNode]
    const next = {
      ...s,
      devices,
      topology,
      logs: [...s.logs, log(s, `Device "${d.name}" added with IP ${d.ip}`, 'success')],
    }
    persistState(next)
    return next
  }),

  removeDevice: (id) => set(s => {
    const d = s.devices.find(x => x.id === id)
    const devices = s.devices.filter(x => x.id !== id)
    const topology = s.topology.filter(x => x.deviceId !== id).map(n => ({
      ...n,
      connections: n.connections.filter(c => c !== id),
    }))
    const cables = s.cables.filter(c => c.sourceNodeId !== id && c.targetNodeId !== id)
    const next = {
      ...s,
      devices,
      topology,
      cables,
      logs: [...s.logs, log(s, `Device "${d?.name || id}" removed`, 'warn')],
    }
    persistState(next)
    return next
  }),

  updateDevice: (id, upd) => set(s => {
    const devices = s.devices.map(d => d.id === id ? { ...d, ...upd } : d)
    const next = { ...s, devices }
    persistState(next)
    return next
  }),

  toggleDeviceStatus: (id) => set(s => {
    const devices = s.devices.map(d => {
      if (d.id !== id) return d
      const online = !d.online
      return { ...d, status: online ? 'online' as DeviceStatus : 'offline' as DeviceStatus, online, lastSeen: online ? new Date().toISOString() : d.lastSeen }
    })
    const d = devices.find(x => x.id === id)
    const next = {
      ...s,
      devices,
      logs: [...s.logs, log(s, `Device "${d?.name || id}" is now ${d?.online ? 'online' : 'offline'}`, d?.online ? 'success' : 'warn')],
    }
    persistState(next)
    return next
  }),

  addReservation: (r) => set(s => {
    const reservation: DhcpReservation = { ...r, id: uid(), status: 'active' }
    const reservations = [...s.reservations, reservation]
    const next = {
      ...s,
      reservations,
      logs: [...s.logs, log(s, `DHCP reservation created: ${r.ip} → ${r.hostname}`, 'success')],
    }
    persistState(next)
    return next
  }),

  removeReservation: (id) => set(s => {
    const r = s.reservations.find(x => x.id === id)
    const reservations = s.reservations.filter(x => x.id !== id)
    const next = {
      ...s,
      reservations,
      logs: [...s.logs, log(s, `Reservation removed for ${r?.hostname || id}`, 'warn')],
    }
    persistState(next)
    return next
  }),

  releaseLease: (id) => set(s => {
    const leases = s.leases.map(l => l.id === id ? { ...l, status: 'released' as const } : l)
    const next = { ...s, leases, logs: [...s.logs, log(s, `Lease released for ${leases.find(l => l.id === id)?.hostname || id}`, 'info')] }
    persistState(next)
    return next
  }),

  renewLease: (id) => set(s => {
    const now = new Date()
    const leases = s.leases.map(l =>
      l.id === id
        ? { ...l, leaseStart: now.toISOString(), leaseExpiry: getLeaseExpiry(s.router.leaseTime, now), status: 'active' as const }
        : l
    )
    const next = { ...s, leases, logs: [...s.logs, log(s, `Lease renewed for ${leases.find(l => l.id === id)?.hostname || id}`, 'success')] }
    persistState(next)
    return next
  }),

  addLease: (hostname, mac, ip) => set(s => {
    const now = new Date()
    const lease: DhcpLease = {
      id: uid(), hostname, mac, ip,
      leaseStart: now.toISOString(),
      leaseExpiry: getLeaseExpiry(s.router.leaseTime, now),
      status: 'active',
    }
    const leases = [...s.leases, lease]
    const next = { ...s, leases, logs: [...s.logs, log(s, `DHCP lease assigned: ${ip} → ${hostname}`, 'success')] }
    persistState(next)
    return next
  }),

  addLog: (msg, severity) => set(s => {
    const next = { ...s, logs: [...s.logs, log(s, msg, severity)] }
    persistState(next)
    return next
  }),

  resetNetwork: () => {
    clearAll()
    const def = getDefaultState()
    set({
      ...def as unknown as NetworkState,
      reservations: [],
      leases: [],
      cables: [],
      packets: [],
      logs: [{
        id: uid(), timestamp: new Date().toISOString(),
        message: 'Network reset to default configuration.',
        severity: 'warn',
      }],
      settings: { theme: 'dark', sidebarOpen: true, activePage: 'dashboard' },
    })
  },

  applyScenario: (scenarioId) => {
    const s = get()

    function makeDev(name: string, type: Device['type'], ip: string, online = true, connectionType: Device['connectionType'] = 'ethernet', ipMode: Device['ipMode'] = 'static'): Device {
      return {
        id: uid(), name, type, mac: generateMac(), connectionType, ipMode,
        ip, gateway: '192.168.1.1', subnet: '255.255.255.0',
        status: online ? 'online' : 'offline', online,
        firmware: type === 'printer' ? `v2.1.${Math.floor(Math.random() * 5)}` : undefined,
        manufacturer: type === 'printer' ? 'NetPrint' : type === 'switch' ? 'NetSwitch' : type === 'access-point' ? 'AirWave' : type === 'desktop' ? 'DeskPro' : 'Generic',
        model: type === 'printer' ? `NP-${100 + Math.floor(Math.random() * 900)}` : type === 'access-point' ? `AW-${100 + Math.floor(Math.random() * 900)}` : undefined,
      }
    }

    let devices: Device[] = []
    let logs: LogEntry[] = [log(s, `Loading scenario: ${scenarioId}`, 'info')]
    let router = { ...s.router }
    let reservations: DhcpReservation[] = []

    switch (scenarioId) {
      case 'home':
        devices = [
          makeDev('Laptop-1', 'laptop', '192.168.1.10'),
          makeDev('Printer-1', 'printer', '192.168.1.50'),
          makeDev('Printer-2', 'printer', '192.168.1.51'),
        ]
        break
      case 'office':
        devices = [
          makeDev('Switch-1', 'switch', '192.168.1.2'),
          ...Array.from({ length: 10 }, (_, i) => makeDev(`Printer-${i + 1}`, 'printer', `192.168.1.${50 + i}`)),
          ...Array.from({ length: 5 }, (_, i) => makeDev(`Laptop-${i + 1}`, 'laptop', `192.168.1.${20 + i}`)),
        ]
        break
      case 'warehouse': {
        devices = [
          makeDev('Switch-1', 'switch', '192.168.1.2'),
          makeDev('Switch-2', 'switch', '192.168.1.3'),
          ...Array.from({ length: 10 }, (_, i) => makeDev(`Printer-R1-${i + 1}`, 'printer', `192.168.1.${50 + i}`)),
          ...Array.from({ length: 10 }, (_, i) => makeDev(`Printer-R2-${i + 1}`, 'printer', `192.168.1.${70 + i}`)),
        ]
        break
      }
      case 'school-lab':
        devices = [
          makeDev('Switch-1', 'switch', '192.168.1.2'),
          ...Array.from({ length: 10 }, (_, i) => makeDev(`Desktop-${i + 1}`, 'desktop', `192.168.1.${30 + i}`)),
          makeDev('Printer-1', 'printer', '192.168.1.50'),
        ]
        break
      case 'coffee-shop':
        devices = [
          makeDev('AP-1', 'access-point', '192.168.1.3'),
          makeDev('AP-2', 'access-point', '192.168.1.4'),
          makeDev('AP-3', 'access-point', '192.168.1.5'),
          ...Array.from({ length: 8 }, (_, i) => makeDev(`Laptop-${i + 1}`, 'laptop', `192.168.1.${10 + i}`, true, 'wifi')),
        ]
        break
      case 'enterprise':
        devices = [
          makeDev('Switch-1', 'switch', '192.168.1.2'),
          makeDev('Switch-2', 'switch', '192.168.1.3'),
          makeDev('AP-1', 'access-point', '192.168.1.4'),
          makeDev('AP-2', 'access-point', '192.168.1.5'),
          ...Array.from({ length: 5 }, (_, i) => makeDev(`Desktop-${i + 1}`, 'desktop', `192.168.1.${30 + i}`)),
          ...Array.from({ length: 5 }, (_, i) => makeDev(`Laptop-${i + 1}`, 'laptop', `192.168.1.${60 + i}`, true, 'wifi')),
          ...Array.from({ length: 3 }, (_, i) => makeDev(`Printer-${i + 1}`, 'printer', `192.168.1.${50 + i}`)),
        ]
        break
      case 'smart-office':
        devices = [
          makeDev('Switch-1', 'switch', '192.168.1.2'),
          makeDev('AP-1', 'access-point', '192.168.1.3'),
          makeDev('AP-2', 'access-point', '192.168.1.4'),
          makeDev('AP-3', 'access-point', '192.168.1.5'),
          ...Array.from({ length: 4 }, (_, i) => makeDev(`Desktop-${i + 1}`, 'desktop', `192.168.1.${30 + i}`)),
          ...Array.from({ length: 4 }, (_, i) => makeDev(`Laptop-${i + 1}`, 'laptop', `192.168.1.${60 + i}`, true, 'wifi')),
          makeDev('Printer-1', 'printer', '192.168.1.50'),
          makeDev('Printer-2', 'printer', '192.168.1.51'),
        ]
        break
      case 'out-of-range':
        router = { ...router, lanIp: '192.168.1.1', subnetMask: '255.255.255.0', dhcpRangeStart: '192.168.1.100', dhcpRangeEnd: '192.168.1.200' }
        devices = [makeDev('Printer-1', 'printer', '192.168.192.168')]
        logs.push(log(s, '⚠ Printer-1 has IP 192.168.192.168 — outside router subnet 192.168.1.x', 'error'))
        break
      case 'duplicate-ip':
        devices = [
          makeDev('Printer-1', 'printer', '192.168.1.100'),
          makeDev('Printer-2', 'printer', '192.168.1.100'),
        ]
        logs.push(log(s, '⚠ IP conflict: Printer-1 and Printer-2 share IP 192.168.1.100', 'error'))
        break
      case 'dhcp-reservation':
        router = { ...router, dhcpRangeStart: '192.168.1.10', dhcpRangeEnd: '192.168.1.200' }
        devices = [
          makeDev('Printer-1', 'printer', '192.168.1.50'),
          makeDev('Laptop-1', 'laptop', '192.168.1.10'),
        ]
        const mac = generateMac()
        devices[0].mac = mac
        devices[0].ipMode = 'dhcp'
        reservations = [{
          id: uid(), mac, ip: '192.168.1.50', hostname: 'Printer-1', status: 'active' as const,
        }]
        logs.push(log(s, '✓ DHCP reservation active: Printer-1 → 192.168.1.50', 'success'))
        break
      case 'reservation-explained':
        router = { ...router, dhcpRangeStart: '192.168.1.50', dhcpRangeEnd: '192.168.1.200' }
        const p1Mac = generateMac()
        devices = [
          makeDev('Printer-1', 'printer', '192.168.1.50', true, 'ethernet', 'dhcp'),
          makeDev('Printer-2', 'printer', '192.168.1.51', true, 'ethernet', 'dhcp'),
          makeDev('Laptop-1', 'laptop', '192.168.1.52', true, 'ethernet', 'dhcp'),
          makeDev('Laptop-2', 'laptop', '192.168.1.53', true, 'wifi', 'dhcp'),
        ]
        devices[0].mac = p1Mac
        devices[0].ip = '192.168.1.50'
        reservations = [{
          id: uid(), mac: p1Mac, ip: '192.168.1.50', hostname: 'Printer-1', status: 'active' as const,
        }]
        logs.push(
          log(s, '📌 Printer-1 has a DHCP reservation for 192.168.1.50 — it will always receive this IP', 'success'),
          log(s, '📋 Printer-2 (no reservation) got 192.168.1.51 from the DHCP pool', 'info'),
          log(s, '📋 Laptop-1 (no reservation) got 192.168.1.52 from the DHCP pool', 'info'),
          log(s, '📋 Laptop-2 (no reservation) got 192.168.1.53 from the DHCP pool', 'info'),
          log(s, '💡 Reservation = binding a MAC address to a fixed IP in the DHCP server', 'info'),
        )
        break
    }

    const next: NetworkState = {
      ...s, router, devices, reservations, logs,
      leases: [], cables: [], packets: [],
      settings: { ...s.settings, activePage: 'dashboard' },
      topology: devices.map((d, i) => ({
        id: uid(), deviceId: d.id, x: 100 + (i % 5) * 180, y: 200 + Math.floor(i / 5) * 120, connections: [],
      })),
    }
    persistState(next)
    set(next)
  },

  assignNextIp: (deviceId) => {
    const s = get()
    const dev = s.devices.find(d => d.id === deviceId)
    if (!dev) return null
    const net = ip.networkAddress(s.router.lanIp, s.router.subnetMask)
    const bcast = ip.broadcastAddress(s.router.lanIp, s.router.subnetMask)
    const exclude = [s.router.lanIp, s.router.gateway, net, bcast]
    return findNextAvailableIp(s.router.dhcpRangeStart, s.router.dhcpRangeEnd, s.devices, s.reservations, exclude)
  },

  assignDhcpIp: (deviceId) => {
    const s = get()
    const dev = s.devices.find(d => d.id === deviceId)
    if (!dev) return null
    if (!s.router.dhcpEnabled) return null
    const nextIp = s.assignNextIp(deviceId)
    if (!nextIp) return null
    return nextIp
  },

  assignDhcpIpAndUpdate: (deviceId) => {
    const s = get()
    const nextIp = s.assignDhcpIp(deviceId)
    if (!nextIp) return null

    const devices = s.devices.map(d =>
      d.id === deviceId ? { ...d, ip: nextIp, ipMode: 'dhcp' as const, status: 'online' as DeviceStatus, online: true, lastSeen: new Date().toISOString() } : d
    )
    const dev = devices.find(d => d.id === deviceId)

    s.addLease(dev?.name || 'Unknown', dev?.mac || '', nextIp)
    const next = {
      ...s,
      devices,
      logs: [...s.logs, log(s, `DHCP: ${dev?.name || 'Device'} assigned ${nextIp}`, 'success')],
    }
    persistState(next)
    set(next)
    return nextIp
  },

  updateTopology: (nodes) => set(s => {
    const next = { ...s, topology: nodes }
    persistState(next)
    return next
  }),

  connectDevices: (fromId, toId) => set(s => {
    if (fromId === toId) return s
    const cableKey = [fromId, toId].sort().join('-')
    const exists = s.cables.some(c => {
      const cKey = [c.sourceNodeId, c.targetNodeId].sort().join('-')
      return cKey === cableKey
    })
    if (exists) return s

    const topology = s.topology.map(n => {
      if (n.id === fromId && !n.connections.includes(toId)) {
        return { ...n, connections: [...n.connections, toId] }
      }
      if (n.id === toId && !n.connections.includes(fromId)) {
        return { ...n, connections: [...n.connections, fromId] }
      }
      return n
    })

    const cable: CableMeta = {
      id: uid(), sourceNodeId: fromId, targetNodeId: toId,
      type: 'ethernet', speed: 1000, status: 'connected',
    }

    const next = { ...s, topology, cables: [...s.cables, cable],
      logs: [...s.logs, log(s, `Cable connected between nodes`, 'success')],
    }
    persistState(next)
    return next
  }),

  disconnectCable: (fromId, toId) => set(s => {
    const cables = s.cables.filter(c =>
      !(c.sourceNodeId === fromId && c.targetNodeId === toId) &&
      !(c.sourceNodeId === toId && c.targetNodeId === fromId)
    )
    const topology = s.topology.map(n => {
      if (n.id === fromId) return { ...n, connections: n.connections.filter(c => c !== toId) }
      if (n.id === toId) return { ...n, connections: n.connections.filter(c => c !== fromId) }
      return n
    })
    const next = { ...s, cables, topology, logs: [...s.logs, log(s, `Cable disconnected`, 'warn')] }
    persistState(next)
    return next
  }),

  addCable: (c) => set(s => {
    const cable: CableMeta = { ...c, id: uid() }
    const next = { ...s, cables: [...s.cables, cable] }
    persistState(next)
    return next
  }),

  removeCable: (id) => set(s => {
    const cables = s.cables.filter(c => c.id !== id)
    const next = { ...s, cables }
    persistState(next)
    return next
  }),

  updateCable: (id, upd) => set(s => {
    const cables = s.cables.map(c => c.id === id ? { ...c, ...upd } : c)
    const next = { ...s, cables }
    persistState(next)
    return next
  }),

  addPacketAnim: (sourceNodeId, targetNodeId, label) => set(s => {
    const packet: PacketAnim = {
      id: uid(), sourceNodeId, targetNodeId,
      label, progress: 0, timestamp: Date.now(),
    }
    const packets = [...s.packets, packet].slice(-20)
    const next = { ...s, packets }
    persistState(next)
    setTimeout(() => {
      const st = get()
      const updated = st.packets.filter(p => p.id !== packet.id)
      persistState({ ...st, packets: updated })
      set({ packets: updated })
    }, 2000)
    return next
  }),

  clearPackets: () => set(s => {
    const next = { ...s, packets: [] }
    persistState(next)
    return next
  }),

  pingDevice: (fromId, toId) => {
    const s = get()
    const fromDev = s.devices.find(d => d.id === fromId)
    const toDev = s.devices.find(d => d.id === toId)
    if (!fromDev || !toDev) return

    const fromNode = s.topology.find(n => n.deviceId === fromId)
    const toNode = s.topology.find(n => n.deviceId === toId)
    if (!fromNode || !toNode) return

    s.addPacketAnim(fromNode.id, toNode.id, 'PING')
    setTimeout(() => {
      s.addPacketAnim(toNode.id, fromNode.id, 'PONG')
      const connected = fromNode.connections.includes(toNode.id) || toNode.connections.includes(fromNode.id)
      s.addLog(
        connected ? `Ping from ${fromDev.name} to ${toDev.name}: ${Math.floor(Math.random() * 5 + 1)}ms` : `Ping from ${fromDev.name} to ${toDev.name}: Destination unreachable`,
        connected ? 'success' : 'error',
      )
    }, 500)
  },

  autoConfigure: (deviceId) => {
    const s = get()
    const dev = s.devices.find(d => d.id === deviceId)
    if (!dev) return

    const updates: Partial<Device> = {
      lastSeen: new Date().toISOString(),
      online: true,
      status: 'online' as DeviceStatus,
    }

    if (!dev.name || dev.name.startsWith('New ')) {
      const typeLabels: Record<string, string> = { printer: 'Printer', laptop: 'Laptop', desktop: 'Desktop', switch: 'Switch', 'access-point': 'AP' }
      const existing = s.devices.filter(d => d.type === dev.type).length
      updates.name = `${typeLabels[dev.type] || 'Device'}-${existing + 1}`
    }

    if (!dev.mac || dev.mac === '00:00:00:00:00:00') {
      updates.mac = generateMac()
    }

    if (!dev.subnet) updates.subnet = s.router.subnetMask
    if (!dev.gateway) updates.gateway = s.router.gateway

    if (!dev.manufacturer) {
      const mfgs: Record<string, string> = { printer: 'NetPrint', laptop: 'TechBook', desktop: 'DeskPro', switch: 'NetSwitch', router: 'NetRouter', 'access-point': 'AirWave' }
      updates.manufacturer = mfgs[dev.type] || 'Generic'
    }

    if (!dev.model) {
      updates.model = `${dev.type.charAt(0).toUpperCase() + dev.type.slice(1)}-${100 + Math.floor(Math.random() * 900)}`
    }

    if (!dev.firmware && dev.type === 'printer') {
      updates.firmware = `v2.1.${Math.floor(Math.random() * 5)}`
    }

    if (dev.ipMode === 'dhcp' && (!dev.ip || dev.ip === '0.0.0.0')) {
      const nextIp = s.assignDhcpIp(deviceId)
      if (nextIp) {
        updates.ip = nextIp
        s.addLease(updates.name || dev.name, updates.mac || dev.mac, nextIp)
      }
    }

    if (dev.connectionType === 'ethernet' && !dev.connectionSpeed) {
      updates.connectionSpeed = [100, 1000, 10000][Math.floor(Math.random() * 3)]
    }

    const devices = s.devices.map(d => d.id === deviceId ? { ...d, ...updates } : d)
    const next = { ...s, devices, logs: [...s.logs, log(s, `${updates.name || dev.name} configured successfully.`, 'success')] }
    persistState(next)
    set(next)
  },

  duplicateDevice: (deviceId) => {
    const s = get()
    const dev = s.devices.find(d => d.id === deviceId)
    if (!dev) return

    const newId = uid()
    const newNodeId = uid()
    const newDev: Device = {
      ...dev, id: newId,
      name: `${dev.name}-copy`,
      mac: generateMac(),
      ip: '',
      ipMode: 'dhcp',
      online: true,
      status: 'online',
    }

    const topoNode: TopologyNode = {
      id: newNodeId, deviceId: newId,
      x: (s.topology.find(n => n.deviceId === deviceId)?.x || 300) + 60,
      y: (s.topology.find(n => n.deviceId === deviceId)?.y || 300) + 60,
      connections: [],
    }

    const next = {
      ...s,
      devices: [...s.devices, newDev],
      topology: [...s.topology, topoNode],
      logs: [...s.logs, log(s, `Device "${dev.name}" duplicated as "${newDev.name}"`, 'info')],
    }
    persistState(next)
    set(next)
  },

  simulateAction: (action, deviceId) => {
    const s = get()
    const dev = deviceId ? s.devices.find(d => d.id === deviceId) : undefined
    let msg = ''
    let sev: LogEntry['severity'] = 'info'

    switch (action) {
      case 'disconnect':
        if (dev) {
          msg = `Cable disconnected: ${dev.name}`
          sev = 'warn'
          const devices = s.devices.map(d => d.id === deviceId ? { ...d, online: false, status: 'offline' as const } : d)
          const next = { ...s, devices, logs: [...s.logs, log(s, msg, sev)] }
          persistState(next)
          set(next)
        }
        return
      case 'reconnect':
        if (dev) {
          msg = `Cable reconnected: ${dev.name}`
          sev = 'success'
          const devices = s.devices.map(d => d.id === deviceId ? { ...d, online: true, status: 'online' as const } : d)
          const next = { ...s, devices, logs: [...s.logs, log(s, msg, sev)] }
          persistState(next)
          set(next)
        }
        return
      case 'restart-router':
        msg = 'Router restarting...'
        sev = 'warn'
        set(s => ({
          ...s,
          logs: [...s.logs, log(s, 'Router restarted', 'success')],
        }))
        return
      case 'restart-printer':
        msg = dev ? `Printer ${dev.name} restarting...` : 'Printer restarting...'
        sev = 'warn'
        set(s => ({
          ...s,
          logs: [...s.logs, log(s, msg, sev), log(s, `Printer ${dev?.name || ''} back online`, 'success')],
        }))
        return
      case 'ip-conflict':
        msg = dev ? `IP conflict detected on ${dev.name} (${dev.ip})` : 'IP conflict simulated'
        sev = 'error'
        break
      case 'simulate-unreachable':
        msg = dev ? `Printer ${dev.name} is unreachable` : 'Device unreachable'
        sev = 'error'
        break
      default:
        msg = `Action: ${action}`
    }
    set(s => {
      const next = { ...s, logs: [...s.logs, log(s, msg, sev)] }
      persistState(next)
      return next
    })
  },
}))
