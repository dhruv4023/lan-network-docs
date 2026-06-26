const WIZARD_STEPS = [
  {
    id: 'topology',
    field: 'topology',
    title: 'What does your network look like?',
    render: (state, update) => (
      <div className="option-grid">
        {[
          { value: 'single', title: 'Single printer, direct', desc: 'One printer wired straight to the laptop.' },
          { value: 'multi', title: 'Multiple printers, switch only', desc: 'Several printers, no router on site.' },
          { value: 'router', title: 'Router-based network', desc: 'Printers join the office router/LAN.' },
        ].map(opt => (
          <button
            key={opt.value}
            type="button"
            className={`option-card ${state.wizard.topology === opt.value ? 'is-selected' : ''}`}
            onClick={() => {
              update(prev => ({
                ...prev,
                wizard: { ...prev.wizard, topology: opt.value, count: null, dhcp: null },
              }))
            }}
          >
            <strong>{opt.title}</strong>
            <span>{opt.desc}</span>
          </button>
        ))}
      </div>
    ),
  },
  {
    id: 'count',
    field: 'count',
    title: 'How many printers are you setting up?',
    skip: state => state.wizard.topology === 'single',
    render: (state, update) => (
      <div className="option-grid">
        {[
          { value: '2-3', title: '2\u20133 printers', desc: 'Small till or counter setup.' },
          { value: '4+', title: '4 or more printers', desc: 'Larger floor — plan IPs carefully.' },
        ].map(opt => (
          <button
            key={opt.value}
            type="button"
            className={`option-card ${state.wizard.count === opt.value ? 'is-selected' : ''}`}
            onClick={() => {
              update(prev => ({
                ...prev,
                wizard: { ...prev.wizard, count: opt.value },
              }))
            }}
          >
            <strong>{opt.title}</strong>
            <span>{opt.desc}</span>
          </button>
        ))}
      </div>
    ),
  },
  {
    id: 'dhcp',
    field: 'dhcp',
    title: 'Does your router support DHCP reservations?',
    skip: state => state.wizard.topology !== 'router',
    render: (state, update) => (
      <div className="option-grid">
        {[
          { value: 'yes', title: 'Yes', desc: 'I can reserve a fixed IP per device in the router.' },
          { value: 'no', title: 'Not sure / no', desc: 'I\'ll assign static IPs on each printer instead.' },
        ].map(opt => (
          <button
            key={opt.value}
            type="button"
            className={`option-card ${state.wizard.dhcp === opt.value ? 'is-selected' : ''}`}
            onClick={() => {
              update(prev => ({
                ...prev,
                wizard: { ...prev.wizard, dhcp: opt.value },
              }))
            }}
          >
            <strong>{opt.title}</strong>
            <span>{opt.desc}</span>
          </button>
        ))}
      </div>
    ),
  },
  {
    id: 'result',
    title: 'Your tailored walkthrough',
    isFinal: true,
    render: (state, update, navigate) => {
      const topo = state.wizard.topology
      if (!topo) return <p>Pick a topology in step 1 to see your tailored walkthrough.</p>
      if (topo === 'single') {
        return (
          <>
            <div className="callout">Direct connection — no router or switch needed.</div>
            <ol className="steps">
              <li>Wire the printer to your laptop with an Ethernet cable.</li>
              <li>Print a self-test page (hold <kbd>FEED</kbd> while powering on) to read its IP, subnet and gateway.</li>
              <li>Browse to that IP. If it won&apos;t load, set your laptop&apos;s adapter to IP 192.168.192.169 / 255.255.255.0 / gateway 192.168.192.1 / DNS 8.8.8.8.</li>
              <li>In ePOS Proxy, click <strong>+ Add Network Printer</strong>, enter the IP, click <strong>Add</strong>.</li>
            </ol>
            <button className="btn btn-ghost" onClick={() => navigate('network', 'single')}>
              Open full Network Setup guide →
            </button>
          </>
        )
      }
      if (topo === 'multi') {
        return (
          <>
            <div className="callout callout-warn"><strong>Configure every printer one at a time</strong> before wiring them all to the switch — they likely share a default IP.</div>
            <ol className="steps">
              <li>Connect one printer at a time, set a unique static IP (e.g. 192.168.1.11, .12, .13…) with subnet 255.255.255.0 and gateway 192.168.1.10.</li>
              <li>Set your laptop&apos;s Ethernet adapter to 192.168.1.10 / 255.255.255.0, DNS 8.8.8.8.</li>
              <li>Wire the laptop and all configured printers into the switch, then power everything on.</li>
              <li>Add each printer&apos;s IP in ePOS Proxy via <strong>+ Add Network Printer</strong>.</li>
            </ol>
            <button className="btn btn-ghost" onClick={() => navigate('network', 'multi')}>
              Open full Network Setup guide →
            </button>
          </>
        )
      }
      if (topo === 'router') {
        const dhcp = state.wizard.dhcp
        return (
          <>
            {dhcp === 'yes'
              ? <div className="callout">Use DHCP reservations: pair each printer&apos;s MAC address to a fixed IP in the router&apos;s settings — no printer-side changes needed.</div>
              : <div className="callout callout-warn">Assign static IPs by hand: configure one printer at a time on its Network Settings page before connecting it to the router.</div>
            }
            <ol className="steps">
              <li>Note each printer&apos;s self-test IP and reserve/assign addresses inside the router&apos;s range (e.g. 192.168.1.11, .12…).</li>
              <li>Use subnet 255.255.255.0, gateway 192.168.1.1, DNS 8.8.8.8 throughout.</li>
              <li>Connect the laptop and all printers to the router (add a switch if you run out of ports).</li>
              <li>Add each printer&apos;s IP in ePOS Proxy.</li>
            </ol>
            <button className="btn btn-ghost" onClick={() => navigate('router')}>
              Open full Router Configuration guide →
            </button>
          </>
        )
      }
      return null
    },
  },
]

