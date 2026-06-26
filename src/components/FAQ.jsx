export default function FAQ() {
  return (
    <section data-route="faq">
      <h1>Frequently Asked Questions</h1>

      <div className="accordion">
        <details className="acc-item">
          <summary>Do I need a router for a single printer?</summary>
          <div className="acc-body"><p>No. A single printer can be wired directly to your laptop with an Ethernet cable — no router or switch required.</p></div>
        </details>
        <details className="acc-item">
          <summary>Why do all my printers need the same subnet mask?</summary>
          <div className="acc-body"><p>Devices can only talk directly to each other if they&apos;re on the same subnet. Mismatched subnet masks make printers unreachable even with correct IPs.</p></div>
        </details>
        <details className="acc-item">
          <summary>Can I reuse the same static IP plan across stores?</summary>
          <div className="acc-body"><p>Yes — the IP assignment examples (192.168.1.10–.13, etc.) are a template. Just make sure no other device on that location&apos;s network already uses those addresses.</p></div>
        </details>
        <details className="acc-item">
          <summary>What&apos;s the difference between the switch‑only and router setups?</summary>
          <div className="acc-body"><p>A switch‑only network has no internet gateway or DHCP server — every device needs a manually assigned static IP. A router setup can offer DHCP reservations, so the router itself remembers each printer&apos;s address.</p></div>
        </details>
        <details className="acc-item">
          <summary>What DNS server should I use?</summary>
          <div className="acc-body"><p>The runbook uses Google&apos;s public DNS, <code data-copy="8.8.8.8">8.8.8.8</code>, as the default preferred DNS for laptops and printers alike.</p></div>
        </details>
      </div>
    </section>
  )
}
