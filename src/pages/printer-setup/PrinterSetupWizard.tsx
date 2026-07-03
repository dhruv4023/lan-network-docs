import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import CopyField from './CopyField'
import ProgressBar from './ProgressBar'
import SetupIllustration from './SetupIllustration'
import TopologyDiagram from './TopologyDiagram'
import WizardCard from './WizardCard'
import { flowSteps, setupOptions } from './flows'
import { cidrLabel, finalPrinterIp, isValidIp, networkAddress, routerGatewayIp, routerLaptopIp, suggestLaptopIp } from './ipUtils'
import type { PrinterPlan, PrinterReceipt, SetupType, StepId, WizardState } from './types'

const defaultSingle: PrinterReceipt = {
  currentIp: '192.168.192.168',
  subnetMask: '255.255.255.0',
  gateway: '',
  dhcpEnabled: null,
}

function makePrinters(count: number): PrinterPlan[] {
  return Array.from({ length: count }, (_, index) => ({
    label: `Printer ${index + 1}`,
    finalIp: finalPrinterIp(index),
    receipt: {
      currentIp: index === 0 ? '192.168.192.168' : `192.168.192.${168 + index}`,
      subnetMask: '255.255.255.0',
      gateway: '',
      dhcpEnabled: null,
    },
  }))
}

const initialState: WizardState = {
  setupType: null,
  currentStep: 'choose',
  printerCount: 2,
  currentPrinter: 0,
  single: defaultSingle,
  printers: makePrinters(2),
}

