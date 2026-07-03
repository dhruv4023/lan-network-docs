import type { SetupType, StepId } from './types'
import { flowSteps, stepTitles } from './flows'

interface ProgressBarProps {
  setupType: SetupType | null
  currentStep: StepId
}

export default function ProgressBar({ setupType, currentStep }: ProgressBarProps) {
  const steps = flowSteps(setupType)
  const currentIndex = Math.max(0, steps.indexOf(currentStep))
  const percent = steps.length <= 1 ? 8 : ((currentIndex + 1) / steps.length) * 100

  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <p className="text-xs text-muted mb-0.5">Step {currentIndex + 1} of {steps.length}</p>
          <p className="text-sm font-semibold">{stepTitles[currentStep]}</p>
        </div>
        <span className="badge badge-accent">{Math.round(percent)}%</span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}
