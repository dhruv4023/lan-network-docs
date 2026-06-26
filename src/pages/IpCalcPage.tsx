import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { isValidIp, calcIp, maskToCidr } from '../utils/ip'
import type { IpCalcResult } from '../types'

const PRESETS = [
  { ip: '192.168.1.1', mask: '255.255.255.0', label: '/24 (Class C)' },
  { ip: '10.0.0.1', mask: '255.0.0.0', label: '/8 (Class A)' },
  { ip: '172.16.0.1', mask: '255.255.0.0', label: '/16 (Class B)' },
  { ip: '192.168.1.1', mask: '255.255.255.192', label: '/26 (64 hosts)' },
  { ip: '192.168.1.1', mask: '255.255.255.240', label: '/28 (16 hosts)' },
  { ip: '192.168.1.1', mask: '255.255.255.248', label: '/29 (8 hosts)' },
]

function OctetBitRow({ label, bits, highlight }: { label: string; bits: string; highlight?: 'network' | 'host' }) {
  const parts = bits.split('.')
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-muted w-16 shrink-0 text-[10px]">{label}</span>
      {parts.map((oct, i) => (
        <span key={i} className="font-mono tracking-wider">{oct}</span>
      ))}
      <span className="text-muted text-[9px] ml-1">/{maskToCidr(
        ['11111111', '11111111', '11111111', '00000000'].join('.')
      )}</span>
    </div>
  )
}

export default function IpCalcPage() {
  const [ip, setIp] = useState('192.168.1.1')
  const [mask, setMask] = useState('255.255.255.0')

  const valid = isValidIp(ip) && isValidIp(mask)
  const result = useMemo(() => valid ? calcIp(ip, mask) : null, [ip, mask, valid])

  const cidr = valid ? maskToCidr(mask) : 0
  const isClassful = [8, 16, 24].includes(cidr)

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1>IP Calculator</h1>
          <p>Calculate network information from IP and subnet mask</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="panel"
          >
            <h2 className="text-base font-semibold mt-0 mb-4">Input</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-muted text-xs mb-1.5">IP Address</label>
                <input
                  type="text"
                  className="input-field"
                  value={ip}
                  onChange={e => setIp(e.target.value)}
                  placeholder="e.g. 192.168.1.1"
                  autoComplete="off"
                  spellCheck={false}
                />
                {ip && !isValidIp(ip) && <p className="text-danger text-xs mt-1">Invalid IP address</p>}
              </div>
              <div>
                <label className="block text-muted text-xs mb-1.5">Subnet Mask</label>
                <input
                  type="text"
                  className="input-field"
                  value={mask}
                  onChange={e => setMask(e.target.value)}
                  placeholder="e.g. 255.255.255.0"
                  autoComplete="off"
                  spellCheck={false}
                />
                {mask && !isValidIp(mask) && <p className="text-danger text-xs mt-1">Invalid subnet mask</p>}
                {mask && isValidIp(mask) && (() => {
                  const octets = mask.split('.').map(Number)
                  const invalid = octets.some((o, i) => i < 3 && octets[i + 1] !== 0 && o !== 255)
                  if (invalid) return <p className="text-warn text-xs mt-1">Non-standard subnet mask</p>
                  return null
                })()}
              </div>
              {valid && (
                <div className="flex items-center gap-2">
                  <span className="text-muted text-xs">CIDR:</span>
                  <code className="text-sm font-bold text-accent">/{cidr}</code>
                  {!isClassful && (
                    <span className="badge badge-warn text-[10px]">Subnetted</span>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="panel"
          >
            <h2 className="text-base font-semibold mt-0 mb-3">Quick Presets</h2>
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map(p => (
                <button
                  key={p.label}
                  onClick={() => { setIp(p.ip); setMask(p.mask) }}
                  className="bg-panel-2/60 border border-line/60 rounded-lg px-3 py-2 text-xs text-left cursor-pointer hover:border-accent/60 transition-colors"
                >
                  <span className="block font-semibold">{p.ip}/{maskToCidr(p.mask)}</span>
                  <span className="text-muted text-[10px]">{p.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="lg:col-span-3">
          {result ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="panel">
                <h2 className="text-base font-semibold mt-0 mb-4">Network Details</h2>
                <div className="space-y-2">
                  {[
                    ['Network Address', result.networkAddress, 'text-accent'],
                    ['Broadcast Address', result.broadcastAddress, 'text-danger'],
                    ['First Usable Host', result.firstHost, 'text-accent'],
                    ['Last Usable Host', result.lastHost, 'text-warn'],
                    ['Total Hosts', result.totalHosts.toLocaleString(), 'text-fg'],
                    ['Usable Hosts', result.usableHosts.toLocaleString(), 'text-fg'],
                  ].map(([l, v, color]) => (
                    <div key={l as string} className="flex items-center gap-3 py-1.5 border-b border-line/40 last:border-0">
                      <span className="text-muted text-xs w-36 shrink-0">{l as string}</span>
                      <code className={`text-sm ${color}`}>{v as string}</code>
                    </div>
                  ))}
                </div>
              </div>

              <div className="panel">
                <h2 className="text-base font-semibold mt-0 mb-4">Binary Representation</h2>
                <div className="space-y-3">
                  {[
                    ['IP', result.binaryIp],
                    ['Mask', result.binarySubnet],
                    ['Network', result.binaryNetwork],
                    ['Broadcast', result.binaryBroadcast],
                  ].map(([l, v]) => {
                    const parts = (v as string).split('.')
                    const bitsPerOctet = parts.map(o => o.split('').filter(b => b === '1').length)
                    return (
                      <div key={l as string}>
                        <span className="text-muted text-[10px] block mb-0.5">{l as string}</span>
                        <div className="flex gap-1.5">
                          {(v as string).split('.').map((oct, i) => (
                            <span
                              key={i}
                              className="font-mono text-xs bg-bg-soft/60 px-2 py-1 rounded border border-line/40 block"
                            >
                              <span className="text-accent">{oct.slice(0, bitsPerOctet[i])}</span>
                              <span className="text-muted/50">{oct.slice(bitsPerOctet[i])}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
                <p className="text-muted text-[10px] mt-3">
                  <span className="text-accent">Green</span> = network bits &middot; <span className="text-muted/50">Gray</span> = host bits
                </p>
              </div>

              <div className="panel">
                <h2 className="text-base font-semibold mt-0 mb-3">Range Summary</h2>
                <div className="flex flex-col gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-muted w-24">Host Range</span>
                    <code className="text-accent">{result.firstHost}</code>
                    <span className="text-muted">&rarr;</span>
                    <code className="text-warn">{result.lastHost}</code>
                  </div>
                  <div className="progress-track h-2">
                    <motion.div
                      className="progress-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (result.usableHosts / result.totalHosts) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-muted">
                    <span>{result.usableHosts} usable of {result.totalHosts} total</span>
                    <span>{result.totalHosts - result.usableHosts} reserved (network + broadcast)</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="panel flex items-center justify-center h-48"
            >
              <p className="text-muted text-sm">Enter valid IP and subnet mask to see results</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
