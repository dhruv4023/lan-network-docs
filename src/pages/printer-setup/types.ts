export type SetupType = 'single' | 'router' | 'switch'

export type StepId =
  | 'choose'
  | 'single-connect'
  | 'single-test'
  | 'single-receipt'
  | 'single-access'
  | 'single-laptop'
  | 'single-open'
  | 'single-verify'
  | 'single-add'
  | 'router-count'
  | 'router-plan'
  | 'router-test'
  | 'router-receipt'
  | 'router-method'
  | 'router-manual'
  | 'router-review'
  | 'router-connect'
  | 'router-add'
  | 'switch-count'
  | 'switch-plan'
  | 'switch-test'
  | 'switch-receipt'
  | 'switch-laptop'
  | 'switch-final-ip'
  | 'switch-restore'
  | 'switch-review'
  | 'switch-add'

export interface PrinterReceipt {
  currentIp: string
  subnetMask: string
  gateway: string
  dhcpEnabled: boolean | null
}

export interface PrinterPlan {
  label: string
  finalIp: string
  receipt: PrinterReceipt
}

export interface WizardState {
  setupType: SetupType | null
  currentStep: StepId
  printerCount: number
  currentPrinter: number
  single: PrinterReceipt
  printers: PrinterPlan[]
}
