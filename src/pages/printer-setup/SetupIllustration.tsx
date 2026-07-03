import type { SetupType } from './types'

interface SetupIllustrationProps {
  type: SetupType
}

export default function SetupIllustration({ type }: SetupIllustrationProps) {
  const multi = type !== 'single'
  const hubLabel = type === 'router' ? 'Router' : type === 'switch' ? 'Switch' : ''

  return (
    <div className="bg-bg-soft/50 border border-line/60 rounded-xl p-4 overflow-hidden">
      <svg viewBox="0 0 640 250" className="w-full h-auto min-h-[180px]" role="img" aria-label="Printer connection illustration">
        <defs>
          <marker id={`arrow-${type}`} markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <path d="M0 0 L8 4 L0 8 Z" fill="currentColor" className="text-accent" />
          </marker>
        </defs>
        <rect x="48" y="86" width="130" height="78" rx="14" className="fill-panel stroke-line" strokeWidth="2" />
        <rect x="70" y="105" width="86" height="38" rx="6" className="fill-bg-soft stroke-line" />
        <path d="M82 176h62" className="stroke-muted" strokeWidth="7" strokeLinecap="round" />
        <text x="113" y="214" textAnchor="middle" className="fill-fg text-[18px] font-semibold">Laptop</text>
        {multi ? (
          <>
            <path d="M178 125H292" className="stroke-accent" strokeWidth="4" strokeLinecap="round" markerEnd={`url(#arrow-${type})`} />
            <rect x="300" y="82" width="120" height="86" rx="16" className="fill-accent-dim stroke-accent" strokeWidth="2" />
            <circle cx="330" cy="125" r="7" className="fill-accent" />
            <circle cx="360" cy="125" r="7" className="fill-accent" />
            <circle cx="390" cy="125" r="7" className="fill-accent" />
            <text x="360" y="214" textAnchor="middle" className="fill-fg text-[18px] font-semibold">{hubLabel}</text>
            {[0, 1, 2].map(index => {
              const y = 54 + index * 72
              return (
                <g key={index}>
                  <path d={`M420 125 C468 125 462 ${y + 34} 502 ${y + 34}`} className="stroke-accent" strokeWidth="4" fill="none" strokeLinecap="round" />
                  <rect x="510" y={y} width="92" height="58" rx="12" className="fill-panel stroke-line" strokeWidth="2" />
                  <rect x="528" y={y + 16} width="56" height="20" rx="4" className="fill-bg-soft stroke-line" />
                  <text x="556" y={y + 82} textAnchor="middle" className="fill-muted text-[13px]">Printer {index + 1}</text>
                </g>
              )
            })}
          </>
        ) : (
          <>
            <path d="M178 125H442" className="stroke-accent" strokeWidth="4" strokeLinecap="round" markerEnd={`url(#arrow-${type})`} />
            <rect x="460" y="82" width="128" height="86" rx="16" className="fill-panel stroke-line" strokeWidth="2" />
            <rect x="486" y="105" width="76" height="30" rx="6" className="fill-bg-soft stroke-line" />
            <path d="M482 153h84" className="stroke-muted" strokeWidth="6" strokeLinecap="round" />
            <text x="524" y="214" textAnchor="middle" className="fill-fg text-[18px] font-semibold">Printer</text>
          </>
        )}
      </svg>
    </div>
  )
}
