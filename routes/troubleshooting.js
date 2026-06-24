(function () {
  "use strict";
  window.NetPrint.addRoute("troubleshooting", `
<section class="route" id="route-troubleshooting" data-route="troubleshooting" hidden>
  <h1>Troubleshooting</h1>
  <p class="lede">Expand a symptom to see likely causes and fixes.</p>

  <div class="accordion" id="accordion">
    <details class="acc-item">
      <summary>Printer configuration page won't open in the browser</summary>
      <div class="acc-body">
        <p>Your laptop's Ethernet adapter is probably on a different subnet than the printer.</p>
        <ol class="steps">
          <li>Open Network &amp; Internet Settings \u2192 Ethernet \u2192 adapter properties \u2192 IPv4.</li>
          <li>Set IP <code data-copy="192.168.192.169">192.168.192.169</code>, subnet <code data-copy="255.255.255.0">255.255.255.0</code>, gateway <code data-copy="192.168.192.1">192.168.192.1</code>, DNS <code data-copy="8.8.8.8">8.8.8.8</code>.</li>
          <li>Save and retry the printer's IP in the browser.</li>
        </ol>
      </div>
    </details>

    <details class="acc-item">
      <summary>Two printers stopped responding after connecting them to the switch</summary>
      <div class="acc-body">
        <p>This is almost always an IP conflict \u2014 printers often ship with the same default address. Disconnect all printers, then reconnect and configure them <strong>one at a time</strong> with unique static IPs before joining the switch again.</p>
      </div>
    </details>

    <details class="acc-item">
      <summary>A printer becomes unreachable after sitting idle</summary>
      <div class="acc-body">
        <p>Some networks drop idle printers. Keep at least one always\u2011on wired device (the laptop or any PC) connected to the same network segment as the printer to keep the link active.</p>
      </div>
    </details>

    <details class="acc-item">
      <summary>ePOS Proxy can't find a printer I just added</summary>
      <div class="acc-body">
        <ol class="steps">
          <li>Re\u2011print a self\u2011test page and confirm the printer's current IP hasn't changed.</li>
          <li>Ping the printer's IP from the laptop to confirm reachability.</li>
          <li>Re\u2011enter the exact IP in <strong>+ Add Network Printer</strong> and click <strong>Add</strong> again.</li>
        </ol>
      </div>
    </details>

    <details class="acc-item">
      <summary>Not enough Ethernet ports on the router for all printers</summary>
      <div class="acc-body">
        <p>Add a network switch between the router and the printers; connect the switch to one router port, then connect all printers to the switch.</p>
      </div>
    </details>

    <details class="acc-item">
      <summary>I don't know if my printer supports DHCP</summary>
      <div class="acc-body">
        <p>Print a self\u2011test page \u2014 it will show whether DHCP is enabled. If you can't tell, treat it as disabled and assign a static IP manually via the printer's Network Settings page.</p>
      </div>
    </details>
  </div>
</section>`);
})();
