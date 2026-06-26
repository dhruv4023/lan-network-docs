import type { IpCalcResult } from '../types'

export function isValidIp(v: string): boolean {
  const parts = v.trim().split('.')
  if (parts.length !== 4) return false
  return parts.every(p => /^\d{1,3}$/.test(p) && Number(p) >= 0 && Number(p) <= 255)
}

export function ipToNum(ip: string): number {
  return ip.split('.').reduce((acc, oct) => (acc << 8) + parseInt(oct, 10), 0) >>> 0
}

export function numToIp(n: number): string {
  return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.')
}

export function maskToCidr(mask: string): number {
  return ipToNum(mask).toString(2).split('1').length - 1
}

export function cidrToMask(cidr: number): string {
  const n = (~0 << (32 - cidr)) >>> 0
  return numToIp(n)
}

export function networkAddress(ip: string, mask: string): string {
  return numToIp(ipToNum(ip) & ipToNum(mask))
}

export function broadcastAddress(ip: string, mask: string): string {
  return numToIp(ipToNum(ip) | ~ipToNum(mask) >>> 0)
}

export function firstHost(ip: string, mask: string): string {
  return numToIp((ipToNum(ip) & ipToNum(mask)) + 1)
}

export function lastHost(ip: string, mask: string): string {
  return numToIp((ipToNum(ip) | ~ipToNum(mask) >>> 0) - 1)
}

export function totalHosts(mask: string): number {
  return 2 ** (32 - maskToCidr(mask))
}

export function usableHosts(mask: string): number {
  const t = totalHosts(mask)
  return t > 2 ? t - 2 : 0
}

export function calcIp(ip: string, mask: string): IpCalcResult {
  const cidr = maskToCidr(mask)
  return {
    networkAddress: networkAddress(ip, mask),
    broadcastAddress: broadcastAddress(ip, mask),
    cidr,
    firstHost: firstHost(ip, mask),
    lastHost: lastHost(ip, mask),
    totalHosts: totalHosts(mask),
    usableHosts: usableHosts(mask),
    binaryIp: ip.split('.').map(o => parseInt(o).toString(2).padStart(8, '0')).join('.'),
    binarySubnet: mask.split('.').map(o => parseInt(o).toString(2).padStart(8, '0')).join('.'),
    binaryNetwork: networkAddress(ip, mask).split('.').map(o => parseInt(o).toString(2).padStart(8, '0')).join('.'),
    binaryBroadcast: broadcastAddress(ip, mask).split('.').map(o => parseInt(o).toString(2).padStart(8, '0')).join('.'),
  }
}

export function generateMac(): string {
  const hex = '0123456789abcdef'
  return Array.from({ length: 6 }, () =>
    hex[Math.floor(Math.random() * 16)] + hex[Math.floor(Math.random() * 16)]
  ).join(':')
}

export function ipInRange(ip: string, start: string, end: string): boolean {
  const n = ipToNum(ip)
  return n >= ipToNum(start) && n <= ipToNum(end)
}

export function isReservedIp(ip: string, routerIp: string, gateway: string, broadcast: string): boolean {
  return ip === routerIp || ip === gateway || ip === broadcast || ip === networkAddress(ip, '255.255.255.0')
}

export function sortIps(ips: string[]): string[] {
  return ips.sort((a, b) => ipToNum(a) - ipToNum(b))
}
