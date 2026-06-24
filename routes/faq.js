(function () {
  "use strict";
  window.NetPrint.addRoute("faq", `
<section class="route" id="route-faq" data-route="faq" hidden>
  <h1>Frequently Asked Questions</h1>

  <div class="accordion" id="faqAccordion">
    <details class="acc-item">
      <summary>Do I need a router for a single printer?</summary>
      <div class="acc-body"><p>No. A single printer can be wired directly to your laptop with an Ethernet cable \u2014 no router or switch required.</p></div>
    </details>
    <details class="acc-item">
      <summary>Why do all my printers need the same subnet mask?</summary>
      <div class="acc-body"><p>Devices can only talk directly to each other if they're on the same subnet. Mismatched subnet masks make printers unreachable even with correct IPs.</p></div>
    </details>
    <details class="acc-item">
      <summary>Can I reuse the same static IP plan across stores?</summary>
      <div class="acc-body"><p>Yes \u2014 the IP assignment examples (192.168.1.10\u2013.13, etc.) are a template. Just make sure no other device on that location's network already uses those addresses.</p></div>
    </details>
    <details class="acc-item">
      <summary>What's the difference between the switch\u2011only and router setups?</summary>
      <div class="acc-body"><p>A switch\u2011only network has no internet gateway or DHCP server \u2014 every device needs a manually assigned static IP. A router setup can offer DHCP reservations, so the router itself remembers each printer's address.</p></div>
    </details>
    <details class="acc-item">
      <summary>What DNS server should I use?</summary>
      <div class="acc-body"><p>The runbook uses Google's public DNS, <code data-copy="8.8.8.8">8.8.8.8</code>, as the default preferred DNS for laptops and printers alike.</p></div>
    </details>
  </div>
</section>`);
})();
