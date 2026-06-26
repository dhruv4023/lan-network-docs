export type DeviceType = 'printer' | 'laptop' | 'desktop' | 'router' | 'switch' | 'access-point'
export type ConnectionType = 'ethernet' | 'wifi'
export type IpMode = 'dhcp' | 'static'
export type DeviceStatus = 'online' | 'offline' | 'booting'
export type LogSeverity = 'info' | 'warn' | 'error' | 'success'
export type CableStatus = 'connected' | 'disconnected' | 'broken'

export interface RouterConfig {
  name: string
  lanIp: string
  subnetMask: string
  gateway: string
  dnsServer: string
  dhcpEnabled: boolean
  dhcpRangeStart: string
  dhcpRangeEnd: string
  leaseTime: number
}

export interface DevicePort {
  id: string
  label: string
  type: 'wan' | 'lan' | 'wifi' | 'usb'
}

export interface Device {
  id: string
  name: string
  type: DeviceType
  mac: string
  connectionType: ConnectionType
  ipMode: IpMode
  ip: string
  gateway: string
  subnet: string
  status: DeviceStatus
  firmware?: string
  manufacturer?: string
  model?: string
  connectionSpeed?: number
  lastSeen?: string
  online: boolean
  parentId?: string
}

export interface DhcpReservation {
  id: string
  mac: string
  ip: string
  hostname: string
  status: 'active' | 'inactive'
}

export interface DhcpLease {
  id: string
  hostname: string
  mac: string
  ip: string
  leaseStart: string
  leaseExpiry: string
  status: 'active' | 'expired' | 'released'
}

export interface TopologyNode {
  id: string
  deviceId: string
  x: number
  y: number
  connections: string[]
}

export interface CableMeta {
  id: string
  sourceNodeId: string
  targetNodeId: string
  type: ConnectionType
  speed: number
  status: CableStatus
}

export interface PacketAnim {
  id: string
  sourceNodeId: string
  targetNodeId: string
  label: string
  progress: number
  timestamp: number
}

export interface LogEntry {
  id: string
  timestamp: string
  message: string
  severity: LogSeverity
}

export interface DemoScenario {
  id: string
  name: string
  description: string
}

export interface IpCalcResult {
  networkAddress: string
  broadcastAddress: string
  cidr: number
  firstHost: string
  lastHost: string
  totalHosts: number
  usableHosts: number
  binaryIp: string
  binarySubnet: string
  binaryNetwork: string
  binaryBroadcast: string
}

export interface NetworkState {
  router: RouterConfig
  devices: Device[]
  reservations: DhcpReservation[]
  leases: DhcpLease[]
  topology: TopologyNode[]
  cables: CableMeta[]
  packets: PacketAnim[]
  logs: LogEntry[]
  settings: {
    theme: 'dark' | 'light'
    sidebarOpen: boolean
    activePage: string
  }
}
