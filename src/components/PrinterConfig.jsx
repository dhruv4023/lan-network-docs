export default function PrinterConfig({ state, saveState }) {
  const handleChecklistChange = (key, index, checked) => {
    saveState(prev => {
      const values = [...((prev.checklists && prev.checklists[key]) || [])]
      values[index] = checked
      return {
        ...prev,
        checklists: { ...prev.checklists, [key]: values },
      }
    })
  }

  return (
    <section data-route="printer">
      <h1>Printer Configuration</h1>
      <p className="lede text-muted max-w-[640px]">
        Configure each printer individually before connecting multiple printers to the network.
        Keep a record of all assigned IP addresses to avoid conflicts.
      </p>

      <div className="panel">
        <h2>1. Print a Self-Test Page</h2>
        <ol className="steps">
          <li>Turn the printer off.</li>
          <li>Press and hold <kbd>FEED</kbd>.</li>
          <li>Turn the printer on while continuing to hold <kbd>FEED</kbd>.</li>
          <li>Release <kbd>FEED</kbd> when the self-test page begins printing.</li>
          <li>Keep noted the printer&apos;s IP address, subnet mask, gateway and MAC address.</li>
        </ol>
        <p className="hint">The MAC address will be required later when reserving the printer&apos;s IP address in the router.</p>
      </div>

      <div className="panel">
        <h2>2. Open the Printer Configuration Page</h2>
        <ol className="steps">
          <li>Connect the printer to your laptop using Ethernet.</li>
          <li>Open a web browser.</li>
          <li>Enter the printer&apos;s IP address from the self-test page.</li>
          <li>If the printer configuration page opens, continue to the next step.</li>
          <li>If it does not open, temporarily configure your laptop&apos;s Ethernet adapter with an IP address on the same subnet as the printer.</li>
        </ol>

        <div className="callout">
          <strong>Example laptop network settings</strong>
          <div className="config-table mt-2">
            <div className="config-row"><span>IP Address</span><code data-copy="192.168.192.169">192.168.192.169</code></div>
            <div className="config-row"><span>Subnet Mask</span><code data-copy="255.255.255.0">255.255.255.0</code></div>
            <div className="config-row"><span>Default Gateway</span><code data-copy="192.168.192.1">192.168.192.1</code></div>
            <div className="config-row"><span>Preferred DNS</span><code data-copy="8.8.8.8">8.8.8.8</code></div>
          </div>
          <p className="mt-2">These values are examples only. Use settings that match the subnet shown on the printer&apos;s self-test page.</p>
          <p>Windows: Network &amp; Internet Settings → Ethernet → Change Adapter Options → Ethernet Properties → Internet Protocol Version 4 (TCP/IPv4).</p>
        </div>
      </div>

      <div className="panel">
        <h2>3. Assign the Final Printer IP Address</h2>
        <ol className="steps">
          <li>Open the printer&apos;s network settings page.</li>
          <li>Assign the IP address that will be used in production.</li>
          <li>Configure the subnet mask and gateway according to your network topology.</li>
          <li>Save the configuration.</li>
          <li>Restart the printer if required.</li>
          <li>Verify that the printer is reachable using its new IP address.</li>
        </ol>
        <p className="hint">Use a unique IP address for every printer.</p>
      </div>

      <div className="panel">
        <h2>4. Reserve the Printer IP Address in the Router</h2>
        <ol className="steps">
          <li>Log in to the router administration page.</li>
          <li>Locate the DHCP Reservation, Static Lease, or Address Reservation section.</li>
          <li>Create a reservation using the printer&apos;s MAC address.</li>
          <li>Assign the same IP address configured on the printer.</li>
          <li>Save the router configuration.</li>
          <li>Repeat for every printer.</li>
        </ol>
        <p className="hint">This prevents another device from receiving the same IP address.</p>
      </div>

      <div className="panel">
        <h2>5. Add Printers to ePOS Proxy</h2>
        <ol className="steps">
          <li>Open the ePOS Proxy application.</li>
          <li>Click <strong>+ Add Network Printer</strong>.</li>
          <li>Enter the printer&apos;s IP address.</li>
          <li>Click <strong>Add</strong>.</li>
          <li>Repeat for all printers.</li>
          <li>Confirm that every printer appears as reachable.</li>
        </ol>
      </div>

      <div className="panel">
        <h2>6. Verification Checklist</h2>
        <ul className="check-list" data-checklist="verify">
          {[
            'Self-test page printed successfully',
            'Printer web interface is accessible',
            'Production IP address assigned',
            'IP address reserved in the router',
            'No duplicate IP addresses exist on the network',
            'Printer added to ePOS Proxy',
            'Printer shows as reachable',
            'Test print completed successfully',
          ].map((label, i) => (
            <li key={i}>
              <label>
                <input
                  type="checkbox"
                  checked={!!((state.checklists && state.checklists['verify'] && state.checklists['verify'][i]))}
                  onChange={e => handleChecklistChange('verify', i, e.target.checked)}
                />
                {label}
              </label>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
