import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store'
import type { LogSeverity } from '../types'

const severityConfig: Record<LogSeverity, { color: string; dot: string; label: string }> = {
  info: { color: 'text-accent', dot: 'bg-accent', label: 'Info' },
  warn: { color: 'text-warn', dot: 'bg-warn', label: 'Warning' },
  error: { color: 'text-danger', dot: 'bg-danger', label: 'Error' },
  success: { color: 'text-accent', dot: 'bg-accent', label: 'Success' },
}

export default function LogsPage() {
  const logs = useStore(s => s.logs)
  const addLog = useStore(s => s.addLog)

  const [filter, setFilter] = useState<LogSeverity | 'all'>('all')
  const [search, setSearch] = useState('')

  const filtered = logs.filter(l => {
    if (filter !== 'all' && l.severity !== filter) return false
    if (search && !l.message.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const grouped = filtered.reduce((acc, log) => {
    const date = new Date(log.timestamp).toLocaleDateString()
    if (!acc[date]) acc[date] = []
    acc[date].push(log)
    return acc
  }, {} as Record<string, typeof logs>)

  const counts = {
    all: logs.length,
    info: logs.filter(l => l.severity === 'info').length,
    warn: logs.filter(l => l.severity === 'warn').length,
    error: logs.filter(l => l.severity === 'error').length,
    success: logs.filter(l => l.severity === 'success').length,
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1>Event Log</h1>
          <p>{logs.length} event{logs.length !== 1 ? 's' : ''} recorded</p>
        </div>
        <button onClick={() => addLog('Event log cleared', 'warn')} className="btn btn-ghost text-xs">
          Clear
        </button>
      </div>

      <div className="panel">
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="tabs mb-0 border-b-0">
            {(['all', 'info', 'success', 'warn', 'error'] as const).map(s => (
              <button
                key={s}
                className={`tab !text-xs !px-3 !py-1.5 ${filter === s ? 'is-active' : ''}`}
                onClick={() => setFilter(s)}
              >
                {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                <span className="ml-1 text-[10px] opacity-60">({counts[s]})</span>
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Search events..."
            className="input-field !w-48 !text-xs"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {Object.keys(grouped).length === 0 ? (
          <div className="py-12 text-center text-muted text-sm">No events match your filter.</div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([date, entries]) => (
              <div key={date}>
                <p className="text-muted text-[10px] uppercase tracking-wider font-semibold mb-2">{date}</p>
                <div className="relative ml-2 pl-5 border-l-2 border-line/40 space-y-1">
                  {entries.map((log, i) => {
                    const cfg = severityConfig[log.severity]
                    return (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.02 }}
                        className="relative flex items-start gap-3 py-2 text-sm group"
                      >
                        <span className={`absolute -left-[21px] top-2.5 w-2.5 h-2.5 rounded-full border-2 border-bg ${cfg.dot}`} />
                        <span className={`text-[10px] font-semibold uppercase w-14 shrink-0 pt-0.5 ${cfg.color}`}>
                          {cfg.label}
                        </span>
                        <p className="flex-1 text-xs">{log.message}</p>
                        <span className="text-muted text-[10px] shrink-0 pt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
