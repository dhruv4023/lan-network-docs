import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store'
import { isValidIp, ipToNum } from '../utils/ip'
import { findNextAvailableIp } from '../utils/dhcp'
import type { DhcpReservation } from '../types'

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export default function DhcpPage() {
  const router = useStore(s => s.router)
  const reservations = useStore(s => s.reservations)
  const leases = useStore(s => s.leases)
  const devices = useStore(s => s.devices)
  const addReservation = useStore(s => s.addReservation)
  const removeReservation = useStore(s => s.removeReservation)
  const releaseLease = useStore(s => s.releaseLease)
  const renewLease = useStore(s => s.renewLease)
  const addLog = useStore(s => s.addLog)

  const [reserveMac, setReserveMac] = useState('')
  const [reserveIp, setReserveIp] = useState('')
  const [reserveHost, setReserveHost] = useState('')
  const [error, setError] = useState('')
  const [poolTab, setPoolTab] = useState<'reservations' | 'leases'>('reservations')

  function handleReserve() {
    setError('')
    if (!reserveMac.trim()) { setError('MAC address required'); return }
    if (!isValidIp(reserveIp)) { setError('Invalid IP address'); return }
    if (!reserveHost.trim()) { setError('Hostname required'); return }

    const existing = reservations.find(r => r.mac === reserveMac || r.ip === reserveIp)
    if (existing) { setError('MAC or IP already reserved'); return }

    addReservation({ mac: reserveMac, ip: reserveIp, hostname: reserveHost })
    setReserveMac('')
    setReserveIp('')
    setReserveHost('')
  }

  function handleAutoReserve() {
    setError('')
    const nextIp = findNextAvailableIp(
      router.dhcpRangeStart, router.dhcpRangeEnd, devices, reservations,
      [router.lanIp, router.gateway],
    )
    if (!nextIp) { setError('No available IPs in DHCP pool'); return }
    const mac = `00:${Math.random().toString(16).slice(2, 8)}:${Math.random().toString(16).slice(2, 8)}`
    setReserveMac(mac)
    setReserveIp(nextIp)
    setReserveHost(`Reserved-${nextIp.split('.')[3]}`)
  }

  const poolStart = ipToNum(router.dhcpRangeStart)
  const poolEnd = ipToNum(router.dhcpRangeEnd)
  const poolSize = poolEnd - poolStart + 1

  const poolCells = useMemo(() => {
    if (poolSize > 512 || poolSize < 1) return []
    const cells: { ip: string; status: 'free' | 'used' | 'reserved' | 'conflict' | 'excluded' }[] = []
    const excluded = new Set([router.lanIp, router.gateway])
    const usedMap = new Map<string, string[]>()
    devices.forEach(d => {
      if (d.ip) {
        if (!usedMap.has(d.ip)) usedMap.set(d.ip, [])
        usedMap.get(d.ip)!.push(d.name)
      }
    })
    const reservedIps = new Set(reservations.map(r => r.ip))
    const conflictIps = new Set<string>()
    usedMap.forEach((names, ip) => { if (names.length > 1) conflictIps.add(ip) })

    for (let i = poolStart; i <= poolEnd; i++) {
      const ip = [i >>> 24, (i >>> 16) & 255, (i >>> 8) & 255, i & 255].join('.')
      if (excluded.has(ip)) {
        cells.push({ ip, status: 'excluded' })
      } else if (conflictIps.has(ip)) {
        cells.push({ ip, status: 'conflict' })
      } else if (reservedIps.has(ip)) {
        cells.push({ ip, status: 'reserved' })
      } else if (usedMap.has(ip)) {
        cells.push({ ip, status: 'used' })
      } else {
        cells.push({ ip, status: 'free' })
      }
    }
    return cells
  }, [poolStart, poolEnd, poolSize, router, devices, reservations])

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1>DHCP Manager</h1>
          <p>
            DHCP is {router.dhcpEnabled ? 'enabled' : 'disabled'}
            &middot; Pool: {router.dhcpRangeStart} &ndash; {router.dhcpRangeEnd}
          </p>
        </div>
      </div>

      {!router.dhcpEnabled && (
        <div className="callout callout-warn">
          <strong>DHCP Disabled</strong> &mdash; Enable it in Router Configuration to use automatic IP assignment.
        </div>
      )}

      {poolCells.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold mt-0">IP Pool ({router.dhcpRangeStart} &ndash; {router.dhcpRangeEnd})</h2>
            <div className="flex items-center gap-3 text-[10px] text-muted">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-panel-2/60 border border-line/30 inline-block" /> Free</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-accent-dim/60 border border-accent/30 inline-block" /> Used</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-[#2a1f5e]/60 border border-[#9f8aff]/30 inline-block" /> Reserved</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-danger-dim/60 border border-danger/30 inline-block" /> Conflict</span>
            </div>
          </div>
          <div className="ip-pool-grid">
            {poolCells.map(cell => (
              <div
                key={cell.ip}
                className={`ip-pool-cell ${cell.status}`}
                title={`${cell.ip} (${cell.status})`}
              >
                {cell.ip.split('.')[3]}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="panel"
        >
          <h2 className="text-base font-semibold mt-0 mb-4">Create Reservation</h2>
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="MAC Address"
                className="input-field col-span-1"
                value={reserveMac}
                onChange={e => setReserveMac(e.target.value)}
              />
              <input
                type="text"
                placeholder="IP"
                className="input-field"
                value={reserveIp}
                onChange={e => setReserveIp(e.target.value)}
              />
              <input
                type="text"
                placeholder="Hostname"
                className="input-field"
                value={reserveHost}
                onChange={e => setReserveHost(e.target.value)}
              />
            </div>
            {error && <p className="text-danger text-xs">{error}</p>}
            <div className="flex gap-2">
              <button onClick={handleReserve} className="btn btn-primary text-xs">Reserve</button>
              <button onClick={handleAutoReserve} className="btn btn-ghost text-xs">Auto Fill</button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="panel"
        >
          <h2 className="text-base font-semibold mt-0 mb-3">Pool Summary</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              ['Total Pool', poolSize],
              ['Used', devices.filter(d => d.ip).length],
              ['Reserved', reservations.length],
              ['Free', Math.max(0, poolSize - devices.filter(d => d.ip).length - reservations.length - 2)],
            ].map(([l, v]) => (
              <div key={l as string} className="bg-panel-2/40 border border-line/40 rounded-lg p-3">
                <p className="text-muted text-[10px] uppercase tracking-wider">{l as string}</p>
                <p className="text-lg font-bold">{v as number}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="panel">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-base font-semibold mt-0">Reservations & Leases</h2>
          <div className="tabs mb-0 border-b-0">
            <button
              className={`tab !text-xs !px-3 !py-1.5 ${poolTab === 'reservations' ? 'is-active' : ''}`}
              onClick={() => setPoolTab('reservations')}
            >
              Reservations ({reservations.length})
            </button>
            <button
              className={`tab !text-xs !px-3 !py-1.5 ${poolTab === 'leases' ? 'is-active' : ''}`}
              onClick={() => setPoolTab('leases')}
            >
              Leases ({leases.length})
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {poolTab === 'reservations' ? (
            <motion.div
              key="reservations"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {reservations.length === 0 ? (
                <p className="text-muted text-sm py-4 text-center">No reservations configured.</p>
              ) : (
                <div className="space-y-2">
                  {reservations.map(r => (
                    <div key={r.id} className="flex items-center gap-3 bg-panel-2/40 border border-line/40 rounded-lg px-4 py-2.5 text-sm">
                      <code className="text-xs w-28 shrink-0">{r.mac}</code>
                      <code className="text-xs text-accent w-24 shrink-0">{r.ip}</code>
                      <span className="flex-1">{r.hostname}</span>
                      <span className={`badge text-xs ${r.status === 'active' ? 'badge-accent' : 'badge-warn'}`}>{r.status}</span>
                      <button onClick={() => removeReservation(r.id)} className="btn btn-ghost text-[10px] !px-2 !py-1">Delete</button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="leases"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {leases.length === 0 ? (
                <p className="text-muted text-sm py-4 text-center">No active leases.</p>
              ) : (
                <div className="space-y-2">
                  {leases.map(l => (
                    <div key={l.id} className="flex items-center gap-3 bg-panel-2/40 border border-line/40 rounded-lg px-4 py-2.5 text-sm">
                      <span className="flex-1">{l.hostname}</span>
                      <code className="text-xs text-muted w-20 shrink-0">{l.mac}</code>
                      <code className="text-xs text-accent w-20 shrink-0">{l.ip}</code>
                      <span className={`badge text-xs ${
                        l.status === 'active' ? 'badge-accent' :
                        l.status === 'expired' ? 'badge-warn' : 'badge-muted'
                      }`}>{l.status}</span>
                      <span className="text-muted text-[10px] w-16 shrink-0">{new Date(l.leaseExpiry).toLocaleDateString()}</span>
                      {l.status === 'active' && (
                        <div className="flex gap-1 shrink-0">
                          <button onClick={() => releaseLease(l.id)} className="btn btn-ghost text-[10px] !px-2 !py-1">Release</button>
                          <button onClick={() => renewLease(l.id)} className="btn btn-ghost text-[10px] !px-2 !py-1">Renew</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