export default function PrinterSetupWizard() {
  const [state, setState] = useState<WizardState>(initialState)
  const currentPlan = state.printers[state.currentPrinter]
  const singleLaptopIp = suggestLaptopIp(state.single.currentIp)
  const currentTempLaptopIp = suggestLaptopIp(currentPlan?.receipt.currentIp || '192.168.192.168')
  const currentSteps = flowSteps(state.setupType)
  const canGoBack = state.currentStep !== 'choose'
  const canContinue = canMoveForward(state)

  function restart() {
    setState(initialState)
  }

  function chooseSetup(type: SetupType) {
    setState(prev => ({
      ...prev,
      setupType: type,
      currentStep: type === 'single' ? 'single-connect' : type === 'router' ? 'router-count' : 'switch-count',
      currentPrinter: 0,
    }))
  }

  function updateCount(count: number) {
    const safeCount = Math.max(2, Math.min(5, count))
    setState(prev => ({
      ...prev,
      printerCount: safeCount,
      printers: makePrinters(safeCount),
      currentPrinter: 0,
    }))
  }

  function updateSingle(field: keyof PrinterReceipt, value: string | boolean | null) {
    setState(prev => ({
      ...prev,
      single: { ...prev.single, [field]: value },
    }))
  }

  function updateCurrentPrinter(field: keyof PrinterReceipt, value: string | boolean | null) {
    setState(prev => ({
      ...prev,
      printers: prev.printers.map((printer, index) => index === prev.currentPrinter
        ? { ...printer, receipt: { ...printer.receipt, [field]: value } }
        : printer),
    }))
  }

  function goBack() {
    if (state.currentStep === 'router-test' && state.currentPrinter > 0) {
      setState(prev => {
        const previousPrinter = prev.printers[prev.currentPrinter - 1]
        return {
          ...prev,
          currentPrinter: prev.currentPrinter - 1,
          currentStep: previousPrinter?.receipt.dhcpEnabled === false ? 'router-manual' : 'router-method',
        }
      })
      return
    }
    if (state.currentStep === 'switch-test' && state.currentPrinter > 0) {
      setState(prev => ({ ...prev, currentPrinter: prev.currentPrinter - 1, currentStep: 'switch-restore' }))
      return
    }
    setState(prev => {
      const steps = flowSteps(prev.setupType)
      const index = steps.indexOf(prev.currentStep)
      return { ...prev, currentStep: steps[Math.max(0, index - 1)] }
    })
  }

  function goNext() {
    setState(prev => {
      if (prev.currentStep === 'router-method') {
        const printer = prev.printers[prev.currentPrinter]
        if (printer?.receipt.dhcpEnabled === false) {
          return { ...prev, currentStep: 'router-manual' }
        }
        if (prev.currentPrinter < prev.printerCount - 1) {
          return { ...prev, currentPrinter: prev.currentPrinter + 1, currentStep: 'router-test' }
        }
        return { ...prev, currentStep: 'router-review' }
      }
      if (prev.currentStep === 'router-manual' && prev.currentPrinter < prev.printerCount - 1) {
        return { ...prev, currentPrinter: prev.currentPrinter + 1, currentStep: 'router-test' }
      }
      if (prev.currentStep === 'switch-restore' && prev.currentPrinter < prev.printerCount - 1) {
        return { ...prev, currentPrinter: prev.currentPrinter + 1, currentStep: 'switch-test' }
      }
      const steps = flowSteps(prev.setupType)
      const index = steps.indexOf(prev.currentStep)
      return { ...prev, currentStep: steps[Math.min(steps.length - 1, index + 1)] }
    })
  }

  function skipLaptopConfig() {
    setState(prev => ({ ...prev, currentStep: 'single-add' }))
  }

  function openPrinter(ip: string) {
    window.open(`http://${ip}`, '_blank', 'noopener,noreferrer')
  }

  const subtitle = useMemo(() => {
    if (!state.setupType) return 'A guided setup assistant for Epson network printers'
    const selected = setupOptions.find(option => option.type === state.setupType)
    return selected?.title || 'Printer Setup'
  }, [state.setupType])

  return (
    <div className="space-y-5">
      <div className="page-header gap-4 max-[720px]:items-start max-[720px]:flex-col">
        <div>
          <h1>Printer Setup</h1>
          <p>{subtitle}</p>
        </div>
        <button className="btn btn-ghost text-xs" onClick={restart}>Restart</button>
      </div>

      <ProgressBar setupType={state.setupType} currentStep={state.currentStep} />

      <AnimatePresence mode="wait">
        <div key={state.currentStep}>
          {state.currentStep === 'choose' && (
            <WizardCard
              eyebrow="Start here"
              title="How would you like to connect your printer(s)?"
              description="Choose the picture that matches your desk. The assistant will only ask for details when they are needed."
            >
              <div className="grid gap-4 md:grid-cols-3">
                {setupOptions.map(option => (
                  <motion.button
                    key={option.type}
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.98 }}
                    className="glass-card text-left min-h-[210px] flex flex-col gap-4 cursor-pointer"
                    onClick={() => chooseSetup(option.type)}
                  >
                    <span className="w-12 h-12 rounded-xl bg-accent-dim text-accent flex items-center justify-center">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={option.icon} />
                      </svg>
                    </span>
                    <span>
                      <span className="block text-base font-semibold mb-1">{option.title}</span>
                      <span className="block text-sm text-muted leading-relaxed">{option.description}</span>
                    </span>
                  </motion.button>
                ))}
              </div>
            </WizardCard>
          )}

          {state.currentStep === 'single-connect' && (
            <WizardCard
              eyebrow="Single printer"
              title="Connect the printer directly to your laptop"
              description="Use one Ethernet cable from the laptop Ethernet port to the printer Ethernet port."
            >
              <SetupIllustration type="single" />
            </WizardCard>
          )}

          {state.currentStep === 'single-test' && (
            <SelfTestStep eyebrow="Single printer" />
          )}

          {state.currentStep === 'single-receipt' && (
            <WizardCard
              eyebrow="Single printer"
              title="Enter the information from the receipt"
              description="Only copy the values printed on the self-test page. You do not need to invent any network numbers."
            >
              <ReceiptForm receipt={state.single} onChange={updateSingle} showSubnet showGateway />
              <NetworkSummary ip={state.single.currentIp} subnet={state.single.subnetMask} />
            </WizardCard>
          )}

          {state.currentStep === 'single-access' && (
            <WizardCard
              eyebrow="Quick check"
              title={`Can you open http://${state.single.currentIp}?`}
              description="Try the printer webpage first. If it opens, you can skip straight to adding the printer."
            >
              <div className="flex flex-wrap gap-3">
                <button className="btn btn-primary" onClick={() => openPrinter(state.single.currentIp)}>Open In Browser</button>
                <button className="btn btn-ghost" onClick={skipLaptopConfig}>Yes, it opened</button>
                <button className="btn btn-ghost" onClick={goNext}>No, help me set the laptop IP</button>
              </div>
            </WizardCard>
          )}

          {state.currentStep === 'single-laptop' && (
            <WizardCard
              eyebrow="Laptop settings"
              title="Configure your laptop Ethernet adapter"
              description="Temporarily set the laptop to the suggested address below. This places it beside the printer on the same small network."
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <CopyField label="IP address" value={singleLaptopIp} />
                <CopyField label="Subnet mask" value={state.single.subnetMask} />
                <CopyField label="Gateway" value={state.single.gateway || 'Leave blank'} muted={!state.single.gateway} />
                <CopyField label="DNS" value="Leave blank" muted />
              </div>
              <NetworkSummary ip={state.single.currentIp} subnet={state.single.subnetMask} />
            </WizardCard>
          )}

          {state.currentStep === 'single-open' && (
            <WizardCard
              eyebrow="Open printer webpage"
              title="Open the printer configuration page"
              description="After the laptop IP is set, open the printer webpage again."
            >
              <CopyField label="Printer webpage" value={`http://${state.single.currentIp}`} />
              <button className="btn btn-primary mt-4" onClick={() => openPrinter(state.single.currentIp)}>Open In Browser</button>
            </WizardCard>
          )}

          {state.currentStep === 'single-verify' && (
            <WizardCard
              eyebrow="Verification"
              title="Can you access the printer page now?"
              description="If the page appears in the browser, the laptop and printer can talk to each other."
            >
              <div className="flex flex-wrap gap-3">
                <button className="btn btn-primary" onClick={goNext}>Yes, continue</button>
                <button className="btn btn-ghost" onClick={() => setState(prev => ({ ...prev, currentStep: 'single-laptop' }))}>No, show laptop settings again</button>
              </div>
            </WizardCard>
          )}

          {state.currentStep === 'single-add' && (
            <AddPrintersStep title="Add the printer to ePOS Proxy" printers={[{ label: 'Printer', finalIp: state.single.currentIp, receipt: state.single }]} />
          )}

          {state.currentStep === 'router-count' && (
            <CountStep type="router" count={state.printerCount} onCountChange={updateCount} />
          )}

          {state.currentStep === 'router-plan' && (
            <WizardCard
              eyebrow="Router setup"
              title="Here is the network plan"
              description="The router keeps the network organized. The laptop uses .10 and each printer gets the next address."
            >
              <TopologyDiagram type="router" printers={state.printers} />
            </WizardCard>
          )}

          {state.currentStep === 'router-test' && currentPlan && (
            <SelfTestStep eyebrow={`${currentPlan.label} of ${state.printerCount}`} />
          )}

          {state.currentStep === 'router-receipt' && currentPlan && (
            <WizardCard
              eyebrow={`${currentPlan.label} of ${state.printerCount}`}
              title={`Enter the receipt details for ${currentPlan.label}`}
              description="For router setups, the key question is whether this printer supports DHCP."
            >
              <ReceiptForm receipt={currentPlan.receipt} onChange={updateCurrentPrinter} />
            </WizardCard>
          )}

          {state.currentStep === 'router-method' && currentPlan && (
            <WizardCard
              eyebrow={`${currentPlan.label} of ${state.printerCount}`}
              title={`Use ${currentPlan.finalIp} for ${currentPlan.label}`}
              description="The assistant has chosen a stable address. Use DHCP reservation when available, otherwise set it as a static printer IP."
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <CopyField label="Recommended printer IP" value={currentPlan.finalIp} />
                <CopyField label="Subnet mask" value="255.255.255.0" />
                <CopyField label="Gateway" value={routerGatewayIp()} />
                <CopyField label="DNS" value={routerGatewayIp()} />
              </div>
              <div className="callout mt-4">
                <strong>{currentPlan.receipt.dhcpEnabled ? 'Recommended: DHCP reservation.' : 'Recommended: Static IP.'}</strong>{' '}
                {currentPlan.receipt.dhcpEnabled
                  ? `Enable DHCP on the printer, then reserve ${currentPlan.finalIp} for it in the router.`
                  : `Use the next screen to manually open the printer webpage and set the printer network address to ${currentPlan.finalIp}.`}
              </div>
            </WizardCard>
          )}

          {state.currentStep === 'router-manual' && currentPlan && (
            <RouterManualStep
              printer={currentPlan}
              temporaryLaptopIp={currentTempLaptopIp}
              onOpenPrinter={openPrinter}
            />
          )}

          {state.currentStep === 'router-review' && (
            <WizardCard
              eyebrow="Router setup"
              title="All printer addresses are ready"
              description="This is the final layout you should have after each printer is configured."
            >
              <TopologyDiagram type="router" printers={state.printers} />
            </WizardCard>
          )}

          {state.currentStep === 'router-connect' && (
            <WizardCard
              eyebrow="Router setup"
              title="Connect everything to the router"
              description="Plug the laptop and every printer into the same router. Power on the router first, then the printers."
            >
              <SetupIllustration type="router" />
            </WizardCard>
          )}

          {state.currentStep === 'router-add' && (
            <AddPrintersStep title="Add all printers to ePOS Proxy" printers={state.printers} />
          )}

          {state.currentStep === 'switch-count' && (
            <CountStep type="switch" count={state.printerCount} onCountChange={updateCount} />
          )}

          {state.currentStep === 'switch-plan' && (
            <WizardCard
              eyebrow="Switch setup"
              title="Here is the final switch layout"
              description="A switch does not assign addresses, so the laptop and printers need fixed addresses."
            >
              <TopologyDiagram type="switch" printers={state.printers} />
            </WizardCard>
          )}

          {state.currentStep === 'switch-test' && currentPlan && (
            <SelfTestStep eyebrow={`${currentPlan.label} of ${state.printerCount}`} />
          )}

          {state.currentStep === 'switch-receipt' && currentPlan && (
            <WizardCard
              eyebrow={`${currentPlan.label} of ${state.printerCount}`}
              title={`Enter the receipt details for ${currentPlan.label}`}
              description="The assistant will calculate the temporary laptop IP from the current printer IP."
            >
              <ReceiptForm receipt={currentPlan.receipt} onChange={updateCurrentPrinter} showSubnet />
              <NetworkSummary ip={currentPlan.receipt.currentIp} subnet={currentPlan.receipt.subnetMask} />
            </WizardCard>
          )}

          {state.currentStep === 'switch-laptop' && currentPlan && (
            <WizardCard
              eyebrow={`${currentPlan.label} of ${state.printerCount}`}
              title="Temporarily configure the laptop"
              description="Use this temporary laptop address only while configuring this one printer."
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <CopyField label="Temporary laptop IP" value={currentTempLaptopIp} />
                <CopyField label="Subnet mask" value={currentPlan.receipt.subnetMask} />
                <CopyField label="Gateway" value="Leave blank" muted />
                <CopyField label="DNS" value="Leave blank" muted />
              </div>
              <button className="btn btn-primary mt-4" onClick={() => openPrinter(currentPlan.receipt.currentIp)}>Open Printer Webpage</button>
            </WizardCard>
          )}

          {state.currentStep === 'switch-final-ip' && currentPlan && (
            <WizardCard
              eyebrow={`${currentPlan.label} of ${state.printerCount}`}
              title={`Set ${currentPlan.label} to its final address`}
              description="Disable DHCP on the printer, enter the final static values, save, and reboot the printer."
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <CopyField label="Final printer IP" value={currentPlan.finalIp} />
                <CopyField label="Subnet mask" value="255.255.255.0" />
                <CopyField label="Gateway" value="Leave blank" muted />
                <CopyField label="DNS" value="Leave blank" muted />
              </div>
            </WizardCard>
          )}

          {state.currentStep === 'switch-restore' && currentPlan && (
            <WizardCard
              eyebrow={`${currentPlan.label} of ${state.printerCount}`}
              title="Restore the laptop to the final switch address"
              description="After the printer restarts, set the laptop back to the shared switch network and verify the printer."
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <CopyField label="Laptop IP" value={routerLaptopIp()} />
                <CopyField label="Subnet mask" value="255.255.255.0" />
                <CopyField label={`${currentPlan.label} IP`} value={currentPlan.finalIp} />
                <CopyField label="Gateway" value="Leave blank" muted />
              </div>
              <button className="btn btn-primary mt-4" onClick={() => openPrinter(currentPlan.finalIp)}>Verify Printer</button>
            </WizardCard>
          )}

          {state.currentStep === 'switch-review' && (
            <WizardCard
              eyebrow="Switch setup"
              title="All printers are configured"
              description="Connect the laptop and all printers to the same switch. They now share the same static network."
            >
              <TopologyDiagram type="switch" printers={state.printers} />
            </WizardCard>
          )}

          {state.currentStep === 'switch-add' && (
            <AddPrintersStep title="Add all printers to ePOS Proxy" printers={state.printers} />
          )}
        </div>
      </AnimatePresence>

      {state.currentStep !== 'choose' && !['single-access', 'single-verify'].includes(state.currentStep) && (
        <div className="wizard-nav flex items-center justify-between gap-3 flex-wrap">
          <button className="btn btn-ghost" onClick={goBack} disabled={!canGoBack}>Previous</button>
          <div className="flex items-center gap-2 text-xs text-muted">
            {state.setupType !== 'single' && ['router-test', 'router-receipt', 'router-method', 'router-manual', 'switch-test', 'switch-receipt', 'switch-laptop', 'switch-final-ip', 'switch-restore'].includes(state.currentStep) && (
              <span className="badge badge-muted">Printer {state.currentPrinter + 1} of {state.printerCount}</span>
            )}
            <button className="btn btn-primary" onClick={goNext} disabled={!canContinue || currentSteps[currentSteps.length - 1] === state.currentStep}>
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function canMoveForward(state: WizardState): boolean {
  if (state.currentStep === 'single-receipt') {
    return isValidIp(state.single.currentIp) && isValidIp(state.single.subnetMask) && state.single.dhcpEnabled !== null
  }
  const current = state.printers[state.currentPrinter]
  if (!current) return true
  if (state.currentStep === 'router-receipt') {
    return isValidIp(current.receipt.currentIp) && current.receipt.dhcpEnabled !== null
  }
  if (state.currentStep === 'switch-receipt') {
    return isValidIp(current.receipt.currentIp) && isValidIp(current.receipt.subnetMask) && current.receipt.dhcpEnabled !== null
  }
  return true
}

function CountStep({ type, count, onCountChange }: { type: Exclude<SetupType, 'single'>; count: number; onCountChange: (count: number) => void }) {
  return (
    <WizardCard
      eyebrow={type === 'router' ? 'Router setup' : 'Switch setup'}
      title="How many printers are you setting up?"
      description="Choose a number from 2 to 5. The assistant will generate the printer addresses."
    >
      <div className="flex flex-wrap gap-3">
        {[2, 3, 4, 5].map(value => (
          <button
            key={value}
            className={`btn ${count === value ? 'btn-primary' : 'btn-ghost'} text-lg min-w-16`}
            onClick={() => onCountChange(value)}
          >
            {value}
          </button>
        ))}
      </div>
    </WizardCard>
  )
}

function SelfTestStep({ eyebrow }: { eyebrow: string }) {
  return (
    <WizardCard
      eyebrow={eyebrow}
      title="Print the self-test page"
      description="The self-test receipt tells us the printer IP address and whether DHCP is enabled."
    >
      <ol className="grid gap-3 sm:grid-cols-2 text-sm text-fg/85 list-decimal list-inside marker:text-accent">
        <li className="bg-panel-2/60 border border-line/60 rounded-lg p-3">Turn the printer off.</li>
        <li className="bg-panel-2/60 border border-line/60 rounded-lg p-3">Hold the FEED button.</li>
        <li className="bg-panel-2/60 border border-line/60 rounded-lg p-3">Turn the printer on while holding FEED.</li>
        <li className="bg-panel-2/60 border border-line/60 rounded-lg p-3">Release after the self-test prints.</li>
      </ol>
      <div className="callout mt-4">Look for IP Address, Subnet Mask, Gateway, DHCP, and MAC Address on the receipt.</div>
    </WizardCard>
  )
}

function ReceiptForm({
  receipt,
  onChange,
  showSubnet = false,
  showGateway = false,
}: {
  receipt: PrinterReceipt
  onChange: (field: keyof PrinterReceipt, value: string | boolean | null) => void
  showSubnet?: boolean
  showGateway?: boolean
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs text-muted block mb-1">Printer IP</label>
          <input
            className={`input-field ${receipt.currentIp && !isValidIp(receipt.currentIp) ? 'is-invalid' : ''}`}
            value={receipt.currentIp}
            onChange={event => onChange('currentIp', event.target.value)}
            placeholder="192.168.192.168"
          />
        </div>
        {showSubnet && (
          <div>
            <label className="text-xs text-muted block mb-1">Subnet Mask</label>
            <input
              className={`input-field ${receipt.subnetMask && !isValidIp(receipt.subnetMask) ? 'is-invalid' : ''}`}
              value={receipt.subnetMask}
              onChange={event => onChange('subnetMask', event.target.value)}
              placeholder="255.255.255.0"
            />
          </div>
        )}
        {showGateway && (
          <div>
            <label className="text-xs text-muted block mb-1">Gateway <span className="text-muted/60">(optional)</span></label>
            <input
              className={`input-field ${receipt.gateway && !isValidIp(receipt.gateway) ? 'is-invalid' : ''}`}
              value={receipt.gateway}
              onChange={event => onChange('gateway', event.target.value)}
              placeholder="Leave blank if empty"
            />
          </div>
        )}
      </div>
      <div>
        <p className="text-xs text-muted block mb-2">DHCP enabled?</p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Yes', value: true },
            { label: 'No', value: false },
          ].map(option => (
            <button
              key={option.label}
              className={`btn ${receipt.dhcpEnabled === option.value ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => onChange('dhcpEnabled', option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function NetworkSummary({ ip, subnet }: { ip: string; subnet: string }) {
  return (
    <div className="callout mt-4">
      <strong>Calculated automatically:</strong> network {networkAddress(ip, subnet)}, subnet {subnet}, CIDR {cidrLabel(subnet)}.
    </div>
  )
}

function RouterManualStep({
  printer,
  temporaryLaptopIp,
  onOpenPrinter,
}: {
  printer: PrinterPlan
  temporaryLaptopIp: string
  onOpenPrinter: (ip: string) => void
}) {
  return (
    <WizardCard
      eyebrow={printer.label}
      title="Configure this printer manually"
      description="Use this when the printer does not support DHCP or you want to type a fixed address into the printer webpage."
    >
      <div className="space-y-5">
        <div>
          <h3 className="text-sm font-semibold mb-3">1. Temporarily set your laptop Ethernet IP</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <CopyField label="Laptop IP" value={temporaryLaptopIp} />
            <CopyField label="Subnet mask" value={printer.receipt.subnetMask} />
            <CopyField label="Gateway" value="Leave blank" muted />
            <CopyField label="DNS" value="Leave blank" muted />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-3">2. Open the printer webpage</h3>
          <CopyField label="Current printer page" value={`http://${printer.receipt.currentIp}`} />
          <button className="btn btn-primary mt-3" onClick={() => onOpenPrinter(printer.receipt.currentIp)}>Open In Browser</button>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-3">3. Enter these static network settings on the printer</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <CopyField label="Printer IP" value={printer.finalIp} />
            <CopyField label="Subnet mask" value="255.255.255.0" />
            <CopyField label="Gateway" value={routerGatewayIp()} />
            <CopyField label="DNS" value={routerGatewayIp()} />
          </div>
          <div className="callout mt-4">
            Save the printer settings and reboot the printer. After it restarts, it should be ready to connect to the router.
          </div>
        </div>
      </div>
    </WizardCard>
  )
}

function AddPrintersStep({ title, printers }: { title: string; printers: PrinterPlan[] }) {
  return (
    <WizardCard
      eyebrow="Final step"
      title={title}
      description="Open ePOS Proxy, add a network printer, and use the addresses below."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {printers.map(printer => (
          <CopyField key={printer.label} label={printer.label} value={printer.finalIp} />
        ))}
      </div>
      <div className="callout mt-4">
        Add each printer one at a time. Use the copied IP address as the network printer address.
      </div>
    </WizardCard>
  )
}
