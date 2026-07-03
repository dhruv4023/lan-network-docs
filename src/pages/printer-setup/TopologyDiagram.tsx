import CopyField from './CopyField'
import { routerGatewayIp, routerLaptopIp } from './ipUtils'
import type { PrinterPlan, SetupType } from './types'

interface TopologyDiagramProps {
  type: Exclude<SetupType, 'single'>
  printers: PrinterPlan[]
}

export default function TopologyDiagram({ type, printers }: TopologyDiagramProps) {
  const hub = type === 'router' ? 'Router' : 'Switch'

  return (
    <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr] items-stretch">
      <div className="bg-bg-soft/50 border border-line/60 rounded-xl p-4">
        <svg viewBox="0 0 700 360" className="w-full h-auto" role="img" aria-label={`${hub} topology`}>
          <path d="M140 170H290M410 170H560" className="stroke-accent" strokeWidth="4" strokeLinecap="round" />
          <rect x="48" y="126" width="120" height="88" rx="14" className="fill-panel stroke-line" strokeWidth="2" />
          <text x="108" y="164" textAnchor="middle" className="fill-fg text-[18px] font-semibold">Laptop</text>
          <text x="108" y="190" textAnchor="middle" className="fill-muted text-[14px] font-mono">{routerLaptopIp()}</text>
          <rect x="290" y="118" width="120" height="104" rx="16" className="fill-accent-dim stroke-accent" strokeWidth="2" />
          <text x="350" y="164" textAnchor="middle" className="fill-fg text-[18px] font-semibold">{hub}</text>
          <text x="350" y="190" textAnchor="middle" className="fill-muted text-[14px] font-mono">{type === 'router' ? routerGatewayIp() : 'Ethernet'}</text>
          {printers.map((printer, index) => {
            const y = 30 + index * 64
            return (
              <g key={printer.label}>
                <path d={`M410 170 C470 170 470 ${y + 34} 530 ${y + 34}`} className="stroke-accent" strokeWidth="3" fill="none" strokeLinecap="round" />
                <rect x="540" y={y} width="122" height="48" rx="11" className="fill-panel stroke-line" strokeWidth="2" />
                <text x="601" y={y + 20} textAnchor="middle" className="fill-fg text-[14px] font-semibold">{printer.label}</text>
                <text x="601" y={y + 38} textAnchor="middle" className="fill-muted text-[12px] font-mono">{printer.finalIp}</text>
              </g>
            )
          })}
        </svg>
      </div>
      <div className="space-y-2.5">
        <CopyField label="Laptop" value={routerLaptopIp()} />
        {type === 'router' && <CopyField label="Router gateway" value={routerGatewayIp()} />}
        {printers.map(printer => (
          <CopyField key={printer.label} label={printer.label} value={printer.finalIp} />
        ))}
      </div>
    </div>
  )
}
