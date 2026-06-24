(function () {
"use strict";

window.NetPrint.addRoute("printer", `

<section class="route" id="route-printer" data-route="printer" hidden>
  <h1>Printer Configuration</h1>

  <p class="lede">
    Configure each printer individually before connecting multiple printers to the network.
    Keep a record of all assigned IP addresses to avoid conflicts.
  </p>

  <div class="panel">
    <h2>1. Print a Self-Test Page</h2>


<ol class="steps">
  <li>Turn the printer off.</li>
  <li>Press and hold <kbd>FEED</kbd>.</li>
  <li>Turn the printer on while continuing to hold <kbd>FEED</kbd>.</li>
  <li>Release <kbd>FEED</kbd> when the self-test page begins printing.</li>
  <li>Keep noted the printer's IP address, subnet mask, gateway and MAC address.</li>
</ol>

<p class="hint">
  The MAC address will be required later when reserving the printer's IP address in the router.
</p>

  </div>

  <div class="panel">
    <h2>2. Open the Printer Configuration Page</h2>


<ol class="steps">
  <li>Connect the printer to your laptop using Ethernet.</li>
  <li>Open a web browser.</li>
  <li>Enter the printer's IP address from the self-test page.</li>
  <li>If the printer configuration page opens, continue to the next step.</li>
  <li>If it does not open, temporarily configure your laptop's Ethernet adapter with an IP address on the same subnet as the printer.</li>
</ol>

<div class="note">
  <strong>Example laptop network settings</strong>

  <table class="config-table">
    <tbody>
      <tr>
        <th>IP Address</th>
        <td>192.168.192.169</td>
      </tr>
      <tr>
        <th>Subnet Mask</th>
        <td>255.255.255.0</td>
      </tr>
      <tr>
        <th>Default Gateway</th>
        <td>192.168.192.1</td>
      </tr>
      <tr>
        <th>Preferred DNS</th>
        <td>8.8.8.8</td>
      </tr>
    </tbody>
  </table>

  <p>
    These values are examples only. Use settings that match the subnet shown on the printer's self-test page.
  </p>

  <p>
    Windows:
    Network &amp; Internet Settings →
    Ethernet →
    Change Adapter Options →
    Ethernet Properties →
    Internet Protocol Version 4 (TCP/IPv4).
  </p>
</div>


  </div>

  <div class="panel">
    <h2>3. Assign the Final Printer IP Address</h2>


<ol class="steps">
  <li>Open the printer's network settings page.</li>
  <li>Assign the IP address that will be used in production.</li>
  <li>Configure the subnet mask and gateway according to your network topology.</li>
  <li>Save the configuration.</li>
  <li>Restart the printer if required.</li>
  <li>Verify that the printer is reachable using its new IP address.</li>
</ol>

<p class="hint">
  Use a unique IP address for every printer.
</p>

  </div>

  <div class="panel">
    <h2>4. Reserve the Printer IP Address in the Router</h2>

<ol class="steps">
  <li>Log in to the router administration page.</li>
  <li>Locate the DHCP Reservation, Static Lease, or Address Reservation section.</li>
  <li>Create a reservation using the printer's MAC address.</li>
  <li>Assign the same IP address configured on the printer.</li>
  <li>Save the router configuration.</li>
  <li>Repeat for every printer.</li>
</ol>

<p class="hint">
  This prevents another device from receiving the same IP address.
</p>

  </div>

  <div class="panel">
    <h2>5. Add Printers to ePOS Proxy</h2>

<ol class="steps">
  <li>Open the ePOS Proxy application.</li>
  <li>Click <strong>+ Add Network Printer</strong>.</li>
  <li>Enter the printer's IP address.</li>
  <li>Click <strong>Add</strong>.</li>
  <li>Repeat for all printers.</li>
  <li>Confirm that every printer appears as reachable.</li>
</ol>

  </div>

  <div class="panel">
    <h2>6. Verification Checklist</h2>

<ul class="check-list" data-checklist="verify">
  <li><label><input type="checkbox"> Self-test page printed successfully</label></li>
  <li><label><input type="checkbox"> Printer web interface is accessible</label></li>
  <li><label><input type="checkbox"> Production IP address assigned</label></li>
  <li><label><input type="checkbox"> IP address reserved in the router</label></li>
  <li><label><input type="checkbox"> No duplicate IP addresses exist on the network</label></li>
  <li><label><input type="checkbox"> Printer added to ePOS Proxy</label></li>
  <li><label><input type="checkbox"> Printer shows as reachable</label></li>
  <li><label><input type="checkbox"> Test print completed successfully</label></li>
</ul>

  </div>
</section>`);
})();