function activeSteps(state) {
  return WIZARD_STEPS.filter(s => !(s.skip && s.skip(state)))
}

export default function Wizard({ state, saveState, navigate }) {
  const steps = activeSteps(state)
  const currentStep = steps[Math.min(state.wizard.step, steps.length - 1)]
  const pct = Math.round(((state.wizard.step + 1) / steps.length) * 100)

  const update = (updater) => saveState(updater)

  return (
    <section data-route="wizard">
      <h1 className="text-3xl font-bold mb-1">Guided Setup Wizard</h1>
      <p className="lede text-muted max-w-[640px]">
        Answer a few questions and follow a tailored, numbered walkthrough. Your place is saved as you go.
      </p>

      <div className="wizard bg-panel border border-line rounded-[10px] p-5">
        <div
          className="progress-track"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
        >
          <div className="progress-fill" style={{ width: pct + '%' }}></div>
        </div>
        <p className="progress-label text-muted text-xs mt-2 mb-5">
          Step {state.wizard.step + 1} of {steps.length}
        </p>

        <div className="wizard-step">
          <h2 className="mt-0">{currentStep.title}</h2>
          {currentStep.render(state, update, navigate)}
        </div>

        <div className="wizard-nav flex justify-between mt-6">
          <button
            className="btn btn-ghost"
            type="button"
            disabled={state.wizard.step === 0}
            onClick={() => saveState(prev => ({
              ...prev,
              wizard: { ...prev.wizard, step: Math.max(0, prev.wizard.step - 1) },
            }))}
          >
            ← Previous
          </button>
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => {
              const s = steps[state.wizard.step]
              if (s.isFinal) {
                saveState(prev => ({
                  ...prev,
                  wizard: { topology: null, dhcp: null, count: null, step: 0 },
                }))
                return
              }
              if (s.field && !state.wizard[s.field]) return
              saveState(prev => ({
                ...prev,
                wizard: { ...prev.wizard, step: Math.min(steps.length - 1, prev.wizard.step + 1) },
              }))
            }}
          >
            {currentStep.isFinal ? 'Restart wizard' : 'Next →'}
          </button>
        </div>
      </div>
    </section>
  )
}
