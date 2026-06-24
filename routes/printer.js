(function () {
  "use strict";
  window.NetPrint.addRoute("printer", `
<section class="route" id="route-printer" data-route="printer" hidden>
  <h1>Printer Configuration</h1>
  <p class="lede">Per\u2011printer walkthroughs: self\u2011test, static IP, DHCP reservation, and adding to ePOS Proxy.</p>

  <div class="panel">
    <h2>1. Print a self\u2011test page</h2>
    <ol class="steps">
      <li>Turn the printer off.</li>
      <li>Press and hold <kbd>FEED</kbd>.</li>
      <li>Turn the printer on while still holding <kbd>FEED</kbd>.</li>
      <li>Release once the page prints. Note the IP, subnet and gateway shown.</li>
    </ol>
  </div>

  <div class="panel">
    <h2>2. Static IP assignment walkthrough</h2>
    <ol class="steps">
      <li>Connect only this printer to the laptop, isolated from other printers.</li>
      <li>Browse to the printer's current IP and open its Network Settings page.</li>
      <li>Disable DHCP if it's enabled.</li>
      <li>Enter a unique static IP, matching subnet mask, gateway and DNS for your topology.</li>
      <li>Save, restart the printer if prompted, then disconnect before configuring the next unit.</li>
    </ol>
  </div>

  <div class="panel">
    <h2>3. DHCP reservation walkthrough (router topology only)</h2>
    <ol class="steps">
      <li>Check the self\u2011test page \u2014 if DHCP is enabled, leave it on.</li>
      <li>Log into the router's admin page and find DHCP reservations / static leases.</li>
      <li>Add a reservation pairing the printer's MAC address to a chosen IP inside the router's range.</li>
      <li>Reboot the printer; confirm it now always receives that reserved IP.</li>
    </ol>
  </div>

  <div class="panel">
    <h2>4. Add the printer to ePOS Proxy</h2>
    <ol class="steps">
      <li>Open the ePOS Proxy application.</li>
      <li>Click <strong>+ Add Network Printer</strong>.</li>
      <li>Enter the printer's IP address.</li>
      <li>Click <strong>Add</strong>. Repeat for every printer.</li>
    </ol>
  </div>

  <div class="panel">
    <h2>5. Network verification checklist</h2>
    <ul class="check-list" data-checklist="verify">
      <li><label><input type="checkbox"> Printer's self\u2011test IP matches what you configured</label></li>
      <li><label><input type="checkbox"> Laptop and printer(s) share the same subnet mask</label></li>
      <li><label><input type="checkbox"> No two devices share the same IP address</label></li>
      <li><label><input type="checkbox"> Printer configuration page loads from a browser</label></li>
      <li><label><input type="checkbox"> Printer added in ePOS Proxy and shows as reachable</label></li>
      <li><label><input type="checkbox"> Test print succeeds</label></li>
    </ul>
  </div>
</section>`);
})();
