(function () {
  "use strict";
  window.NetPrint.addRoute("network", `
<section class="route" id="route-network" data-route="network" hidden>
  <h1>Without router</h1>
  <p class="lede">Choose the physical layout that matches your store, then mirror the IP plan below.</p>

  <div class="tabs" data-tabgroup="network">
    <button class="tab is-active" data-tab="single">Single printer, direct</button>
    <button class="tab" data-tab="multi">Multiple printers, switch only</button>
  </div>

  <div class="tab-panel is-active" data-tabpanel="single">
    <div class="panel">
      <h2>Connect a single printer directly to your laptop</h2>
      <div class="diagram diagram-single diagram-lg" aria-hidden="true">
        <div class="node node-laptop">\uD83D\uDCBB Laptop</div>
        <div class="link"><span class="packet"></span><em>Ethernet</em></div>
        <div class="node node-printer">\uD83D\uDDA8 Printer</div>
      </div>
      <ol class="steps">
        <li>Connect the printer directly to your laptop using an Ethernet cable.</li>
        <li>Determine the printer's current IP address \u2014 it may print a receipt containing the IP automatically.
          <div class="callout">
            <strong>No receipt printed?</strong> Run a self\u2011test:
            <ol class="steps nested">
              <li>Turn the printer off.</li>
              <li>Press and hold the <kbd>FEED</kbd> button.</li>
              <li>Turn the printer on while still holding <kbd>FEED</kbd>.</li>
              <li>Release once the self\u2011test page prints \u2014 it lists the printer's IP, subnet and gateway.</li>
            </ol>
          </div>
        </li>
        <li>Open a browser and enter the printer's IP address. Example:
          <div class="kv-row">
            <span>IP address</span><code data-copy="192.168.192.168">192.168.192.168</code>
            <span>Subnet</span><code data-copy="255.255.255.0">255.255.255.0</code>
            <span>Gateway</span><code data-copy="192.168.192.168">192.168.192.168</code>
          </div>
        </li>
        <li>If the configuration page opens, skip to step 6.</li>
        <li>If it does <strong>not</strong> open, set a manual IP on your laptop's Ethernet adapter:
          <div class="config-table" data-validate-group="laptop-manual">
            <div class="config-row" data-field="ip"><span>IP address</span><code data-copy="192.168.192.169">192.168.192.169</code></div>
            <div class="config-row" data-field="subnet"><span>Subnet mask</span><code data-copy="255.255.255.0">255.255.255.0</code></div>
            <div class="config-row" data-field="gateway"><span>Default gateway</span><code data-copy="192.168.192.1">192.168.192.1</code></div>
            <div class="config-row" data-field="dns"><span>Preferred DNS</span><code data-copy="8.8.8.8">8.8.8.8</code></div>
          </div>
          <p class="hint">Path: Network &amp; Internet Settings \u2192 Ethernet \u2192 adapter properties \u2192 IPv4.</p>
        </li>
        <li>The printer configuration page should now open.</li>
        <li>In the ePOS Proxy app, click <strong>+ Add Network Printer</strong>, enter the printer IP, and click <strong>Add</strong>.</li>
      </ol>
    </div>
  </div>

  <div class="tab-panel" data-tabpanel="multi">
    <div class="panel">
      <h2>Multiple printers via a switch \u2014 no router</h2>
      <p>For stores with several printers and no router: every device gets a fixed IP on the same subnet, connected through an unmanaged switch.</p>
      <div class="diagram diagram-switch diagram-lg" aria-hidden="true">
        <div class="node node-laptop">\uD83D\uDCBB Laptop</div>
        <div class="link"><span class="packet"></span></div>
        <div class="node node-switch">\uD83D\uDD00 8\u2011port switch</div>
        <div class="fanout">
          <div class="link short"><span class="packet"></span></div>
          <div class="link short"><span class="packet"></span></div>
          <div class="link short"><span class="packet"></span></div>
        </div>
        <div class="node-stack">
          <div class="node node-printer small">\uD83D\uDDA8 Printer 1</div>
          <div class="node node-printer small">\uD83D\uDDA8 Printer 2</div>
          <div class="node node-printer small">\uD83D\uDDA8 Printer 3</div>
        </div>
      </div>

      <h3>IP assignment plan</h3>
      <table class="ip-table" data-editable-table>
        <thead><tr><th>Device</th><th>IP address</th><th></th></tr></thead>
        <tbody>
          <tr><td>Laptop</td><td><input class="ip-input" value="192.168.1.10" data-validate="ip"></td><td><button class="copy-btn" data-copy="192.168.1.10">Copy</button></td></tr>
          <tr><td>Printer 1</td><td><input class="ip-input" value="192.168.1.11" data-validate="ip"></td><td><button class="copy-btn" data-copy="192.168.1.11">Copy</button></td></tr>
          <tr><td>Printer 2</td><td><input class="ip-input" value="192.168.1.12" data-validate="ip"></td><td><button class="copy-btn" data-copy="192.168.1.12">Copy</button></td></tr>
          <tr><td>Printer 3</td><td><input class="ip-input" value="192.168.1.13" data-validate="ip"></td><td><button class="copy-btn" data-copy="192.168.1.13">Copy</button></td></tr>
        </tbody>
      </table>
      <p class="hint" id="ipConflictHint">Edit any address \u2014 duplicates and malformed IPs are flagged instantly.</p>

      <h3>Primary network parameters</h3>
      <div class="kv-row">
        <span>Subnet mask</span><code data-copy="255.255.255.0">255.255.255.0</code>
        <span>Default gateway</span><code data-copy="192.168.1.10">192.168.1.10</code>
        <span>DNS server</span><code data-copy="8.8.8.8">8.8.8.8</code>
      </div>

      <div class="callout callout-warn">
        <strong>Configure printers one at a time.</strong> Many printers ship with the same default static IP. Connect only one printer at a time directly to the laptop, assign its unique static IP, disable DHCP if needed, then disconnect it and repeat for the next printer \u2014 <em>before</em> wiring everything to the switch.
      </div>

      <ol class="steps">
        <li>Connect the laptop to the network switch.</li>
        <li>Connect all (already\u2011configured) printers to the same switch.</li>
        <li>Power on the switch and all printers.</li>
        <li>Set the laptop's Ethernet adapter to a static IP matching the plan above (e.g. 192.168.1.10 / 255.255.255.0, gateway 192.168.1.1, DNS 8.8.8.8).</li>
        <li>In ePOS Proxy, add each printer: <strong>+ Add Network Printer</strong> \u2192 enter its IP \u2192 <strong>Add</strong>.</li>
      </ol>
    </div>
  </div>
</section>`);
})();
