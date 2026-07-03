export function isValidIp(value: string): boolean {
  const parts = value.trim().split('.')
  if (parts.length !== 4) return false
  return parts.every(part => {
    if (!/^\d+$/.test(part)) return false
    const num = Number(part)
    return num >= 0 && num <= 255 && String(num) === String(Number(part))
  })
}

export function maskToCidr(mask: string): number | null {
  if (!isValidIp(mask)) return null
  const binary = mask
    .split('.')
    .map(part => Number(part).toString(2).padStart(8, '0'))
    .join('')
  if (!/^1*0*$/.test(binary)) return null
  return binary.indexOf('0') === -1 ? 32 : binary.indexOf('0')
}

export function networkAddress(ip: string, mask: string): string {
  if (!isValidIp(ip) || !isValidIp(mask)) return 'Unknown'
  return ip
    .split('.')
    .map((part, index) => Number(part) & Number(mask.split('.')[index]))
    .join('.')
}

export function suggestLaptopIp(printerIp: string): string {
  if (!isValidIp(printerIp)) return '192.168.1.10'
  const parts = printerIp.split('.').map(Number)
  const host = parts[3]
  parts[3] = host >= 250 ? host - 1 : host + 1
  if (parts[3] === 0) parts[3] = 2
  if (parts[3] === 255) parts[3] = 254
  return parts.join('.')
}

export function finalPrinterIp(index: number): string {
  return `192.168.1.${11 + index}`
}

export function routerLaptopIp(): string {
  return '192.168.1.10'
}

export function routerGatewayIp(): string {
  return '192.168.1.1'
}

export function cidrLabel(mask: string): string {
  const cidr = maskToCidr(mask)
  return cidr === null ? 'Unknown' : `/${cidr}`
}
