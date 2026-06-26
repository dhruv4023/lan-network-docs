import { useStore } from '../store'
import type { LogSeverity } from '../types'

export default function LogsPage() {
  const logs = useStore(s => s.logs)
  const addLog = useStore(s => s.addLog)

  const severityStyles: Record<LogSeverity, string> = {
    info: 'border-l-accent',
    warn: 'border-l-warn',
    error: 'border-l-danger',
    success: 'border-l-accent',
  }

  const severityColors: Record<LogSeverity, string> = {
    info: 'text-accent',
    warn: 'text-warn',
    error: 'text-danger',
    success: 'text-accent',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Event Log</h1>
          <p className="text-muted text-sm">{logs.length} event{logs.length !== 1 ? 's' : ''} recorded</p>
        </div>
        <button
          onClick={() => addLog('Event log cleared', 'warn')}
          className="btn btn-ghost text-xs"
        >
          Clear Logs
        </button>
      </div>

      <div className="bg-panel border border-line rounded-lg">
        {logs.length === 0 ? (
          <div className="p-8 text-center text-muted text-sm">No events recorded.</div>
        ) : (
          <div className="divide-y divide-line">
            {[...logs].reverse().map(log => (
              <div
                key={log.id}
                className={`flex items-start gap-3 px-4 py-3 border-l-2 ${severityStyles[log.severity]}`}
              >
                <span className={`text-xs font-semibold uppercase w-14 shrink-0 pt-0.5 ${severityColors[log.severity]}`}>
                  {log.severity}
                </span>
                <p className="text-sm flex-1">{log.message}</p>
                <span className="text-muted text-[10px] shrink-0 pt-1">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
