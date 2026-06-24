(function () {
  "use strict";
  window.NetPrint.addRoute("home", `
<section class="route" id="route-home" data-route="home">
  <div class="hero">
    <p class="eyebrow">Knowledge base \u00B7 Receipt &amp; label printers</p>
    <h1>Get your thermal printers talking to your network \u2014 in three topologies.</h1>
    <p class="lede">This console turns the LAN printer configuration runbook into a guided, checkable, copy\u2011paste\u2011safe setup flow: direct connection, switch with no router, and full router-based deployments.</p>
    <div class="hero-actions">
      <button class="btn btn-primary" data-goto="wizard">Start the setup wizard \u2192</button>
    </div>
  </div>

  <div class="card-grid">
    <article class="topo-card" data-goto="network" data-topo="single" role="button" tabindex="0" aria-label="Open network setup for a single printer">
      <h3>\u2460 Single printer, no router</h3>
      <div class="diagram diagram-single" aria-hidden="true">
        <div class="node node-laptop">\uD83D\uDCBB Laptop</div>
        <div class="link"><span class="packet"></span></div>
        <div class="node node-printer">\uD83D\uDDA8 Printer</div>
      </div>
      <p>One printer wired straight into your laptop with an Ethernet cable. Fastest path for a single till.</p>
    </article>

    <article class="topo-card" data-goto="network" data-topo="multi" role="button" tabindex="0" aria-label="Open network setup for multiple printers with a switch">
      <h3>\u2461 Multiple printers, switch only</h3>
      <div class="diagram diagram-switch" aria-hidden="true">
        <div class="node node-laptop">\uD83D\uDCBB Laptop</div>
        <div class="link"><span class="packet"></span></div>
        <div class="node node-switch">\uD83D\uDD00 Switch</div>
        <div class="fanout">
          <div class="link short"><span class="packet"></span></div>
          <div class="link short"><span class="packet"></span></div>
          <div class="link short"><span class="packet"></span></div>
        </div>
        <div class="node-stack">
          <div class="node node-printer small">\uD83D\uDDA8 P1</div>
          <div class="node node-printer small">\uD83D\uDDA8 P2</div>
          <div class="node node-printer small">\uD83D\uDDA8 P3</div>
        </div>
      </div>
      <p>No router on site \u2014 laptop and printers share a fixed-IP subnet through a gigabit switch.</p>
    </article>

    <article class="topo-card" data-goto="router" data-topo="router" role="button" tabindex="0" aria-label="Open router-based network setup">
      <h3>\u2462 Router-based network</h3>
      <div class="diagram diagram-router" aria-hidden="true">
        <div class="node node-laptop">\uD83D\uDCBB Laptop</div>
        <div class="link"><span class="packet"></span></div>
        <div class="node node-router">\uD83D\uDCE1 Router</div>
        <div class="link"><span class="packet"></span></div>
        <div class="node node-printer">\uD83D\uDDA8 Printer</div>
      </div>
      <p>Printers join the existing office Wi\u2011Fi router/LAN, with IPs reserved so they never drift.</p>
    </article>
  </div>

  <div class="overview-grid">
    <div class="panel">
      <h2>What you'll configure</h2>
      <ul class="check-list" data-checklist="overview">
        <li><label><input type="checkbox"> Identify your topology (direct / switch / router)</label></li>
        <li><label><input type="checkbox"> Print a printer self\u2011test page to find its current IP</label></li>
        <li><label><input type="checkbox"> Set a static IP, subnet mask, gateway and DNS on each printer</label></li>
        <li><label><input type="checkbox"> Match the laptop's Ethernet adapter to the same subnet</label></li>
        <li><label><input type="checkbox"> Add each printer to the ePOS Proxy app</label></li>
        <li><label><input type="checkbox"> Verify every printer responds and prints a test job</label></li>
      </ul>
      <p class="hint">Progress saves automatically in this browser.</p>
    </div>
    <div class="panel warning-card">
      <h2>\u26A0 Before you start</h2>
      <p>Many thermal printers ship with the <strong>same default static IP</strong>. If you connect several at once before configuring them, you will get IP conflicts. Always configure printers <strong>one at a time</strong>, disconnected from each other, before joining them to the shared switch or router.</p>
      <p>Keep one always\u2011on device (this laptop, or any PC) connected to the same wired network as the printers \u2014 some setups drop an idle printer from the network until traffic resumes.</p>
    </div>
  </div>
</section>`);
})();
