(function () {
  "use strict";
  window.NetPrint.addRoute("summary", `
<section class="route" id="route-summary" data-route="summary" hidden>
  <h1>Configuration Summary</h1>
  <p class="lede">A consolidated reference of every IP plan and parameter set in this guide.</p>

  <div class="panel">
    <h2>Direct connection (single printer)</h2>
    <div class="kv-row">
      <span>Printer IP (example)</span><code data-copy="192.168.192.168">192.168.192.168</code>
      <span>Laptop manual IP</span><code data-copy="192.168.192.169">192.168.192.169</code>
      <span>Subnet mask</span><code data-copy="255.255.255.0">255.255.255.0</code>
      <span>Gateway</span><code data-copy="192.168.192.1">192.168.192.1</code>
      <span>DNS</span><code data-copy="8.8.8.8">8.8.8.8</code>
    </div>
  </div>

  <div class="panel">
    <h2>Switch only (multiple printers, no router)</h2>
    <div class="kv-row">
      <span>Laptop</span><code data-copy="192.168.1.10">192.168.1.10</code>
      <span>Printer 1</span><code data-copy="192.168.1.11">192.168.1.11</code>
      <span>Printer 2</span><code data-copy="192.168.1.12">192.168.1.12</code>
      <span>Printer 3</span><code data-copy="192.168.1.13">192.168.1.13</code>
      <span>Subnet mask</span><code data-copy="255.255.255.0">255.255.255.0</code>
      <span>Gateway</span><code data-copy="192.168.1.10">192.168.1.10</code>
      <span>DNS</span><code data-copy="8.8.8.8">8.8.8.8</code>
    </div>
  </div>

  <div class="panel">
    <h2>Router-based network</h2>
    <div class="kv-row">
      <span>Laptop</span><code data-copy="192.168.1.10">192.168.1.10</code>
      <span>Printer 1</span><code data-copy="192.168.1.11">192.168.1.11</code>
      <span>Printer 2</span><code data-copy="192.168.1.12">192.168.1.12</code>
      <span>Printer 3</span><code data-copy="192.168.1.13">192.168.1.13</code>
      <span>Subnet mask</span><code data-copy="255.255.255.0">255.255.255.0</code>
      <span>Gateway</span><code data-copy="192.168.1.1">192.168.1.1</code>
      <span>DNS</span><code data-copy="8.8.8.8">8.8.8.8</code>
    </div>
  </div>

  <div class="panel">
    <h2>Your checklist progress</h2>
    <div id="summaryProgress" class="summary-progress"></div>
  </div>
</section>`);
})();
