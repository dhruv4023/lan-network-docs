export default function Troubleshooting() {
  return (
    <section data-route="troubleshooting">
      <h1>Troubleshooting</h1>
      <p className="lede text-muted max-w-[640px]">Expand a symptom to see likely causes and fixes.</p>

      <div className="accordion">
        <details className="acc-item">
          <summary>Printer configuration page won&apos;t open in the browser</summary>
          <div className="acc-body">
            <p>Your laptop&apos;s Ethernet adapter is probably on a different subnet than the printer.</p>
            <ol className="steps">
              <li>Open Network &amp; Internet Settings → Ethernet → adapter properties → IPv4.</li>
              <li>Set IP <code data-copy="192.168.192.169">192.168.192.169</code>, subnet <code data-copy="255.255.255.0">255.255.255.0</code>, gateway <code data-copy="192.168.192.1">192.168.192.1</code>, DNS <code data-copy="8.8.8.8">8.8.8.8</code>.</li>
              <li>Save and retry the printer&apos;s IP in the browser.</li>
            </ol>
          </div>
        </details>

        <details className="acc-item">
          <summary>Two printers stopped responding after connecting them to the switch</summary>
          <div className="acc-body">
            <p>This is almost always an IP conflict — printers often ship with the same default address. Disconnect all printers, then reconnect and configure them <strong>one at a time</strong> with unique static IPs before joining the switch again.</p>
          </div>
        </details>

        <details className="acc-item">
          <summary>A printer becomes unreachable after sitting idle</summary>
          <div className="acc-body">
            <p>Some networks drop idle printers. Keep at least one always‑on wired device (the laptop or any PC) connected to the same network segment as the printer to keep the link active.</p>
          </div>
        </details>

        <details className="acc-item">
          <summary>ePOS Proxy can&apos;t find a printer I just added</summary>
          <div className="acc-body">
            <ol className="steps">
              <li>Re‑print a self‑test page and confirm the printer&apos;s current IP hasn&apos;t changed.</li>
              <li>Ping the printer&apos;s IP from the laptop to confirm reachability.</li>
              <li>Re‑enter the exact IP in <strong>+ Add Network Printer</strong> and click <strong>Add</strong> again.</li>
            </ol>
          </div>
        </details>

        <details className="acc-item">
          <summary>Not enough Ethernet ports on the router for all printers</summary>
          <div className="acc-body">
            <p>Add a network switch between the router and the printers; connect the switch to one router port, then connect all printers to the switch.</p>
          </div>
        </details>

        <details className="acc-item">
          <summary>I don&apos;t know if my printer supports DHCP</summary>
          <div className="acc-body">
            <p>Print a self‑test page — it will show whether DHCP is enabled. If you can&apos;t tell, treat it as disabled and assign a static IP manually via the printer&apos;s Network Settings page.</p>
          </div>
        </details>
      </div>
    </section>
  )
}
