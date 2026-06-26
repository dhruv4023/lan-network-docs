import { motion } from 'framer-motion'
import { useStore } from '../store'
import { calcIp } from '../utils/ip'
import { SCENARIOS } from '../data/scenarios'

function StatCard({ label, value, color, index }: { label: string; value: string | number; color: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="stat-card"
    >
      <p className="stat-label">{label}</p>
      <p className={`stat-value ${color}`}>{value}</p>
    </motion.div>
  )
}

export default function Dashboard() {
  const devices = useStore(s => s.devices)
  const router = useStore(s => s.router)
  const reservations = useStore(s => s.reservations)
  const logs = useStore(s => s.logs)
  const applyScenario = useStore(s => s.applyScenario)
  const resetNetwork = useStore(s => s.resetNetwork)
  const ipInfo = calcIp(router.lanIp, router.subnetMask)

  const total = devices.length
  const online = devices.filter(d => d.online).length
  const offline = total - online
  const dhcpCount = devices.filter(d => d.ipMode === 'dhcp').length
  const staticCount = devices.filter(d => d.ipMode === 'static').length
  const freeIps = ipInfo.usableHosts - devices.length - reservations.length

  const usagePct = Math.round((1 - Math.max(0, freeIps) / ipInfo.usableHosts) * 100)

  const recentLogs = [...logs].reverse().slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Network configuration overview</p>
        </div>
        <button onClick={resetNetwork} className="btn btn-ghost text-xs">
          Reset Network
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <StatCard label="Total Devices" value={total} color="text-fg" index={0} />
        <StatCard label="Online" value={online} color="text-accent" index={1} />
        <StatCard label="Offline" value={offline} color="text-danger" index={2} />
        <StatCard label="DHCP / Static" value={`${dhcpCount} / ${staticCount}`} color="text-fg" index={3} />
        <StatCard label="Reserved IPs" value={reservations.length} color="text-warn" index={4} />
        <StatCard label="Free IPs" value={Math.max(0, freeIps)} color={freeIps > 0 ? 'text-accent' : 'text-danger'} index={5} />
        <StatCard label="IP Usage" value={`${usagePct}%`} color="text-fg" index={6} />
        <StatCard label="Subnet" value={`${router.lanIp}/${ipInfo.cidr}`} color="text-muted" index={7} />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="panel">
          <h2 className="text-base font-semibold mt-0 mb-1">IP Usage</h2>
          <p className="text-muted text-xs mb-3">{Math.max(0, freeIps)} of {ipInfo.usableHosts} IPs available</p>
          <div className="progress-track h-2.5">
            <motion.div
              className="progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${usagePct}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted mt-1.5">
            <span>Used: {total + reservations.length}</span>
            <span>Free: {Math.max(0, freeIps)}</span>
          </div>
        </div>

        <div className="panel">
          <h2 className="text-base font-semibold mt-0 mb-3">Router Status</h2>
          <div className="space-y-2 text-sm">
            {[
              ['Name', router.name],
              ['LAN IP', router.lanIp],
              ['Subnet', router.subnetMask],
              ['DHCP', router.dhcpEnabled ? 'Enabled' : 'Disabled'],
              ['Pool', `${router.dhcpRangeStart} - ${router.dhcpRangeEnd}`],
              ['DNS', router.dnsServer],
            ].map(([l, v]) => (
              <div key={l as string} className="flex items-center gap-3">
                <span className="text-muted w-24 shrink-0 text-xs">{l as string}</span>
                <code className="text-xs flex-1 truncate">{v as string}</code>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="panel">
        <h2 className="text-base font-semibold mt-0 mb-4">Demo Scenarios</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {SCENARIOS.map((sc, i) => (
            <motion.button
              key={sc.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              onClick={() => applyScenario(sc.id)}
              className="bg-panel-2/60 border border-line/60 rounded-xl p-3.5 text-left cursor-pointer
                hover:border-accent/60 hover:bg-accent-dim/30 transition-all duration-200 group"
            >
              <p className="font-semibold text-sm mb-1 group-hover:text-accent transition-colors">{sc.name}</p>
              <p className="text-muted text-xs">{sc.description}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {recentLogs.length > 0 && (
        <div className="panel">
          <h2 className="text-base font-semibold mt-0 mb-3">Recent Events</h2>
          <div className="space-y-1.5">
            {recentLogs.map(log => (
              <div key={log.id} className="flex items-start gap-3 text-sm py-1.5 border-b border-line/40 last:border-0">
                <span className={`status-dot ${log.severity === 'error' ? 'offline' : 'online'} mt-1 shrink-0`} />
                <p className="flex-1 text-xs">{log.message}</p>
                <span className="text-muted text-[10px] shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
