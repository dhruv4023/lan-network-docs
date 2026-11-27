export default function NetworkDiagram() {
  return (
    <svg viewBox="0 0 840 545" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto max-w-3xl mx-auto">
      <defs>
        <filter id="ng-shadow">
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#000" floodOpacity="0.4"/>
        </filter>
      </defs>

      <pattern id="ng-grid" width="30" height="30" patternUnits="userSpaceOnUse">
        <path d="M 30 0 L 0 0 0 30" fill="none" stroke="var(--color-line)" strokeOpacity="0.12" strokeWidth="0.5"/>
      </pattern>
      <rect width="840" height="545" fill="url(#ng-grid)"/>

      {/* ===== LINKS ===== */}

      {/* Internet ── ISP Modem */}
      <line className="ng-link" x1="420" y1="46" x2="420" y2="82"/>
      <line className="ng-wave" x1="420" y1="46" x2="420" y2="82"/>

      {/* ISP Modem ── Router */}
      <line className="ng-link" x1="420" y1="128" x2="420" y2="188"/>
      <line className="ng-wave" x1="420" y1="128" x2="420" y2="188"/>

      {/* Router ── Switch */}
      <line className="ng-link" x1="420" y1="248" x2="420" y2="306"/>
      <line className="ng-wave" x1="420" y1="248" x2="420" y2="306"/>

      {/* Switch ── PC (Ethernet) */}
      <path className="ng-link" d="M 390 342 L 390 404 L 195 404 L 195 445"/>
      <path className="ng-wave" d="M 390 342 L 390 404 L 195 404 L 195 445" style={{ animationDelay: '0.2s' }} />
      <path className="ng-wave ng-dhcp" d="M 195 445 L 195 404 L 390 404 L 390 342" style={{ animationDelay: '0.8s' }} />

      {/* Switch ── Printer (Ethernet) */}
      <path className="ng-link" d="M 450 342 L 450 404 L 550 404 L 550 445"/>
      <path className="ng-wave" d="M 450 342 L 450 404 L 550 404 L 550 445" style={{ animationDelay: '0.6s' }} />
      <path className="ng-wave ng-dhcp" d="M 550 445 L 550 404 L 450 404 L 450 342" style={{ animationDelay: '1.2s' }} />

      {/* Router ── AP (Ethernet) */}
      <line className="ng-link" x1="500" y1="218" x2="565" y2="218"/>
      <line className="ng-wave" x1="500" y1="218" x2="565" y2="218" style={{ animationDelay: '0.3s' }} />
      <line className="ng-wave ng-dhcp" x1="565" y1="218" x2="500" y2="218" style={{ animationDelay: '1s' }} />

      {/* AP ── Phone (Wi-Fi) */}
      <line className="ng-link" x1="642" y1="241" x2="642" y2="330" strokeDasharray="6 4"/>
      <line className="ng-wave" x1="642" y1="241" x2="642" y2="330" style={{ animationDelay: '0.5s' }} strokeDasharray="6 10"/>
      <line className="ng-wave ng-dhcp" x1="642" y1="330" x2="642" y2="241" style={{ animationDelay: '1.5s' }} strokeDasharray="4 12"/>

      {/* ===== PULSE DOTS ===== */}
      <circle className="ng-pulse" cx="420" cy="64" r="4"/>
      <circle className="ng-pulse" cx="420" cy="158" r="4"/>
      <circle className="ng-pulse" cx="420" cy="277" r="4"/>
      <circle className="ng-pulse" cx="292" cy="404" r="4"/>
      <circle className="ng-pulse" cx="500" cy="404" r="4"/>
      <circle className="ng-pulse" cx="532" cy="218" r="4"/>
      <circle className="ng-pulse" cx="642" cy="285" r="4"/>

      {/* ===== DATA PACKETS ===== */}
      <rect className="ng-packet" x="416" y="61" width="8" height="6" rx="2"/>
      <rect className="ng-packet" x="416" y="155" width="8" height="6" rx="2" style={{ animationDelay: '0.8s' }}/>
      <rect className="ng-packet" x="416" y="274" width="8" height="6" rx="2" style={{ animationDelay: '0.4s' }}/>
      <rect className="ng-packet" x="288" y="401" width="8" height="6" rx="2" style={{ animationDelay: '0.3s' }}/>
      <rect className="ng-packet-dhcp" x="302" y="401" width="8" height="6" rx="2" style={{ animationDelay: '0.9s' }}/>
      <rect className="ng-packet" x="496" y="401" width="8" height="6" rx="2" style={{ animationDelay: '0.7s' }}/>
      <rect className="ng-packet-dhcp" x="482" y="401" width="8" height="6" rx="2" style={{ animationDelay: '1.3s' }}/>
      <rect className="ng-packet" x="525" y="215" width="8" height="6" rx="2" style={{ animationDelay: '0.4s' }}/>
      <rect className="ng-packet-dhcp" x="537" y="215" width="8" height="6" rx="2" style={{ animationDelay: '1.1s' }}/>
      <rect className="ng-packet-dhcp" x="638" y="282" width="8" height="6" rx="2" style={{ animationDelay: '1.6s' }}/>

      {/* ===== SUBNET RINGS ===== */}
      <circle className="ng-ring" cx="420" cy="218" r="55"/>
      <circle className="ng-ring" cx="420" cy="218" r="55" style={{ animationDelay: '1.3s' }}/>
      <circle className="ng-ring" cx="420" cy="218" r="55" style={{ animationDelay: '2.6s' }}/>

      {/* ===== NODES ===== */}

      {/* Internet */}
      <g filter="url(#ng-shadow)">
        <rect x="365" y="10" width="110" height="36" rx="8" fill="var(--color-panel)" stroke="var(--color-line)"/>
        <text className="ng-label" x="420" y="28">☁ Internet</text>
      </g>

      {/* ISP Modem */}
      <g filter="url(#ng-shadow)">
        <rect x="360" y="82" width="120" height="46" rx="8" fill="var(--color-panel)" stroke="var(--color-line)"/>
        <text className="ng-label" x="420" y="99">ISP Modem</text>
        <text className="ng-sub" x="420" y="116">Public IP</text>
      </g>

      {/* Router (Gateway) */}
      <g filter="url(#ng-shadow)">
        <rect x="340" y="188" width="160" height="60" rx="8" fill="var(--color-panel)" stroke="var(--color-accent)"/>
        <text className="ng-label" x="420" y="205">Router (Gateway)</text>
        <text className="ng-sub" x="420" y="221">192.168.1.1</text>
        <text className="ng-badge" x="420" y="236">DHCP + DNS Server</text>
      </g>

      {/* Switch */}
      <g filter="url(#ng-shadow)">
        <rect x="370" y="306" width="100" height="36" rx="8" fill="var(--color-panel)" stroke="var(--color-accent-dim)"/>
        <text className="ng-label" x="420" y="324">🔀 Switch</text>
      </g>

      {/* Cable labels */}
      <text x="292" y="394" fill="var(--color-muted)" fontSize="9" textAnchor="middle" letterSpacing="1">Ethernet</text>
      <text x="500" y="394" fill="var(--color-muted)" fontSize="9" textAnchor="middle" letterSpacing="1">Ethernet</text>

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
        <rect x="565" y="195" width="155" height="46" rx="8" fill="var(--color-panel)" stroke="var(--color-warn)"/>
        <text className="ng-label" x="642" y="213">📡 Access Point</text>
        <text className="ng-sub" x="642" y="229">192.168.1.2</text>
      </g>

      {/* Wi-Fi zone oval behind phone */}
      <ellipse cx="642" cy="353" rx="90" ry="45" fill="var(--color-warn)" opacity="0.04" stroke="var(--color-warn)" strokeOpacity="0.12" strokeWidth="1" strokeDasharray="4 6"/>

      {/* Wi-Fi signal arcs */}
      <path className="ng-wifi-arc" d="M 610 296 A 25 20 0 0 1 674 296" fill="none" stroke="var(--color-warn)" strokeWidth="2" opacity="0.3"/>
      <path className="ng-wifi-arc" d="M 597 284 A 45 35 0 0 1 687 284" fill="none" stroke="var(--color-warn)" strokeWidth="2" opacity="0.25"/>
      <path className="ng-wifi-arc" d="M 582 271 A 65 50 0 0 1 702 271" fill="none" stroke="var(--color-warn)" strokeWidth="2" opacity="0.2"/>

      <text x="716" y="286" fill="var(--color-muted)" fontSize="9" textAnchor="middle" letterSpacing="1">Wi-Fi</text>

      {/* Android Phone */}
      <g filter="url(#ng-shadow)">
        <rect x="562" y="330" width="160" height="46" rx="8" fill="var(--color-panel)" stroke="#7eb85e"/>
        <text className="ng-label" x="642" y="348">📱 Android Phone</text>
        <text className="ng-sub" x="642" y="364">192.168.1.30</text>
      </g>

      {/* LAN label */}
      <text x="420" y="522" fill="var(--color-muted)" fontSize="10" textAnchor="middle" letterSpacing="2">
        ═══ LAN ── 192.168.1.0/24 ═══
      </text>

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
          0%   { opacity: 0.35; r: 55; }
          100% { opacity: 0; r: 95; }
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
