import { create } from 'zustand'
import { persistState, loadState, clearAll } from '../lib/storage'
import * as ip from '../utils/ip'
import { findNextAvailableIp, getLeaseExpiry } from '../utils/dhcp'
import { getDefaultState, generateMac } from '../data/scenarios'
import type {
  NetworkState, RouterConfig, Device, DhcpReservation,
  DhcpLease, LogEntry, TopologyNode, DeviceStatus,
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
  updateTopology: (nodes: TopologyNode[]) => void
  connectDevices: (fromId: string, toId: string) => void
  simulateAction: (action: string, deviceId?: string) => void
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
    const next = {
      ...s,
      devices,
      topology,
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
      return { ...d, status: online ? 'online' as DeviceStatus : 'offline' as DeviceStatus, online }
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

    function makeDev(name: string, type: Device['type'], ip: string, online = true): Device {
      return {
        id: uid(), name, type, mac: generateMac(), connectionType: 'ethernet', ipMode: 'static',
        ip, gateway: '192.168.1.1', subnet: '255.255.255.0',
        status: online ? 'online' : 'offline', online,
        firmware: type === 'printer' ? `v2.1.${Math.floor(Math.random() * 5)}` : undefined,
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
          makeDev('Printer-1', 'printer', '192.168.1.100'),
          makeDev('Printer-2', 'printer', '192.168.1.101'),
        ]
        break
      case 'office':
        devices = [
          makeDev('Switch-1', 'switch', '192.168.1.2'),
          ...Array.from({ length: 10 }, (_, i) => makeDev(`Printer-${i + 1}`, 'printer', `192.168.1.${110 + i}`)),
          ...Array.from({ length: 5 }, (_, i) => makeDev(`Laptop-${i + 1}`, 'laptop', `192.168.1.${20 + i}`)),
        ]
        break
      case 'warehouse': {
        devices = [
          makeDev('Switch-1', 'switch', '192.168.1.2'),
          makeDev('Switch-2', 'switch', '192.168.1.3'),
          ...Array.from({ length: 10 }, (_, i) => makeDev(`Printer-R1-${i + 1}`, 'printer', `192.168.1.${120 + i}`)),
          ...Array.from({ length: 10 }, (_, i) => makeDev(`Printer-R2-${i + 1}`, 'printer', `192.168.1.${150 + i}`)),
        ]
        break
      }
      case 'out-of-range':
        router = { ...router, lanIp: '192.168.1.1', subnetMask: '255.255.255.0', dhcpRangeStart: '192.168.1.100', dhcpRangeEnd: '192.168.1.200' }
        devices = [
          makeDev('Printer-1', 'printer', '192.168.192.168'),
        ]
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
    }

    const next: NetworkState = {
      ...s, router, devices, reservations, logs,
      leases: [], settings: { ...s.settings, activePage: 'dashboard' },
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
    const nextIp = findNextAvailableIp(s.router.dhcpRangeStart, s.router.dhcpRangeEnd, s.devices, s.reservations, exclude)
    return nextIp
  },

  updateTopology: (nodes) => set(s => {
    const next = { ...s, topology: nodes }
    persistState(next)
    return next
  }),

  connectDevices: (fromId, toId) => set(s => {
    const topology = s.topology.map(n => {
      if (n.id === fromId && !n.connections.includes(toId)) {
        return { ...n, connections: [...n.connections, toId] }
      }
      if (n.id === toId && !n.connections.includes(fromId)) {
        return { ...n, connections: [...n.connections, fromId] }
      }
      return n
    })
    const next = { ...s, topology }
    persistState(next)
    return next
  }),

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
        const router = { ...s.router }
        const next = {
          ...s,
          router,
          logs: [...s.logs, log(s, 'Router restarted', 'success')],
        }
        persistState(next)
        set(next)
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
