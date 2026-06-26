import { ipToNum, numToIp } from './ip'
import type { Device, DhcpReservation } from '../types'

export function findNextAvailableIp(
  rangeStart: string,
  rangeEnd: string,
  devices: Device[],
  reservations: DhcpReservation[],
  excludeIps: string[],
): string | null {
  const start = ipToNum(rangeStart)
  const end = ipToNum(rangeEnd)

  const used = new Set<string>()
  devices.forEach(d => { if (d.ip) used.add(d.ip) })
  reservations.forEach(r => used.add(r.ip))
  excludeIps.forEach(ip => used.add(ip))

  for (let i = start; i <= end; i++) {
    const ip = numToIp(i)
    if (!used.has(ip)) return ip
  }
  return null
}

export function getLeaseExpiry(leaseTime: number, from?: Date): string {
  const d = from || new Date()
  return new Date(d.getTime() + leaseTime * 60000).toISOString()
}
