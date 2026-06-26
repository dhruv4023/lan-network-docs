import { useStore } from '../store'
import { calcIp } from '../utils/ip'
import { SCENARIOS } from '../data/scenarios'

export default function Dashboard() {
  const devices = useStore(s => s.devices)
  const router = useStore(s => s.router)
  const reservations = useStore(s => s.reservations)
  const applyScenario = useStore(s => s.applyScenario)
  const resetNetwork = useStore(s => s.resetNetwork)
  const ipInfo = calcIp(router.lanIp, router.subnetMask)

  const total = devices.length
  const online = devices.filter(d => d.online).length
  const offline = total - online
  const dhcpCount = devices.filter(d => d.ipMode === 'dhcp').length
  const staticCount = devices.filter(d => d.ipMode === 'static').length
  const freeIps = ipInfo.usableHosts - devices.length - reservations.length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
          <p className="text-muted text-sm">Network configuration overview</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={resetNetwork}
            className="btn btn-ghost text-xs"
          >
            Reset Network
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Devices', value: total, color: 'text-fg' },
          { label: 'Online', value: online, color: 'text-accent' },
          { label: 'Offline', value: offline, color: 'text-danger' },
          { label: 'DHCP / Static', value: `${dhcpCount} / ${staticCount}`, color: 'text-fg' },
          { label: 'Reserved IPs', value: reservations.length, color: 'text-warn' },
          { label: 'Free IPs', value: Math.max(0, freeIps), color: freeIps > 0 ? 'text-accent' : 'text-danger' },
          { label: 'IP Usage', value: `${Math.round((1 - Math.max(0, freeIps) / ipInfo.usableHosts) * 100)}%`, color: 'text-fg' },
          { label: 'Subnet', value: `${router.lanIp}/${ipInfo.cidr}`, color: 'text-muted' },
        ].map(stat => (
          <div key={stat.label} className="bg-panel border border-line rounded-lg p-4">
            <p className="text-muted text-xs mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-panel border border-line rounded-lg p-5">
        <h2 className="text-lg font-semibold mt-0 mb-3">Demo Scenarios</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {SCENARIOS.map(sc => (
            <button
              key={sc.id}
              onClick={() => applyScenario(sc.id)}
              className="bg-panel-2 border border-line rounded-lg p-3 text-left cursor-pointer hover:border-accent transition-colors"
            >
              <p className="font-semibold text-sm mb-1">{sc.name}</p>
              <p className="text-muted text-xs">{sc.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-panel border border-line rounded-lg p-5">
          <h2 className="text-lg font-semibold mt-0 mb-3">Router Status</h2>
          <div className="space-y-2 text-sm">
            {[
              ['Name', router.name],
              ['LAN IP', router.lanIp],
              ['Subnet Mask', router.subnetMask],
              ['DHCP', router.dhcpEnabled ? 'Enabled' : 'Disabled'],
              ['DHCP Pool', `${router.dhcpRangeStart} - ${router.dhcpRangeEnd}`],
              ['DNS', router.dnsServer],
            ].map(([l, v]) => (
              <div key={l as string} className="flex items-center gap-3">
                <span className="text-muted w-28 shrink-0">{l as string}</span>
                <span>{v as string}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-panel border border-line rounded-lg p-5">
          <h2 className="text-lg font-semibold mt-0 mb-3">Subnet Info</h2>
          <div className="space-y-2 text-sm">
            {[
              ['Network', ipInfo.networkAddress],
              ['Broadcast', ipInfo.broadcastAddress],
              ['CIDR', `/${ipInfo.cidr}`],
              ['First Host', ipInfo.firstHost],
              ['Last Host', ipInfo.lastHost],
              ['Usable Hosts', ipInfo.usableHosts],
            ].map(([l, v]) => (
              <div key={l as string} className="flex items-center gap-3">
                <span className="text-muted w-28 shrink-0">{l as string}</span>
                <span className="font-mono text-xs">{v as string}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
