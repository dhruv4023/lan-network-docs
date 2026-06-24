(function () {
  "use strict";
  window.NetPrint.addRoute("router", `
<section class="route" id="route-router" data-route="router" hidden>
  <h1>Router Configuration</h1>
  <p class="lede">Use this when printers join the same router/LAN as the laptop \u2014 typical for an existing office or shop network.</p>

  <div class="panel">
    <div class="diagram diagram-router diagram-lg" aria-hidden="true">
      <div class="node node-laptop">\uD83D\uDCBB Laptop<br><small>192.168.1.10</small></div>
      <div class="link"><span class="packet"></span><em>Ethernet</em></div>
      <div class="node node-router">\uD83D\uDCE1 Router<br><small>Gateway 192.168.1.1</small></div>
      <div class="link"><span class="packet"></span><em>Ethernet</em></div>
      <div class="node node-printer">\uD83D\uDDA8 Printer<br><small>192.168.1.100</small></div>
    </div>

    <h2>IP assignment example</h2>
    <table class="ip-table" data-editable-table>
      <thead><tr><th>Device</th><th>IP address</th><th></th></tr></thead>
      <tbody>
        <tr><td>Laptop</td><td><input class="ip-input" value="192.168.1.10" data-validate="ip"></td><td><button class="copy-btn" data-copy="192.168.1.10">Copy</button></td></tr>
        <tr><td>Printer 1</td><td><input class="ip-input" value="192.168.1.11" data-validate="ip"></td><td><button class="copy-btn" data-copy="192.168.1.11">Copy</button></td></tr>
        <tr><td>Printer 2</td><td><input class="ip-input" value="192.168.1.12" data-validate="ip"></td><td><button class="copy-btn" data-copy="192.168.1.12">Copy</button></td></tr>
        <tr><td>Printer 3</td><td><input class="ip-input" value="192.168.1.13" data-validate="ip"></td><td><button class="copy-btn" data-copy="192.168.1.13">Copy</button></td></tr>
      </tbody>
    </table>

    <h2>Primary network parameters</h2>
    <div class="kv-row">
      <span>Subnet mask</span><code data-copy="255.255.255.0">255.255.255.0</code>
      <span>Default gateway</span><code data-copy="192.168.1.1">192.168.1.1</code>
      <span>DNS server</span><code data-copy="8.8.8.8">8.8.8.8</code>
    </div>

    <div class="callout">
      <strong>Important:</strong> reserve a fixed IP for each printer within the router's range (e.g. 192.168.1.1\u2013192.168.1.255) so they always come back to the same address.
    </div>

    <h2>DHCP reservation vs. static IP</h2>
    <div class="compare-grid">
      <div class="compare-card">
        <h3>DHCP reservation</h3>
        <p>On the printer's self\u2011test page, check if DHCP is enabled. If it is, reserve a fixed IP for that printer's MAC address inside the router's settings \u2014 no printer\u2011side changes needed.</p>
      </div>
      <div class="compare-card">
        <h3>Static IP on the printer</h3>
        <p>If DHCP is disabled or unsupported, open the printer's network settings page directly and assign the IP, subnet, gateway and DNS by hand.</p>
      </div>
    </div>

    <h2>Configure printers one at a time</h2>
    <ol class="steps">
      <li>Connect only one printer directly to the laptop via Ethernet (no router or switch yet).</li>
      <li>Print a self\u2011test page and note the IP and whether DHCP is enabled.</li>
      <li>DHCP enabled \u2192 reserve its IP in the router and move to the next printer. DHCP disabled \u2192 continue below.</li>
      <li>Open a browser to the printer's IP and go to its Network Settings page.
        <div class="callout">
          If the page won't open, set a manual IP on the laptop first:
          <div class="kv-row">
            <span>IP</span><code data-copy="192.168.192.169">192.168.192.169</code>
            <span>Subnet</span><code data-copy="255.255.255.0">255.255.255.0</code>
            <span>Gateway</span><code data-copy="192.168.192.1">192.168.192.1</code>
            <span>DNS</span><code data-copy="8.8.8.8">8.8.8.8</code>
          </div>
        </div>
      </li>
      <li>Assign a unique static IP (e.g. 192.168.1.11), subnet 255.255.255.0, gateway 192.168.1.1, DNS 8.8.8.8. Save, restart if required, then disconnect and repeat for the next printer.</li>
    </ol>

    <h2>Connect the hardware</h2>
    <ol class="steps">
      <li>Connect the laptop to the router.</li>
      <li>Connect all configured printers to the same router.</li>
      <li>Power on the router and all printers.</li>
      <li>Not enough ports on the router? Add a network switch between the router and the printers.</li>
    </ol>

    <div class="callout callout-warn">
      <strong>Keep the link alive.</strong> Leave an always\u2011on wired device on the same network as the printer. Some setups make idle printers unreachable after a short period without an active device present.
    </div>
  </div>
</section>`);
})();
