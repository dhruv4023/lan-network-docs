import type { SetupType, StepId } from './types'

export const setupOptions: Array<{
  type: SetupType
  title: string
  description: string
  icon: string
}> = [
  {
    type: 'single',
    title: 'Single Printer',
    description: 'Laptop connected directly to one printer',
    icon: 'M6 12h12M14 8l4 4-4 4M4 6h5v12H4z',
  },
  {
    type: 'router',
    title: 'Multiple Printers via Router',
    description: 'Laptop and printers connected to the same router',
    icon: 'M4 10h16v6H4zM8 10V7h8v3M7 16v3m5-3v3m5-3v3',
  },
  {
    type: 'switch',
    title: 'Multiple Printers without Router',
    description: 'Laptop connected to printers through a network switch',
    icon: 'M5 5h14v6H5zM7 16h3m4 0h3M9 11v5m6-5v5',
  },
]

export const stepTitles: Record<StepId, string> = {
  choose: 'Choose a setup',
  'single-connect': 'Connect the cable',
  'single-test': 'Print the self-test',
  'single-receipt': 'Read the receipt',
  'single-access': 'Try the printer page',
  'single-laptop': 'Set laptop address',
  'single-open': 'Open the printer page',
  'single-verify': 'Check access',
  'single-add': 'Add to ePOS Proxy',
  'router-count': 'Printer count',
  'router-plan': 'Review the plan',
  'router-test': 'Print self-test',
  'router-receipt': 'Read printer receipt',
  'router-method': 'Choose network method',
  'router-manual': 'Manual printer IP',
  'router-review': 'Final router layout',
  'router-connect': 'Connect everything',
  'router-add': 'Add to ePOS Proxy',
  'switch-count': 'Printer count',
  'switch-plan': 'Review the plan',
  'switch-test': 'Print self-test',
  'switch-receipt': 'Read printer receipt',
  'switch-laptop': 'Set temporary laptop IP',
  'switch-final-ip': 'Set final printer IP',
  'switch-restore': 'Restore laptop IP',
  'switch-review': 'Final switch layout',
  'switch-add': 'Add to ePOS Proxy',
}

export function flowSteps(setupType: SetupType | null): StepId[] {
  if (setupType === 'single') {
    return [
      'choose',
      'single-connect',
      'single-test',
      'single-receipt',
      'single-access',
      'single-laptop',
      'single-open',
      'single-verify',
      'single-add',
    ]
  }

  if (setupType === 'router') {
    return [
      'choose',
      'router-count',
      'router-plan',
      'router-test',
      'router-receipt',
      'router-method',
      'router-manual',
      'router-review',
      'router-connect',
      'router-add',
    ]
  }

  if (setupType === 'switch') {
    return [
      'choose',
      'switch-count',
      'switch-plan',
      'switch-test',
      'switch-receipt',
      'switch-laptop',
      'switch-final-ip',
      'switch-restore',
      'switch-review',
      'switch-add',
    ]
  }

  return ['choose']
}
