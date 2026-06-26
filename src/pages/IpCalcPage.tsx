import { useState } from 'react'
import { isValidIp, calcIp } from '../utils/ip'
import type { IpCalcResult } from '../types'

export default function IpCalcPage() {
  const [ip, setIp] = useState('192.168.1.1')
  const [mask, setMask] = useState('255.255.255.0')

  const valid = isValidIp(ip) && isValidIp(mask)
  const result: IpCalcResult | null = valid ? calcIp(ip, mask) : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">IP Calculator</h1>
        <p className="text-muted text-sm">Calculate network information from IP and subnet mask</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-panel border border-line rounded-lg p-5">
            <h2 className="text-lg font-semibold mt-0 mb-4">Input</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-muted text-xs mb-1">IP Address</label>
                <input
                  type="text"
                  className="w-full bg-bg-soft border border-line rounded-md px-3 py-2 text-sm text-fg font-mono focus:outline-none focus:border-accent"
                  value={ip}
                  onChange={e => setIp(e.target.value)}
                  placeholder="e.g. 192.168.1.1"
                />
                {ip && !isValidIp(ip) && <p className="text-danger text-xs mt-1">Invalid IP address</p>}
              </div>
              <div>
                <label className="block text-muted text-xs mb-1">Subnet Mask</label>
                <input
                  type="text"
                  className="w-full bg-bg-soft border border-line rounded-md px-3 py-2 text-sm text-fg font-mono focus:outline-none focus:border-accent"
                  value={mask}
                  onChange={e => setMask(e.target.value)}
                  placeholder="e.g. 255.255.255.0"
                />
                {mask && !isValidIp(mask) && <p className="text-danger text-xs mt-1">Invalid subnet mask</p>}
                {mask && isValidIp(mask) && (() => {
                  const octets = mask.split('.').map(Number)
                  const invalid = octets.some((o, i) => {
                    if (i < 3 && octets[i + 1] !== 0 && o !== 255) return true
                    return false
                  })
                  if (invalid) return <p className="text-warn text-xs mt-1">Warning: Non-standard subnet mask</p>
                  return null
                })()}
              </div>
            </div>
          </div>

          <div className="bg-panel border border-line rounded-lg p-5">
            <h2 className="text-lg font-semibold mt-0 mb-3">Quick Presets</h2>
            <div className="grid grid-cols-2 gap-2">
              {[
                { ip: '192.168.1.1', mask: '255.255.255.0', label: '/24 (Class C)' },
                { ip: '10.0.0.1', mask: '255.0.0.0', label: '/8 (Class A)' },
                { ip: '172.16.0.1', mask: '255.255.0.0', label: '/16 (Class B)' },
                { ip: '192.168.1.1', mask: '255.255.255.192', label: '/26 (64 hosts)' },
                { ip: '192.168.1.1', mask: '255.255.255.240', label: '/28 (16 hosts)' },
                { ip: '192.168.1.1', mask: '255.255.255.248', label: '/29 (8 hosts)' },
              ].map(p => (
                <button
                  key={p.label}
                  onClick={() => { setIp(p.ip); setMask(p.mask) }}
                  className="bg-panel-2 border border-line rounded-md px-3 py-2 text-xs text-left cursor-pointer hover:border-accent transition-colors"
                >
                  <span className="block font-semibold">{p.ip}/{maskToCidr(p.mask)}</span>
                  <span className="text-muted">{p.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          {result ? (
            <div className="bg-panel border border-line rounded-lg p-5">
              <h2 className="text-lg font-semibold mt-0 mb-4">Results</h2>
              <div className="space-y-3">
                {[
                  ['Network Address', result.networkAddress],
                  ['Broadcast Address', result.broadcastAddress],
                  ['CIDR Notation', `/${result.cidr}`],
                  ['First Usable Host', result.firstHost],
                  ['Last Usable Host', result.lastHost],
                  ['Total Hosts', result.totalHosts],
                  ['Usable Hosts', result.usableHosts],
                ].map(([l, v]) => (
                  <div key={l as string} className="flex items-center gap-3 py-1.5 border-b border-line last:border-0">
                    <span className="text-muted text-xs w-36 shrink-0">{l as string}</span>
                    <span className="font-mono text-sm">{String(v)}</span>
                  </div>
                ))}
              </div>

              <h3 className="text-sm font-semibold mt-5 mb-3">Binary Representation</h3>
              <div className="space-y-2">
                {[
                  ['IP Address', result.binaryIp],
                  ['Subnet Mask', result.binarySubnet],
                  ['Network Address', result.binaryNetwork],
                  ['Broadcast', result.binaryBroadcast],
                ].map(([l, v]) => (
                  <div key={l as string}>
                    <span className="text-muted text-[10px] block mb-0.5">{l as string}</span>
                    <code className="font-mono text-xs bg-bg-soft px-2 py-1 rounded block break-all">{v as string}</code>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-panel border border-line rounded-lg p-5 flex items-center justify-center h-48">
              <p className="text-muted text-sm">Enter valid IP and subnet mask to see results</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function maskToCidr(mask: string): number {
  return mask.split('.').reduce((acc, oct) => acc + parseInt(oct).toString(2).split('1').length - 1, 0)
}
