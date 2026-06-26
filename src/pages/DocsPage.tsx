import { motion } from 'framer-motion'

const SECTIONS = [
  {
    title: '1. What is a Network?',
    body: 'A network is a group of devices connected together so they can communicate and share resources such as files, printers, and Internet access. Networks are used everywhere—from homes to offices and data centers.',
    points: [
      'Allows devices to communicate with each other.',
      'Enables resource sharing such as printers and Internet.',
      'Can be wired (Ethernet) or wireless (Wi-Fi).',
    ],
  },
  {
    title: '2. Types of Networks',
    body: 'Networks are classified based on the area they cover and the technology they use.',
    points: [
      '<strong>LAN</strong> — A local network inside a home or office.',
      '<strong>WAN</strong> — Connects multiple LANs over large distances.',
      '<strong>Internet</strong> — The largest network in the world.',
      '<strong>Ethernet</strong> — Wired connection.',
      '<strong>Wi-Fi</strong> — Wireless connection.',
    ],
  },
  {
    title: '3. Network Devices',
    body: 'Every device in a network has a specific role. Understanding these devices makes troubleshooting much easier.',
    points: [
      '<strong>Router</strong> — Connects your local network to other networks such as the Internet.',
      '<strong>Switch</strong> — Connects multiple devices within the same local network.',
      '<strong>Access Point</strong> — Provides wireless (Wi-Fi) access to the network.',
      '<strong>Modem</strong> — Connects your home or office to your Internet Service Provider.',
      '<strong>Firewall</strong> — Monitors and filters network traffic for security.',
    ],
  },
  {
    title: '4. Typical Home / Office Network',
    body: 'A simple office network consists of an Internet connection, a router, a switch, and multiple devices.',
    diagram: `
Internet
   │
 Modem
   │
 Router
   │
 Switch
 ├───────────┬──────────┐
Laptop    Printer     Desktop
`,
  },
  {
    title: '4. IP Address',
    body:'An IP address uniquely identifies a device on a network so other devices know where to send data. Without an IP address, devices cannot communicate.',
    points: [
      '<strong>Private IP</strong> — Used within a local network (e.g. 192.168.x.x).',
      '<strong>Public IP</strong> — Used on the Internet, assigned by your ISP.',
      '<strong>Static IP</strong> — Manually assigned, never changes.',
      '<strong>Dynamic IP (DHCP)</strong> — Automatically assigned, may change over time.',
    ],
    example: {
      label: 'Example:',
      rows: [
        ['Laptop', '192.168.1.10'],
        ['Printer', '192.168.1.20'],
        ['Router', '192.168.1.1'],
      ],
    },
  },
  {
    title: '5. Subnet Mask',
    body: 'The subnet mask tells devices which IP addresses belong to the same local network.',
    example: {
      label: 'Example:',
      rows: [
        ['IP Address', '192.168.1.10'],
        ['Subnet Mask', '255.255.255.0'],
      ],
    },
    points: [
      'Determines which devices belong to the same local network.',
      'Devices on the same subnet can communicate directly.',
      'Devices on different subnets communicate through the router.',
    ]
  },
  {
    title: '6. Default Gateway',
    body: 'The default gateway is usually the router. Devices send traffic to the gateway whenever the destination is outside the local network.',
  },
  {
    title: '7. DNS',
    body: 'DNS converts website names into IP addresses.',
    points: [
      'Example: google.com → IP Address',
      'Without DNS, users would have to remember IP addresses instead of website names.',
    ],
  },
  {
    title: '8. DHCP',
    body: 'DHCP automatically assigns IP addresses and other network settings to devices.',
    points: [
      'No manual configuration for every device.',
      'Reduces configuration mistakes.',
    ],
  },
  {
    title: '9. MAC Address',
    body: 'A MAC address is the hardware address of a network interface.',
    points: [
      '<strong>MAC</strong> = Physical identity of the device (burned into the hardware).',
      '<strong>IP</strong> = Address used for communication (can change).',
    ],
  },
  {
    title: '10. Basic Network Configuration',
    body: 'Show where to configure:',
    points: [
      'IP Address',
      'Subnet Mask',
      'Default Gateway',
      'DNS Server',
    ],
    note: 'Use DHCP (Automatic) for most devices. Use Static IP for servers, printers, and devices that need a fixed address.',
  },
  {
    title: '11. Basic Connectivity Testing',
    body: '',
    points: [
      '<strong>Windows:</strong> <code>ipconfig</code>, <code>ping</code>, <code>tracert</code>, <code>nslookup</code>',
      '<strong>Linux:</strong> <code>ip addr</code>, <code>ping</code>, <code>traceroute</code>, <code>nslookup</code>',
    ],
  },
  {
    title: '12. Common Network Problems',
    body: '',
    issues: [
      { problem: 'Incorrect IP Address', symptom: 'Cannot reach the network', fix: 'Set correct IP or switch to DHCP' },
      { problem: 'Duplicate IP Address', symptom: 'Intermittent connectivity, "IP conflict" error', fix: 'Use DHCP or assign unique static IP' },
      { problem: 'Incorrect Subnet Mask', symptom: 'Can reach some devices but not others', fix: 'Set mask matching the router (e.g. 255.255.255.0)' },
      { problem: 'Incorrect Gateway', symptom: 'Cannot reach the Internet', fix: 'Set gateway to the router IP' },
      { problem: 'Incorrect DNS', symptom: 'Can ping IPs but cannot browse', fix: 'Use router IP or 8.8.8.8' },
      { problem: 'Loose Cable', symptom: 'No link light, "Network cable unplugged"', fix: 'Re-seat the cable' },
      { problem: 'Wi-Fi Not Connected', symptom: 'No Internet, no IP address', fix: 'Connect to the correct SSID and enter password' },
    ],
  },
  {
    title: '13. Practical Demonstration',
    body: '',
    steps: [
      'Connect devices through a switch.',
      'Configure a printer with a static IP.',
      'Configure a laptop using DHCP.',
      'Verify communication using ping.',
      'Access the printer\'s web interface.',
      'Change the IP address and reconnect.',
      'Intentionally misconfigure a setting and troubleshoot it.',
    ],
  },
]

