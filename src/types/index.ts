export type DeviceType = 'printer' | 'laptop' | 'desktop' | 'router' | 'switch' | 'access-point'
export type ConnectionType = 'ethernet' | 'wifi'
export type IpMode = 'dhcp' | 'static'
export type DeviceStatus = 'online' | 'offline'
export type LogSeverity = 'info' | 'warn' | 'error' | 'success'

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
  logs: LogEntry[]
  settings: {
    theme: 'dark' | 'light'
    sidebarOpen: boolean
    activePage: string
  }
}
