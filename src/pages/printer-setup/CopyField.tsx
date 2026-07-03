import { useState } from 'react'

interface CopyFieldProps {
  label: string
  value: string
  muted?: boolean
}

export default function CopyField({ label, value, muted = false }: CopyFieldProps) {
  const [copied, setCopied] = useState(false)

  function copyValue() {
    navigator.clipboard.writeText(value)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className="bg-panel-2/60 border border-line/60 rounded-lg px-3 py-2.5 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[10px] uppercase text-muted font-semibold mb-0.5">{label}</p>
        <p className={`font-mono text-sm truncate ${muted ? 'text-muted' : 'text-fg'}`}>{value}</p>
      </div>
      <button className="btn btn-ghost text-xs px-2.5 py-1.5 shrink-0" onClick={copyValue}>
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  )
}
