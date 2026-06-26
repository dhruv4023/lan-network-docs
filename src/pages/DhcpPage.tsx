import { useState } from 'react'
import { useStore } from '../store'
import { isValidIp } from '../utils/ip'
import { findNextAvailableIp, getLeaseExpiry } from '../utils/dhcp'
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
  const addLease = useStore(s => s.addLease)
  const addLog = useStore(s => s.addLog)
  const simulateAction = useStore(s => s.simulateAction)

  const [reserveMac, setReserveMac] = useState('')
  const [reserveIp, setReserveIp] = useState('')
  const [reserveHost, setReserveHost] = useState('')
  const [error, setError] = useState('')

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">DHCP Manager</h1>
        <p className="text-muted text-sm">
          DHCP is {router.dhcpEnabled ? 'enabled' : 'disabled'} &middot; Pool: {router.dhcpRangeStart} &ndash; {router.dhcpRangeEnd}
        </p>
      </div>

      {!router.dhcpEnabled && (
        <div className="bg-warn-dim border border-warn rounded-lg p-4 text-sm text-warn">
          DHCP is disabled on this router. Enable it in Router Configuration to use automatic IP assignment.
        </div>
      )}

      <div className="bg-panel border border-line rounded-lg p-5">
        <h2 className="text-lg font-semibold mt-0 mb-4">Reservations</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          <input
            type="text"
            placeholder="MAC Address"
            className="bg-bg-soft border border-line rounded-md px-3 py-2 text-sm text-fg font-mono focus:outline-none focus:border-accent flex-1 min-w-[140px]"
            value={reserveMac}
            onChange={e => setReserveMac(e.target.value)}
          />
          <input
            type="text"
            placeholder="IP Address"
            className="bg-bg-soft border border-line rounded-md px-3 py-2 text-sm text-fg font-mono focus:outline-none focus:border-accent w-[140px]"
            value={reserveIp}
            onChange={e => setReserveIp(e.target.value)}
          />
          <input
            type="text"
            placeholder="Hostname"
            className="bg-bg-soft border border-line rounded-md px-3 py-2 text-sm text-fg focus:outline-none focus:border-accent flex-1 min-w-[100px]"
            value={reserveHost}
            onChange={e => setReserveHost(e.target.value)}
          />
          <button onClick={handleReserve} className="btn btn-primary text-xs">Reserve</button>
          <button onClick={handleAutoReserve} className="btn btn-ghost text-xs">Auto</button>
        </div>
        {error && <p className="text-danger text-xs mb-3">{error}</p>}

        {reservations.length === 0 ? (
          <p className="text-muted text-sm">No reservations configured.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-panel-2">
                {['MAC', 'Reserved IP', 'Hostname', 'Status', ''].map(h => (
                  <th key={h} className="text-left px-3 py-2 text-muted text-xs uppercase tracking-wider font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reservations.map(r => (
                <tr key={r.id} className="border-t border-line">
                  <td className="px-3 py-2 font-mono text-xs">{r.mac}</td>
                  <td className="px-3 py-2 font-mono text-xs text-accent">{r.ip}</td>
                  <td className="px-3 py-2">{r.hostname}</td>
                  <td className="px-3 py-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${r.status === 'active' ? 'bg-accent-dim text-accent' : 'bg-warn-dim text-warn'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <button onClick={() => removeReservation(r.id)} className="text-xs px-2 py-1 rounded bg-danger-dim text-danger border border-danger-dim cursor-pointer">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-panel border border-line rounded-lg p-5">
        <h2 className="text-lg font-semibold mt-0 mb-4">Active Leases</h2>
        {leases.length === 0 ? (
          <p className="text-muted text-sm">No active leases.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-panel-2">
                {['Hostname', 'MAC', 'IP', 'Lease Start', 'Expiry', 'Status', ''].map(h => (
                  <th key={h} className="text-left px-3 py-2 text-muted text-xs uppercase tracking-wider font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leases.map(l => (
                <tr key={l.id} className="border-t border-line">
                  <td className="px-3 py-2">{l.hostname}</td>
                  <td className="px-3 py-2 font-mono text-xs">{l.mac}</td>
                  <td className="px-3 py-2 font-mono text-xs text-accent">{l.ip}</td>
                  <td className="px-3 py-2 text-xs text-muted">{new Date(l.leaseStart).toLocaleString()}</td>
                  <td className="px-3 py-2 text-xs text-muted">{new Date(l.leaseExpiry).toLocaleString()}</td>
                  <td className="px-3 py-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      l.status === 'active' ? 'bg-accent-dim text-accent' :
                      l.status === 'expired' ? 'bg-warn-dim text-warn' : 'bg-panel-2 text-muted'
                    }`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1">
                      {l.status === 'active' && (
                        <>
                          <button onClick={() => releaseLease(l.id)} className="text-xs px-2 py-0.5 rounded bg-warn-dim text-warn border border-warn-dim cursor-pointer">Release</button>
                          <button onClick={() => renewLease(l.id)} className="text-xs px-2 py-0.5 rounded bg-accent-dim text-accent border border-accent-dim cursor-pointer">Renew</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
