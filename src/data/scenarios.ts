import type { DemoScenario } from '../types'

export const SCENARIOS: DemoScenario[] = [
  { id: 'home', name: 'Home Network', description: 'Router + Laptop + 2 Printers' },
  { id: 'office', name: 'Office Network', description: 'Router + Switch + 10 Printers + 5 Laptops' },
  { id: 'warehouse', name: 'Warehouse', description: 'Router + Multiple Switches + 20 Printers' },
  { id: 'out-of-range', name: 'Printer Outside Router Range', description: 'Printer on 192.168.192.x, Router on 192.168.1.x' },
  { id: 'duplicate-ip', name: 'Duplicate Static IP', description: 'Two printers sharing the same IP' },
  { id: 'dhcp-reservation', name: 'Correct DHCP Reservation', description: 'Printer always receives the same IP' },
  { id: 'school-lab', name: 'School Lab', description: 'Switch + 10 Desktops + 1 Printer' },
  { id: 'coffee-shop', name: 'Coffee Shop', description: '3 Access Points + 8 WiFi Laptops' },
  { id: 'enterprise', name: 'Enterprise', description: 'Mixed: 2 Switches, 2 APs, 5 Desktops, 5 Laptops, 3 Printers' },
  { id: 'smart-office', name: 'Smart Office', description: 'Switch + 3 APs + 4 Desktops + 4 Laptops + 2 Printers' },
  { id: 'reservation-explained', name: 'DHCP Reservation Explained', description: 'Printer-1 has a reservation for .50; other devices pull from the pool' },
]

export function generateMac(): string {
  const hex = '0123456789abcdef'
  return Array.from({ length: 6 }, () =>
    hex[Math.floor(Math.random() * 16)] + hex[Math.floor(Math.random() * 16)]
  ).join(':')
}

function makeDevice(name: string, type: 'printer' | 'laptop' | 'desktop' | 'switch', ip: string, online = true) {
  return {
    id: `${type}-${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name,
    type,
    mac: generateMac(),
    connectionType: 'ethernet' as const,
    ipMode: 'static' as const,
    ip,
    gateway: '192.168.1.1',
    subnet: '255.255.255.0',
    status: (online ? 'online' : 'offline') as 'online' | 'offline',
    firmware: type === 'printer' ? 'v2.1.4' : undefined,
    online,
  }
}

export function getDefaultState() {
  return {
    router: {
      name: 'Main Router',
      lanIp: '192.168.1.1',
      subnetMask: '255.255.255.0',
      gateway: '192.168.1.1',
      dnsServer: '8.8.8.8',
      dhcpEnabled: true,
      dhcpRangeStart: '192.168.1.2',
      dhcpRangeEnd: '192.168.1.254',
      leaseTime: 1440,
    },
    devices: [
      makeDevice('Switch-1', 'switch', '192.168.1.2', true),
      makeDevice('Laptop-1', 'laptop', '192.168.1.10', true),
      makeDevice('Printer-1', 'printer', '192.168.1.100', true),
      makeDevice('Printer-2', 'printer', '192.168.1.101', true),
    ],
    reservations: [] as Array<{ id: string; mac: string; ip: string; hostname: string; status: 'active' | 'inactive' }>,
    leases: [] as Array<{ id: string; hostname: string; mac: string; ip: string; leaseStart: string; leaseExpiry: string; status: 'active' | 'expired' | 'released' }>,
    topology: [
      { id: 'topo-router', deviceId: '', x: 400, y: 50, connections: ['topo-switch'] },
      { id: 'topo-switch', deviceId: '', x: 400, y: 160, connections: ['topo-router', 'topo-laptop', 'topo-p1', 'topo-p2'] },
      { id: 'topo-laptop', deviceId: '', x: 250, y: 300, connections: ['topo-switch'] },
      { id: 'topo-p1', deviceId: '', x: 400, y: 300, connections: ['topo-switch'] },
      { id: 'topo-p2', deviceId: '', x: 550, y: 300, connections: ['topo-switch'] },
    ],
  }
}