export default function DocsPage() {
  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1>Session Guide</h1>
          <p>Networking Basics — practical reference for the training session</p>
        </div>
      </div>

      <p className="text-muted text-sm leading-relaxed max-w-prose">
        This session is designed to give participants a practical understanding
        of computer networking. By the end, they should be able to understand
        common networking terms, configure basic network settings, and
        troubleshoot simple connectivity issues. This is not a deep networking
        course.
      </p>

      <div className="space-y-5">
        {SECTIONS.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="glass rounded-xl p-5"
          >
            <h3 className="text-base font-semibold mb-2 mt-0">{s.title}</h3>
            {s.body && <p className="text-sm text-fg/90 mb-2">{s.body}</p>}

            {s.points && s.points.length > 0 && (
              <ul className="space-y-1 text-sm text-fg/80 list-disc list-inside marker:text-accent">
                {s.points.map((pt, j) => (
                  <li key={j} dangerouslySetInnerHTML={{ __html: pt }} />
                ))}
              </ul>
            )}

            {'example' in s && s.example && (
              <div className="mt-3 bg-panel-2/60 rounded-xl p-4 border border-line/40">
                <p className="text-xs text-muted mb-2">{s.example.label}</p>
                <div className="space-y-1">
                  {s.example.rows.map(([l, v]) => (
                    <div key={l} className="flex justify-between text-sm font-mono">
                      <span className="text-muted">{l}</span>
                      <code className="text-fg">{v}</code>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {'note' in s && s.note && (
              <div className="mt-3 bg-accent-dim/40 border border-accent/20 rounded-xl p-3 text-xs text-accent">
                {s.note}
              </div>
            )}

            {'issues' in s && s.issues && (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="text-muted border-b border-line/60">
                      <th className="text-left py-2 pr-4 font-medium">Problem</th>
                      <th className="text-left py-2 pr-4 font-medium">Symptom</th>
                      <th className="text-left py-2 font-medium">Solution</th>
                    </tr>
                  </thead>
                  <tbody>
                    {s.issues.map((iss) => (
                      <tr key={iss.problem} className="border-b border-line/30 hover:bg-panel-2/40">
                        <td className="py-2 pr-4 text-warn font-medium">{iss.problem}</td>
                        <td className="py-2 pr-4 text-fg/80">{iss.symptom}</td>
                        <td className="py-2 text-accent">{iss.fix}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {'diagram' in s && s.diagram && (
              <pre className="mt-3 bg-panel-2/60 rounded-xl p-4 border border-line/40 text-xs font-mono whitespace-pre-wrap">
                {s.diagram}
              </pre>
            )}

            {'steps' in s && s.steps && (
              <ol className="mt-3 space-y-1.5 text-sm text-fg/80 list-decimal list-inside marker:text-accent">
                {s.steps.map((step, j) => (
                  <li key={j}>{step}</li>
                ))}
              </ol>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
