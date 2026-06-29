import { motion } from 'framer-motion'
import img from '../assets/network-diagram.png'

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
      'LAN (Local Area Network) – Covers a small area like a home or office.',
      'WAN (Wide Area Network) – Covers a large geographic area and connects multiple LANs.',
      'MAN (Metropolitan Area Network) – Covers a city or metropolitan area.',
      'PAN (Personal Area Network) – Covers a very short range around a person (e.g., Bluetooth).',
    ],
  },
  {
    title: '3. Network Devices',
    body: 'Each network device performs a specific function. Understanding these devices helps you build, configure, and troubleshoot networks.',
    points: [
      '<strong>Modem</strong> — Connects your router or network to your Internet Service Provider (ISP) by converting the ISP\'s signal.',
      '<strong>Firewall</strong> — Protects the network by monitoring and controlling incoming and outgoing network traffic.',
      '<strong>Router</strong> — Connects different networks together, such as your local network (LAN) and the Internet.',
      '<strong>Switch</strong> — Connects devices within the same local network (LAN) and forwards data to the correct device.',
      '<strong>Access Point (AP)</strong> — Allows wireless (Wi-Fi) devices to connect to a wired network.',
    ],
    images:[img]
  },
  {
    title: '4. IP Address',
    body: 'An IP (Internet Protocol) address is a unique number assigned to a device on a network. It allows devices to identify and communicate with each other. Every device on the same network must have a unique IP address.',
    points: [
      '<strong>Private IP</strong> — Used within a local network (LAN). Example: 192.168.x.x, 10.x.x.x, or 172.16.x.x–172.31.x.x.',
      '<strong>Public IP</strong> — Assigned by your Internet Service Provider (ISP) and used to communicate over the Internet.',
      '<strong>Static IP</strong> — Manually configured or reserved, so it remains the same unless changed.',
      '<strong>Dynamic IP (DHCP)</strong> — Automatically assigned by a DHCP server, which is usually built into the router. The assigned IP address may change over time.',
    ],
    example: {
      label: 'Example LAN:',
      rows: [
        ['Router (Gateway)', '192.168.1.1'],
        ['Laptop', '192.168.1.10'],
        ['Printer', '192.168.1.20'],
        ['Phone', '192.168.1.30'],
      ],
    },
  },
  {
    title: '5. Subnet Mask',
    body: 'A subnet mask defines which part of an IP address identifies the network and which part identifies the device (host). It allows devices to determine whether another device is on the same local network or if the data must be sent to a router.',
    example: {
      label: 'Example:',
      rows: [
        ['Network', '192.168.1.0'],
        ['Subnet Mask', '255.255.255.0'],
        ['CIDR Notation', '/24'],
      ],
    },
    points: [
      'Devices with the same network address belong to the same local network (subnet).',
      'Devices on the same subnet can communicate directly without a router.',
      'If the destination is on a different subnet, the data is sent to the default gateway (router).',
      'The most common subnet mask for home and small office networks is 255.255.255.0 (/24).',
    ],
  },
  {
    title: '6. Default Gateway',
    body: 'The default gateway is usually the router. Devices send traffic to the gateway whenever the destination is outside the local network.',
    points: [
      'The default gateway is the IP address of the router on the local network.',
      'It allows devices to communicate with devices on other networks, including the Internet.',
      'If a device does not have a default gateway configured, it cannot access external networks.',
    ],
    example: {
      label: 'Example:',
      rows: [
        ['Router (Gateway)', '192.168.1.1'],
        ['Laptop', '192.168.1.10'],
        ['Printer', '192.168.1.20'],
        ['Phone', '192.168.1.30'],
      ],
    },
  },
  {
    title: '7. DNS (Domain Name System)',
    body: 'DNS translates human-readable domain names into IP addresses, allowing devices to locate websites and other network services.',
    points: [
      '<strong>Purpose</strong> — Converts names like <code>google.com</code> into an IP address.',
      '<strong>Why it is needed</strong> — Without DNS, you would need to remember IP addresses instead of easy-to-read names.',
      '<strong>Common DNS Servers</strong> — 8.8.8.8 and 8.8.4.4 (Google), 1.1.1.1 and 1.0.0.1 (Cloudflare), 9.9.9.9 (Quad9).',
      '<strong>Home Networks</strong> — The router usually provides a DNS server automatically through DHCP.',
    ],
    example: {
      label: 'Example DNS Servers:',
      rows: [
        ['Router DNS (Home Network)', '192.168.1.1'],
        ['Google Public DNS', '8.8.8.8'],
        ['Cloudflare Public DNS', '1.1.1.1'],
        ['Quad9 Public DNS', '9.9.9.9'],
      ],
    },
  },
  {
    title: '8. DHCP (Dynamic Host Configuration Protocol)',
    body: 'DHCP automatically assigns network settings to devices when they join a network. This eliminates the need to manually configure each device.',
    points: [
      '<strong>Automatically Assigns</strong> — IP Address, Subnet Mask, Default Gateway, and DNS Server.',
      '<strong>DHCP Server</strong> — Usually built into the router in home and small office networks.',
      '<strong>Advantages</strong> — Reduces manual configuration and prevents IP address conflicts.',
      '<strong>Dynamic IP</strong> — The assigned IP address may change over time unless it is reserved.',
    ],
    example: {
      label: 'Example DHCP Assignment:',
      rows: [
        ['IP Address', '192.168.1.25'],
        ['Subnet Mask', '255.255.255.0'],
        ['Default Gateway', '192.168.1.1'],
        ['DNS Server', '192.168.1.1'],
      ],
    },
  },
  {
    title: '9. MAC Address (Media Access Control Address)',
    body: 'A MAC address is a unique hardware identifier assigned to a network interface (such as an Ethernet or Wi-Fi adapter). It is used to identify devices on a local network.',
    points: [
      '<strong>MAC Address</strong> — Identifies a network interface on the local network and is typically assigned by the manufacturer.',
      '<strong>IP Address</strong> — Identifies the device on a network and can change depending on the network configuration.',
      '<strong>Format</strong> — A MAC address consists of 12 hexadecimal digits, for example: 00:1A:2B:3C:4D:5E.',
      '<strong>Usage</strong> — Routers and switches use MAC addresses to deliver data within the same local network (LAN).',
    ],
    example: {
      label: 'Example:',
      rows: [
        ['MAC Address', '00:1A:2B:3C:4D:5E'],
        ['IP Address', '192.168.1.20'],
      ],
    },
  },
  {
    title: '10. DHCP Lease Time',
    body: 'A DHCP lease time is the period for which a device is allowed to use an IP address assigned by the DHCP server. Before the lease expires, the device automatically requests to renew it.',
    points: [
      '<strong>Purpose</strong> — Prevents IP addresses from remaining assigned to devices that have left the network.',
      '<strong>Automatic Renewal</strong> — Devices usually renew their lease automatically before it expires, so users rarely notice.',
      '<strong>IP Address Changes</strong> — If the lease cannot be renewed, the device may receive a different IP address.',
      '<strong>Common Value</strong> — Home routers typically use a lease time of 1440 minutes (24 hours).',
      '<strong>IP Address Reassignment</strong> — If the device does not renew its DHCP lease before it expires, the DHCP server is free to assign that IP address to another device.',
    ],
    example: {
      label: 'Example DHCP Lease:',
      rows: [
        ['Assigned IP', '192.168.1.25'],
        ['Lease Time', '1440 minutes (24 hours)'],
        ['Renewal', 'Automatic before expiration'],
      ],
    },
  },
  {
    title: '11. Common Network Problems',
    body: 'The following are common network issues, their symptoms, and recommended solutions. Understanding these problems makes troubleshooting much easier.',
    issues: [
      {
        problem: 'No IP Address',
        symptom: 'Device shows "Unidentified Network" or has no network connectivity.',
        fix: 'Enable DHCP or configure a valid static IP address.'
      },
      {
        problem: 'Incorrect IP Address',
        symptom: 'Cannot communicate with other devices on the network.',
        fix: 'Assign an IP address within the correct subnet or enable DHCP.'
      },
      {
        problem: 'Duplicate IP Address',
        symptom: 'Intermittent connectivity or an "IP address conflict" warning.',
        fix: 'Assign a unique IP address or use DHCP.'
      },
      {
        problem: 'Incorrect Subnet Mask',
        symptom: 'Some local devices are unreachable.',
        fix: 'Use the same subnet mask as the rest of the network (e.g. 255.255.255.0).'
      },
      {
        problem: 'Incorrect Default Gateway',
        symptom: 'Local devices work, but the Internet or other networks are unreachable.',
        fix: 'Set the gateway to the router\'s IP address.'
      },
      {
        problem: 'Incorrect DNS Server',
        symptom: 'Websites cannot be opened, but IP addresses can still be reached.',
        fix: 'Use a valid DNS server such as your router, 8.8.8.8, or 1.1.1.1.'
      },
      {
        problem: 'DHCP Disabled or Unavailable',
        symptom: 'Device does not receive an IP address automatically.',
        fix: 'Enable DHCP on the router or configure a static IP.'
      },
      {
        problem: 'Network Cable Disconnected',
        symptom: 'No link light or "Network cable unplugged" message.',
        fix: 'Reconnect or replace the Ethernet cable.'
      },
      {
        problem: 'Faulty Ethernet Cable',
        symptom: 'Slow, unstable, or no network connection.',
        fix: 'Replace the cable with a known working one.'
      },
      {
        problem: 'Wi-Fi Not Connected',
        symptom: 'No network or Internet access.',
        fix: 'Connect to the correct Wi-Fi network (SSID) and enter the correct password.'
      },
      {
        problem: 'Weak Wi-Fi Signal',
        symptom: 'Slow speed, high latency, or frequent disconnections.',
        fix: 'Move closer to the access point or reduce interference.'
      },
      {
        problem: 'Wrong Wi-Fi Password',
        symptom: 'Unable to join the wireless network.',
        fix: 'Verify and re-enter the correct password.'
      },
      {
        problem: 'Printer on a Different Subnet',
        symptom: 'Printer cannot be discovered or reached.',
        fix: 'Ensure the computer and printer are on the same subnet, or configure routing between subnets.'
      },
      {
        problem: 'Firewall Blocking Traffic',
        symptom: 'Device is reachable by ping but the application cannot connect.',
        fix: 'Allow the required application or network ports through the firewall.'
      },
      {
        problem: 'Incorrect Printer IP Address',
        symptom: 'Printing fails or the printer cannot be found.',
        fix: 'Verify the printer\'s IP address and update the application or driver settings.'
      },
      {
        problem: 'Network Interface Disabled',
        symptom: 'Ethernet or Wi-Fi appears disconnected.',
        fix: 'Enable the network adapter in the operating system.'
      },
      {
        problem: 'Speed or Duplex Mismatch',
        symptom: 'Slow or unstable wired network connection.',
        fix: 'Use Auto Negotiation or configure matching speed and duplex settings.'
      },
      {
        problem: 'Router or Switch Failure',
        symptom: 'Multiple devices lose network connectivity.',
        fix: 'Restart the device and check cables, power, and status LEDs.'
      },
      {
        problem: 'MAC Address Filtering',
        symptom: 'A device cannot join the network even with correct settings.',
        fix: 'Add the device\'s MAC address to the allowed list or disable MAC filtering.'
      },
      {
        problem: 'IP Address Changed (DHCP)',
        symptom: 'Applications can no longer find the printer.',
        fix: 'Assign a static IP address or create a DHCP reservation for the printer.'
      },
    ],
  },
  {
    title: 'What is the difference between a Network Range and a DHCP Range?',
    body: 'Understanding the difference between a Network Range and a DHCP Range is crucial for proper network configuration and management.',
    table: {
      headers: ['Feature', 'Network Range', 'DHCP Range'],
      rows: [
        [
          'Definition',
          'All valid IP addresses within a network.',
          'The subset of IP addresses that the DHCP server can assign automatically.',
        ],
        [
          'Determined By',
          'IP Address and Subnet Mask',
          'DHCP Server Configuration',
        ],
        [
          'Purpose',
          'Defines which devices belong to the same network.',
          'Provides automatic IP assignment to devices.',
        ],
        [
          'Contains',
          'Both Static and Dynamic IP addresses',
          'Only Dynamic IP addresses',
        ],
        [
          'Can be configured manually?',
          'No (depends on network/subnet)',
          'Yes (configured on the router or DHCP server)',
        ],
        [
          'Example',
          '192.168.1.1 - 192.168.1.254',
          '192.168.1.100 - 192.168.1.200',
        ],
        [
          'Used for Static IPs',
          'Yes',
          'No (typically excluded from the DHCP pool)',
        ],
      ],
    },
    note: 'The DHCP Range is always a subset of the Network Range. Static IP devices such as routers, printers, and servers should use addresses outside the DHCP Range but still within the Network Range.',
  }
]

export default function DocsPage() {
  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1>Docs</h1>
          <p>Networking Basics</p>
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

            {'table' in s && s.table && (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="text-muted border-b border-line/60">
                      {s.table.headers.map((h) => (
                        <th key={h} className="text-left py-2 pr-4 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {s.table.rows.map((row, j) => (
                      <tr key={j} className="border-b border-line/30 hover:bg-panel-2/40">
                        {row.map((cell, k) => (
                          <td key={k} className="py-2 pr-4 text-fg/80">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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


            {'images' in s && s.images && (
              <div className="mt-3 flex flex-wrap gap-3">
                {s.images.map((img, j) => (
                  <img key={j} src={img} alt="" className="rounded-xl border border-line/40 max-w-full" />
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
