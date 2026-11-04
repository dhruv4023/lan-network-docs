export default function NetworkDiagram() {
  return (
    <svg viewBox="0 0 840 620" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto max-w-3xl mx-auto">
      <defs>
        <filter id="ng-shadow">
          <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#000" flood-opacity="0.4"/>
        </filter>
      </defs>

      <pattern id="ng-grid" width="30" height="30" patternUnits="userSpaceOnUse">
        <path d="M 30 0 L 0 0 0 30" fill="none" stroke="var(--color-line)" strokeOpacity="0.12" strokeWidth="0.5"/>
      </pattern>
      <rect width="840" height="620" fill="url(#ng-grid)"/>

      {/* ===== LINKS ===== */}

      {/* Internet ── ISP Modem */}
      <line className="ng-link" x1="420" y1="41" x2="420" y2="80"/>
      <line className="ng-wave" x1="420" y1="41" x2="420" y2="80"/>

      {/* ISP Modem ── Router */}
      <line className="ng-link" x1="420" y1="116" x2="420" y2="195"/>
      <line className="ng-wave" x1="420" y1="116" x2="420" y2="195"/>

      {/* Router ── Switch */}
      <line className="ng-link" x1="420" y1="247" x2="420" y2="310"/>
      <line className="ng-wave" x1="420" y1="247" x2="420" y2="310"/>

      {/* Switch ── PC (Ethernet) */}
      <line className="ng-link" x1="385" y1="346" x2="385" y2="445"/>
      <line className="ng-link" x1="385" y1="445" x2="195" y2="445"/>
      <line className="ng-wave" x1="385" y1="445" x2="195" y2="445" style={{ animationDelay: '0.2s' }} />
      <line className="ng-wave ng-dhcp" x1="195" y1="445" x2="385" y2="445" style={{ animationDelay: '0.8s' }} />

      {/* Switch ── Printer (Ethernet) */}
      <line className="ng-link" x1="455" y1="346" x2="455" y2="445"/>
      <line className="ng-link" x1="455" y1="445" x2="550" y2="445"/>
      <line className="ng-wave" x1="455" y1="445" x2="550" y2="445" style={{ animationDelay: '0.6s' }} />
      <line className="ng-wave ng-dhcp" x1="550" y1="445" x2="455" y2="445" style={{ animationDelay: '1.2s' }} />

      {/* Router ── AP (Ethernet) */}
      <line className="ng-link" x1="500" y1="221" x2="565" y2="223"/>
      <line className="ng-wave" x1="500" y1="221" x2="565" y2="223" style={{ animationDelay: '0.3s' }} />
      <line className="ng-wave ng-dhcp" x1="565" y1="223" x2="500" y2="221" style={{ animationDelay: '1s' }} />

      {/* AP ── Phone (Wi-Fi) */}
      <line className="ng-link" x1="642" y1="246" x2="642" y2="330" strokeDasharray="6 4"/>
      <line className="ng-wave" x1="642" y1="246" x2="642" y2="330" style={{ animationDelay: '0.5s' }} strokeDasharray="6 10"/>
      <line className="ng-wave ng-dhcp" x1="642" y1="330" x2="642" y2="246" style={{ animationDelay: '1.5s' }} strokeDasharray="4 12"/>

      {/* ===== PULSE DOTS ===== */}
      <circle className="ng-pulse" cx="420" cy="60" r="4"/>
      <circle className="ng-pulse" cx="420" cy="155" r="4"/>
      <circle className="ng-pulse" cx="420" cy="278" r="4"/>
      <circle className="ng-pulse" cx="290" cy="445" r="4"/>
      <circle className="ng-pulse" cx="502" cy="445" r="4"/>
      <circle className="ng-pulse" cx="535" cy="222" r="4"/>
      <circle className="ng-pulse" cx="642" cy="288" r="4"/>

      {/* ===== DATA PACKETS ===== */}
      <rect className="ng-packet" x="416" y="50" width="8" height="6" rx="2"/>
      <rect className="ng-packet" x="416" y="145" width="8" height="6" rx="2" style={{ animationDelay: '0.8s' }}/>
      <rect className="ng-packet" x="416" y="268" width="8" height="6" rx="2" style={{ animationDelay: '0.4s' }}/>
      <rect className="ng-packet" x="290" y="442" width="8" height="6" rx="2" style={{ animationDelay: '0.3s' }}/>
      <rect className="ng-packet-dhcp" x="300" y="442" width="8" height="6" rx="2" style={{ animationDelay: '0.9s' }}/>
      <rect className="ng-packet" x="502" y="442" width="8" height="6" rx="2" style={{ animationDelay: '0.7s' }}/>
      <rect className="ng-packet-dhcp" x="492" y="442" width="8" height="6" rx="2" style={{ animationDelay: '1.3s' }}/>
      <rect className="ng-packet" x="530" y="220" width="8" height="6" rx="2" style={{ animationDelay: '0.4s' }}/>
      <rect className="ng-packet-dhcp" x="540" y="220" width="8" height="6" rx="2" style={{ animationDelay: '1.1s' }}/>
      <rect className="ng-packet-dhcp" x="638" y="285" width="8" height="6" rx="2" style={{ animationDelay: '1.6s' }}/>

      {/* ===== SUBNET RINGS ===== */}
      <circle className="ng-ring" cx="420" cy="226" r="60"/>
      <circle className="ng-ring" cx="420" cy="226" r="60" style={{ animationDelay: '1.3s' }}/>
      <circle className="ng-ring" cx="420" cy="226" r="60" style={{ animationDelay: '2.6s' }}/>

      {/* ===== NODES ===== */}

      {/* Internet */}
      <g filter="url(#ng-shadow)">
        <rect x="365" y="5" width="110" height="36" rx="8" fill="var(--color-panel)" stroke="var(--color-line)"/>
        <text className="ng-label" x="420" y="23">☁ Internet</text>
      </g>

      {/* ISP Modem */}
      <g filter="url(#ng-shadow)">
        <rect x="365" y="80" width="110" height="36" rx="8" fill="var(--color-panel)" stroke="var(--color-line)"/>
        <text className="ng-label" x="420" y="98">ISP Modem</text>
        <text className="ng-sub" x="420" y="116">Public IP</text>
      </g>

      {/* Router (Gateway) */}
      <g filter="url(#ng-shadow)">
        <rect x="340" y="195" width="160" height="52" rx="8" fill="var(--color-panel)" stroke="var(--color-accent)"/>
        <text className="ng-label" x="420" y="215">Router (Gateway)</text>
        <text className="ng-sub" x="420" y="231">192.168.1.1</text>
        <text className="ng-badge" x="420" y="245">DHCP + DNS Server</text>
      </g>

      {/* Switch */}
      <g filter="url(#ng-shadow)">
        <rect x="370" y="310" width="100" height="36" rx="8" fill="var(--color-panel)" stroke="var(--color-accent-dim)"/>
        <text className="ng-label" x="420" y="328">🔀 Switch</text>
      </g>

      {/* LAN label */}
      <text x="420" y="390" fill="var(--color-muted)" fontSize="10" textAnchor="middle" letterSpacing="2">
        ═══ LAN ── 192.168.1.0/24 ═══
      </text>

      {/* Cable labels */}
      <text x="290" y="438" fill="var(--color-muted)" fontSize="8" textAnchor="middle" letterSpacing="1">Ethernet</text>
      <text x="502" y="438" fill="var(--color-muted)" fontSize="8" textAnchor="middle" letterSpacing="1">Ethernet</text>

      {/* Developer PC */}
      <g filter="url(#ng-shadow)">
        <rect x="110" y="445" width="170" height="46" rx="8" fill="var(--color-panel)" stroke="var(--color-accent)"/>
        <text className="ng-label" x="195" y="463">💻 Developer PC</text>
        <text className="ng-sub" x="195" y="479">192.168.1.10</text>
      </g>

      {/* Thermal Printer */}
      <g filter="url(#ng-shadow)">
        <rect x="470" y="445" width="160" height="46" rx="8" fill="var(--color-panel)" stroke="var(--color-accent)"/>
        <text className="ng-label" x="550" y="463">🖨 Thermal Printer</text>
        <text className="ng-sub" x="550" y="479">192.168.1.20</text>
      </g>

      {/* Access Point */}
      <g filter="url(#ng-shadow)">
        <rect x="565" y="200" width="155" height="46" rx="8" fill="var(--color-panel)" stroke="var(--color-warn)"/>
        <text className="ng-label" x="642" y="218">📡 Access Point</text>
        <text className="ng-sub" x="642" y="234">192.168.1.2</text>
      </g>

      {/* Wi-Fi zone oval behind phone */}
      <ellipse cx="642" cy="353" rx="90" ry="45" fill="var(--color-warn)" opacity="0.04" stroke="var(--color-warn)" strokeOpacity="0.12" strokeWidth="1" strokeDasharray="4 6"/>

      {/* Wi-Fi signal arcs */}
      <path className="ng-wifi-arc" d="M 610 290 A 25 20 0 0 1 674 290" fill="none" stroke="var(--color-warn)" strokeWidth="2" opacity="0.3"/>
      <path className="ng-wifi-arc" d="M 597 278 A 45 35 0 0 1 687 278" fill="none" stroke="var(--color-warn)" strokeWidth="2" opacity="0.25"/>
      <path className="ng-wifi-arc" d="M 582 265 A 65 50 0 0 1 702 265" fill="none" stroke="var(--color-warn)" strokeWidth="2" opacity="0.2"/>

      <text x="712" y="280" fill="var(--color-muted)" fontSize="9" textAnchor="middle" letterSpacing="1">Wi-Fi</text>

      {/* Android Phone */}
      <g filter="url(#ng-shadow)">
        <rect x="562" y="330" width="160" height="46" rx="8" fill="var(--color-panel)" stroke="#7eb85e"/>
        <text className="ng-label" x="642" y="348">📱 Android Phone</text>
        <text className="ng-sub" x="642" y="364">192.168.1.30</text>
      </g>

      <style>{`
        .ng-link { stroke: var(--color-line); stroke-width: 2; fill: none; }
        .ng-wave {
          stroke: var(--color-accent); stroke-width: 2; fill: none;
          stroke-dasharray: 8 12;
          animation: ng-wave 1.2s linear infinite;
          opacity: 0.5;
        }
        .ng-dhcp {
          stroke: var(--color-warn); stroke-dasharray: 6 14;
          animation-duration: 1.6s; opacity: 0.4;
        }
        @keyframes ng-wave { to { stroke-dashoffset: -40; } }

        .ng-pulse {
          fill: var(--color-accent);
          animation: ng-pulse-node 2.4s ease-in-out infinite;
        }
        @keyframes ng-pulse-node {
          0%, 100% { opacity: 0.15; r: 4; }
          50% { opacity: 0.5; r: 7; }
        }

        .ng-packet {
          fill: var(--color-accent);
          animation: ng-fly 2.8s linear infinite;
          opacity: 0.7;
        }
        .ng-packet-dhcp {
          fill: var(--color-warn);
          animation: ng-fly 3.6s linear infinite;
          opacity: 0.6;
        }
        @keyframes ng-fly {
          0%   { opacity: 0; }
          5%   { opacity: 0.8; }
          45%  { opacity: 0.8; }
          50%  { opacity: 0; }
          100% { opacity: 0; }
        }

        .ng-ring {
          fill: none;
          stroke: var(--color-accent-dim);
          stroke-width: 1;
          opacity: 0.3;
          animation: ng-ring-expand 4s ease-out infinite;
        }
        @keyframes ng-ring-expand {
          0%   { opacity: 0.3; }
          100% { opacity: 0; }
        }

        .ng-wifi-arc {
          animation: ng-blink 2s ease-in-out infinite;
        }
        .ng-wifi-arc:nth-child(2) { animation-delay: 0.3s; }
        .ng-wifi-arc:nth-child(3) { animation-delay: 0.6s; }
        @keyframes ng-blink {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.45; }
        }

        .ng-label { fill: var(--color-fg); font-size: 13px; font-weight: 600; text-anchor: middle; dominant-baseline: central; }
        .ng-sub { fill: var(--color-muted); font-size: 10px; text-anchor: middle; dominant-baseline: central; }
        .ng-badge { fill: var(--color-accent); font-size: 9px; text-anchor: middle; dominant-baseline: central; letter-spacing: 0.3px; }
      `}</style>
    </svg>
  )
}
