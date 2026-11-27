import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { ComponentType, MouseEvent, ReactNode } from 'react'
import img from '../assets/network-diagram.png'
import dualNetworkLaptopImg from '../assets/dual-network-laptop-connectivity-infographic.png'
import NetworkDiagram from '../components/NetworkDiagram'

// Update this whenever the content changes.
const LAST_UPDATED = '27 Nov 2026'

/** A bullet: plain text, or a bold label followed by text (text may contain JSX such as <code>). */
type Point = string | { label: string; text: ReactNode }

type ExampleRow = [string, string]

type Example = {
	label: string
	rows: ExampleRow[]
}

type CommandStep = {
	title: string
	description: string
	command: string
	badge?: string
}

type Issue = {
	problem: string
	symptom: string
	fix: string
}

type IssueGroup = {
	group: string
	items: Issue[]
}

type TableData = {
	caption: string
	headers: string[]
	rows: string[][]
}

type ImageItem = {
	src: string
	alt: string
}

type Section = {
	id: string
	title: string
	body?: string
	points?: Point[]
	component?: ComponentType
	images?: ImageItem[]
	steps?: string[]
	commands?: CommandStep[]
	examples?: Example[]
	table?: TableData
	issueGroups?: IssueGroup[]
	note?: string
}

const SECTIONS: Section[] = [
	{
		id: 'what-is-a-network',
		title: 'What is a Network?',
		body: 'A network is a group of devices connected together so they can communicate and share resources such as files, printers, and Internet access. Networks are used everywhere—from homes to offices and data centers.',
		points: [
			'Allows devices to communicate with each other.',
			'Enables resource sharing such as printers and Internet.',
			'Can be wired (Ethernet) or wireless (Wi-Fi).',
		],
		component: NetworkDiagram,
	},
	{
		id: 'types-of-networks',
		title: 'Types of Networks',
		body: 'Networks are classified based on the area they cover and the technology they use.',
		points: [
			{ label: 'PAN (Personal Area Network)', text: 'Covers a very short range around a person (e.g., Bluetooth).' },
			{ label: 'LAN (Local Area Network)', text: 'Covers a small area like a home or office.' },
			{ label: 'MAN (Metropolitan Area Network)', text: 'Covers a city or metropolitan area, for example a network linking several offices across a city.' },
			{ label: 'WAN (Wide Area Network)', text: 'Covers a large geographic area and connects multiple LANs.' },
			{ label: 'The Internet', text: 'The global network of networks. It is not a single WAN or MAN; it connects millions of LANs, MANs, and WANs through Internet Service Providers (ISPs).' },
		],
	},
	{
		id: 'network-devices',
		title: 'Network Devices',
		body: 'Each network device performs a specific function. Understanding these devices helps you build, configure, and troubleshoot networks.',
		points: [
			{ label: 'Modem', text: 'Connects your router or network to your Internet Service Provider (ISP) by converting the ISP’s signal.' },
			{ label: 'Firewall', text: 'Protects the network by monitoring and controlling incoming and outgoing network traffic.' },
			{ label: 'Router', text: 'Connects different networks together, such as your local network (LAN) and the Internet.' },
			{ label: 'Switch', text: 'Connects devices within the same local network (LAN) and forwards data to the correct device.' },
			{ label: 'Access Point (AP)', text: 'Allows wireless (Wi-Fi) devices to connect to a wired network.' },
			{ label: 'In practice', text: 'Home and small-office routers often combine a router, switch, firewall, and access point (and sometimes a modem) in one box.' },
		],
		images: [
			{
				src: img,
				alt: 'Network diagram showing how a modem, firewall, router, switch, and access point connect devices to each other and to the Internet.',
			},
		],
	},
	{
		id: 'ip-address',
		title: 'IP Address',
		body: 'An IP (Internet Protocol) address is a unique number assigned to a device on a network. It allows devices to identify and communicate with each other. Every device on the same network must have a unique IP address.',
		points: [
			{ label: 'Private IP', text: 'Used within a local network (LAN). Ranges: 192.168.x.x, 10.x.x.x, or 172.16.x.x–172.31.x.x.' },
			{ label: 'Public IP', text: 'Assigned by your Internet Service Provider (ISP) and used to communicate over the Internet.' },
			{ label: 'Static IP', text: 'Set manually on the device itself. It stays the same unless you change it, but you must make sure it does not clash with the DHCP range.' },
			{ label: 'DHCP Reservation', text: 'Set on the router. The router always gives a specific device (matched by its MAC address) the same IP address. This is the easiest way to keep a printer’s address fixed.' },
			{ label: 'Dynamic IP (DHCP)', text: 'Automatically assigned by a DHCP server, which is usually built into the router. The assigned IP address may change over time.' },
			{ label: 'Self-assigned (169.254.x.x)', text: 'If a device is set to use DHCP but gets no reply, it gives itself an address starting with 169.254. This almost always means DHCP is not working.' },
			{ label: 'IPv6', text: 'Newer, longer addresses (for example fe80::…) that many devices use alongside IPv4. This guide covers IPv4 only.' },
		],
		examples: [
			{
				label: 'Example LAN:',
				rows: [
					['Router (Gateway)', '192.168.1.1'],
					['Printer (reserved)', '192.168.1.20'],
					['Laptop (DHCP)', '192.168.1.101'],
					['Phone (DHCP)', '192.168.1.102'],
				],
			},
		],
	},
	{
		id: 'subnet-mask',
		title: 'Subnet Mask',
		body: 'A subnet mask defines which part of an IP address identifies the network and which part identifies the device (host). It allows devices to determine whether another device is on the same local network or if the data must be sent to a router.',
		examples: [
			{
				label: 'Example:',
				rows: [
					['Network', '192.168.1.0'],
					['Subnet Mask', '255.255.255.0'],
					['CIDR Notation', '/24'],
					['Usable Addresses', '192.168.1.1 – 192.168.1.254'],
					['Broadcast', '192.168.1.255'],
				],
			},
		],
		points: [
			'Devices with the same network address belong to the same local network (subnet).',
			'Devices on the same subnet can communicate directly without a router.',
			'If the destination is on a different subnet, the data is sent to the default gateway (router).',
			'The most common subnet mask for home and small office networks is 255.255.255.0 (/24).',
		],
	},
	{
		id: 'default-gateway',
		title: 'Default Gateway',
		body: 'The default gateway is usually the router. Devices send traffic to the gateway whenever the destination is outside the local network.',
		points: [
			'The default gateway is the IP address of the router on the local network.',
			'It allows devices to communicate with devices on other networks, including the Internet.',
			'If a device does not have a default gateway configured, it cannot access external networks.',
		],
		examples: [
			{
				label: 'Example — a laptop at 192.168.1.101 with mask 255.255.255.0:',
				rows: [
					['To 192.168.1.20 (printer)', 'Same subnet → sent directly'],
					['To 8.8.8.8 (Internet)', 'Other network → sent to 192.168.1.1'],
				],
			},
		],
	},
	{
		id: 'dns',
		title: 'DNS (Domain Name System)',
		body: 'DNS translates human-readable domain names into IP addresses, allowing devices to locate websites and other network services.',
		points: [
			{ label: 'Purpose', text: <>Converts names like <code>google.com</code> into an IP address.</> },
			{ label: 'Why it is needed', text: 'Without DNS, you would need to remember IP addresses instead of easy-to-read names.' },
			{ label: 'Common DNS Servers', text: '8.8.8.8 and 8.8.4.4 (Google), 1.1.1.1 and 1.0.0.1 (Cloudflare), 9.9.9.9 and 149.112.112.112 (Quad9).' },
			{ label: 'Home Networks', text: 'The router usually provides a DNS server automatically through DHCP.' },
			{ label: 'Test it', text: <>Run <code>nslookup google.com</code>. If it returns an address, DNS is working.</> },
		],
		examples: [
			{
				label: 'Example DNS Servers:',
				rows: [
					['Router DNS (Home Network)', '192.168.1.1'],
					['Google Public DNS', '8.8.8.8'],
					['Cloudflare Public DNS', '1.1.1.1'],
					['Quad9 Public DNS', '9.9.9.9'],
				],
			},
		],
	},
	{
		id: 'mac-address',
		title: 'MAC Address (Media Access Control Address)',
		body: 'A MAC address is a unique hardware identifier assigned to a network interface (such as an Ethernet or Wi-Fi adapter). It is used to identify devices on a local network.',
		points: [
			{ label: 'MAC Address', text: 'Identifies a network interface on the local network and is typically assigned by the manufacturer.' },
			{ label: 'IP Address', text: 'Identifies the device on a network and can change depending on the network configuration.' },
			{ label: 'Format', text: 'A MAC address consists of 12 hexadecimal digits, for example: 00:1A:2B:3C:4D:5E.' },
			{ label: 'Usage', text: 'Routers and switches use MAC addresses to deliver data within the same local network (LAN).' },
			{ label: 'ARP', text: <>Devices use ARP to learn which MAC address belongs to an IP address on the LAN. View the list with <code>arp -a</code>.</> },
			{ label: 'Randomized MAC addresses', text: 'Phones and some laptops use a different, random MAC address for each Wi-Fi network. This can break MAC filtering and DHCP reservations. Turn off the private/random address option for that network if you rely on either.' },
		],
		examples: [
			{
				label: 'Example:',
				rows: [
					['MAC Address', '00:1A:2B:3C:4D:5E'],
					['IP Address', '192.168.1.20'],
				],
			},
		],
	},
	{
		id: 'dhcp',
		title: 'DHCP (Dynamic Host Configuration Protocol)',
		body: 'DHCP automatically assigns network settings to devices when they join a network. This eliminates the need to manually configure each device.',
		points: [
			{ label: 'Automatically Assigns', text: 'IP Address, Subnet Mask, Default Gateway, and DNS Server.' },
			{ label: 'DHCP Server', text: 'Usually built into the router in home and small office networks.' },
			{ label: 'How it works', text: 'The device asks for an address, the server offers one, the device accepts it, and the server confirms.' },
			{ label: 'Advantages', text: 'Reduces manual configuration and prevents IP address conflicts.' },
			{ label: 'Dynamic IP', text: 'The assigned IP address may change over time unless it is reserved.' },
			{ label: 'DHCP Reservation', text: 'Tells the server to always give one device (matched by its MAC address) the same IP. Use it for printers and other devices that people need to find.' },
		],
		examples: [
			{
				label: 'Example DHCP Assignment:',
				rows: [
					['IP Address', '192.168.1.125'],
					['Subnet Mask', '255.255.255.0'],
					['Default Gateway', '192.168.1.1'],
					['DNS Server', '192.168.1.1'],
				],
			},
		],
	},
	{
		id: 'dhcp-lease-time',
		title: 'DHCP Lease Time',
		body: 'A DHCP lease time is the period for which a device is allowed to use an IP address assigned by the DHCP server. Before the lease expires, the device automatically requests to renew it.',
		points: [
			{ label: 'Purpose', text: 'Prevents IP addresses from remaining assigned to devices that have left the network.' },
			{ label: 'Automatic Renewal', text: 'Devices usually try to renew when about half of the lease has passed, so users rarely notice.' },
			{ label: 'IP Address Changes', text: 'If the lease cannot be renewed, the device may receive a different IP address.' },
			{ label: 'Common Value', text: 'Home routers typically use a lease time of 1440 minutes (24 hours).' },
			{ label: 'IP Address Reassignment', text: 'If the device does not renew its DHCP lease before it expires, the DHCP server is free to assign that IP address to another device.' },
		],
		examples: [
			{
				label: 'Example DHCP Lease:',
				rows: [
					['Assigned IP', '192.168.1.125'],
					['Lease Time', '1440 minutes (24 hours)'],
					['Renewal', 'Automatic, starting about halfway through'],
				],
			},
		],
	},
	{
		id: 'network-range-vs-dhcp-range',
		title: 'Network Range vs DHCP Range',
		body: 'Understanding the difference between a Network Range and a DHCP Range is crucial for proper network configuration and management.',
		table: {
			caption: 'Comparison of Network Range and DHCP Range',
			headers: ['Feature', 'Network Range', 'DHCP Range'],
			rows: [
				['Definition', 'All addresses that belong to the network, set by the IP address and subnet mask.', 'The subset of addresses the DHCP server is allowed to assign automatically.'],
				['Determined By', 'Router LAN IP address and subnet mask', 'DHCP server configuration (start and end address)'],
				['Purpose', 'Defines which devices belong to the same network.', 'Provides automatic IP assignment to devices.'],
				['Contains', 'Both static and dynamic addresses', 'Only dynamic addresses'],
				['Can it be changed?', 'Indirectly, by changing the router’s LAN IP or subnet mask', 'Yes — set the start and end addresses on the router or DHCP server'],
				['Example (/24)', '192.168.1.1 – 192.168.1.254 (usable addresses)', '192.168.1.100 – 192.168.1.200'],
				['Used for Static IPs', 'Yes', 'No (keep static addresses outside the DHCP range)'],
			],
		},
		note: 'The DHCP Range is always a subset of the Network Range. Static IP devices such as routers, printers, and servers should use addresses outside the DHCP Range but still within the Network Range. With the example above, that means 192.168.1.2 – 192.168.1.99 or 192.168.1.201 – 192.168.1.254.',
	},
	{
		id: 'ports-and-protocols',
		title: 'Ports and Protocols',
		body: 'An IP address finds the device; a port number finds the service on that device. Firewalls, printer settings, and file-sharing tools all refer to ports.',
		table: {
			caption: 'Common ports used in this guide',
			headers: ['Port', 'Protocol', 'Used for'],
			rows: [
				['22', 'SSH (TCP)', 'Secure remote terminal and file copy (SCP/SFTP)'],
				['53', 'DNS (UDP/TCP)', 'Name lookups'],
				['67 / 68', 'DHCP (UDP)', 'Automatic IP assignment (server / client)'],
				['80 / 443', 'HTTP / HTTPS (TCP)', 'Web pages, including most printer and router admin pages'],
				['515', 'LPR/LPD (TCP)', 'Older network printing'],
				['631', 'IPP (TCP)', 'Modern network printing; many printers support driverless printing'],
				['9100', 'Raw / JetDirect (TCP)', 'Sends print data straight to the printer; very widely supported'],
				['8000', 'HTTP (TCP)', 'Used in this guide for the Python file share'],
			],
		},
		note: 'If you can ping a device but cannot print or connect, the port may be blocked or the service turned off. Printer ports can vary by manufacturer, so check the printer’s manual or its configuration page.',
	},
	{
		id: 'finding-your-network-settings',
		title: 'Finding Your Network Settings',
		body: 'Read your current settings before changing anything. These commands work in a terminal (Command Prompt or PowerShell on Windows).',
		table: {
			caption: 'Commands for reading network settings on Windows, macOS, and Linux',
			headers: ['Task', 'Windows', 'macOS', 'Linux'],
			rows: [
				['IP, mask, gateway, DNS', 'ipconfig /all', 'networksetup -getinfo Wi-Fi', 'ip addr, ip route'],
				['MAC address', 'ipconfig /all (Physical Address)', 'ifconfig en0 | grep ether', 'ip link'],
				['Devices seen on the LAN', 'arp -a', 'arp -a', 'ip neigh'],
				['Test reachability', 'ping <ip>', 'ping <ip>', 'ping <ip>'],
				['Look up a name', 'nslookup google.com', 'nslookup google.com', 'nslookup google.com'],
				['Trace the route', 'tracert <ip>', 'traceroute <ip>', 'traceroute <ip>'],
				['Test a port', 'Test-NetConnection <ip> -Port 9100 (PowerShell)', 'nc -vz <ip> 9100', 'nc -vz <ip> 9100'],
			],
		},
		note: 'On macOS and Linux, ping runs until you press Ctrl+C (or use ping -c 4). On macOS, Wi-Fi is often en0 but not always; run networksetup -listallhardwareports to check.',
	},
	{
		id: 'troubleshooting-order',
		title: 'Troubleshooting Order',
		body: 'Work from the bottom up. Each step rules out one layer, so you always know where the problem is.',
		steps: [
			'Check the physical link: cable seated, link light on, or Wi-Fi joined to the correct network.',
			'Check the IP settings: is the address in the right subnet? An address starting with 169.254 means DHCP failed.',
			'Ping the default gateway. If this fails, the problem is between your device and the router (cable, Wi-Fi, switch, or wrong subnet).',
			'Ping the target device (for example the printer) by its IP address. If this fails, check that it is powered on, on the same subnet, and not blocked by client isolation or MAC filtering.',
			'Ping an Internet address such as 8.8.8.8, then a name such as google.com. If only the name fails, the problem is DNS.',
			'Test the specific port (for example 9100 or 631 for a printer). If ping works but the port is closed, check the firewall, the printer’s protocol settings, and that the service is turned on.',
			'Check what changed: a new router or switch, a changed DHCP range, a new VLAN, or a printer that received a new IP address from DHCP.',
		],
	},
	{
		id: 'common-network-problems',
		title: 'Common Network Problems',
		body: 'The following are common network issues, their symptoms, and recommended solutions. Understanding these problems makes troubleshooting much easier.',
		issueGroups: [
			{
				group: 'IP settings and DHCP',
				items: [
					{
						problem: 'No IP Address',
						symptom: 'Device shows “Unidentified Network”, has no connectivity, or has an address starting with 169.254.',
						fix: 'Enable DHCP or configure a valid static IP address. Check that the DHCP server is running.',
					},
					{
						problem: 'Incorrect IP Address',
						symptom: 'Cannot communicate with other devices on the network.',
						fix: 'Assign an IP address within the correct subnet or enable DHCP.',
					},
					{
						problem: 'Duplicate IP Address',
						symptom: 'Intermittent connectivity or an “IP address conflict” warning.',
						fix: 'Assign a unique IP address, keep static addresses outside the DHCP range, or use DHCP.',
					},
					{
						problem: 'Incorrect Subnet Mask',
						symptom: 'Some local devices are unreachable.',
						fix: 'Use the same subnet mask as the rest of the network (e.g. 255.255.255.0).',
					},
					{
						problem: 'Incorrect Default Gateway',
						symptom: 'Local devices work, but the Internet or other networks are unreachable.',
						fix: 'Set the gateway to the router’s IP address.',
					},
					{
						problem: 'Incorrect DNS Server',
						symptom: 'Websites cannot be opened, but IP addresses can still be reached.',
						fix: 'Use a valid DNS server such as your router, 8.8.8.8, or 1.1.1.1.',
					},
					{
						problem: 'DHCP Disabled or Unavailable',
						symptom: 'Device does not receive an IP address automatically.',
						fix: 'Enable DHCP on the router or configure a static IP.',
					},
					{
						problem: 'IP Address Changed (DHCP)',
						symptom: 'Applications can no longer find the printer.',
						fix: 'Assign a static IP address or create a DHCP reservation for the printer.',
					},
				],
			},
			{
				group: 'Wi-Fi and cabling',
				items: [
					{
						problem: 'Network Cable Disconnected',
						symptom: 'No link light or “Network cable unplugged” message.',
						fix: 'Reconnect or replace the Ethernet cable.',
					},
					{
						problem: 'Faulty Ethernet Cable',
						symptom: 'Slow, unstable, or no network connection.',
						fix: 'Replace the cable with a known working one.',
					},
					{
						problem: 'Wi-Fi Not Connected',
						symptom: 'No network or Internet access.',
						fix: 'Connect to the correct Wi-Fi network (SSID) and enter the correct password.',
					},
					{
						problem: 'Weak Wi-Fi Signal',
						symptom: 'Slow speed, high latency, or frequent disconnections.',
						fix: 'Move closer to the access point or reduce interference.',
					},
					{
						problem: 'Wrong Wi-Fi Password',
						symptom: 'Unable to join the wireless network.',
						fix: 'Verify and re-enter the correct password.',
					},
					{
						problem: 'Network Interface Disabled',
						symptom: 'Ethernet or Wi-Fi appears disconnected.',
						fix: 'Enable the network adapter in the operating system.',
					},
					{
						problem: 'Speed or Duplex Mismatch',
						symptom: 'Slow or unstable wired network connection.',
						fix: 'Use Auto Negotiation or configure matching speed and duplex settings.',
					},
					{
						problem: 'Router or Switch Failure',
						symptom: 'Multiple devices lose network connectivity.',
						fix: 'Restart the device and check cables, power, and status LEDs.',
					},
				],
			},
			{
				group: 'Access control and visibility',
				items: [
					{
						problem: 'Firewall Blocking Traffic',
						symptom: 'Device is reachable by ping but the application cannot connect.',
						fix: 'Allow the required application or network ports through the firewall.',
					},
					{
						problem: 'MAC Address Filtering',
						symptom: 'A device cannot join the network even with correct settings.',
						fix: 'Add the device’s MAC address to the allowed list or disable MAC filtering. If the device uses a random (private) MAC, turn that off for this network.',
					},
					{
						problem: 'Client (AP) Isolation',
						symptom: 'Devices on the same Wi-Fi cannot see or ping each other, but both reach the Internet.',
						fix: 'Turn off client isolation on the router or access point, or move both devices to a network without isolation. Guest networks usually isolate clients.',
					},
				],
			},
			{
				group: 'Printers and multiple networks',
				items: [
					{
						problem: 'Incorrect Printer IP Address',
						symptom: 'Printing fails or the printer cannot be found.',
						fix: 'Verify the printer’s IP address and update the application or driver settings.',
					},
					{
						problem: 'Printer on a Different Subnet',
						symptom: 'Printer cannot be discovered or reached.',
						fix: 'Ensure the computer and printer are on the same subnet, or configure routing between subnets.',
					},
					{
						problem: 'Printer Port or Protocol Mismatch',
						symptom: 'Printer answers ping, but jobs stay in the queue or fail.',
						fix: 'Make the printer port on the computer (Raw 9100, IPP 631, or LPR 515) match what is enabled on the printer.',
					},
					{
						problem: 'Two Default Gateways',
						symptom: 'Internet stops working after plugging in a second network cable.',
						fix: 'Remove the default gateway from the adapter that has no Internet access, then check which adapter the computer prefers (see the dual-network section).',
					},
				],
			},
		],
	},
	{
		id: 'setting-up-a-lan-printer',
		title: 'Setting Up a LAN Printer',
		body: 'Follow these steps for a network printer that is on the same LAN as the computers that print to it.',
		steps: [
			'Print the printer’s configuration or network status page (or open its menu) to find its MAC address and current IP address.',
			'Give the printer a fixed address: create a DHCP reservation on the router using the printer’s MAC address, or set a static IP on the printer that is inside the network range but outside the DHCP range.',
			'Ping the printer’s IP address from a computer to confirm it is reachable.',
			'Choose a protocol: IPP (port 631) where supported, otherwise Raw/JetDirect (port 9100). Use LPR (port 515) only if the printer requires it.',
			'Add the printer. Windows: Settings > Bluetooth & devices > Printers & scanners > Add device > “The printer that I want isn’t listed” > “Add a printer using an IP address or hostname”. macOS: System Settings > Printers & Scanners > Add Printer > IP tab.',
			'Install the correct driver if the system does not choose one automatically.',
			'Print a test page, then record the printer’s IP address, MAC address, and protocol for future reference.',
		],
		note: 'If the printer’s IP address changes, the printer port on every computer must be updated. A DHCP reservation or static IP prevents this.',
	},
	{
		id: 'dual-network-laptop',
		title: 'Wi-Fi + Ethernet Dual-Network Laptop Setup',
		body: 'A laptop can stay on office Wi-Fi for Internet access while a second, wired network connects it to local machines such as a printer and a weighing scale.',
		points: [
			{ label: 'Wi-Fi LAN', text: <>The laptop connects to the router on <code>192.168.1.0/24</code>. This network provides Internet access and connects other Wi-Fi devices.</> },
			{ label: 'Ethernet LAN', text: <>The laptop also connects to an Ethernet switch on <code>192.168.10.0/24</code>. This separate LAN contains only the printer and weighing scale.</> },
			{ label: 'Different subnets', text: 'Because Wi-Fi and Ethernet use different subnets, they are separate networks. Traffic does not pass between them unless the laptop is set up to forward or bridge it.' },
			{ label: 'Static addresses', text: <>A plain Ethernet switch has no DHCP server, so give the laptop’s Ethernet adapter and the devices static IP addresses in <code>192.168.10.0/24</code>.</> },
			{ label: 'One default gateway', text: 'Set a default gateway only on the Wi-Fi adapter. Leave it blank on the Ethernet adapter; otherwise the laptop may send Internet traffic to a network that has no Internet.' },
			{ label: 'Practical result', text: 'The laptop stays connected to office Wi-Fi while still reaching the printer and weighing scale through the wired LAN.' },
			{ label: 'Verify', text: <>Run <code>route print</code> (Windows) or <code>ip route</code> (Linux). There should be one default route, through Wi-Fi, and a route for <code>192.168.10.0/24</code> through Ethernet.</> },
		],
		images: [
			{
				src: dualNetworkLaptopImg,
				alt: 'Laptop connected to an office Wi-Fi router on 192.168.1.0/24 and, by Ethernet cable, to a switch on 192.168.10.0/24 that connects a printer and a weighing scale.',
			},
		],
		examples: [
			{
				label: 'Wi-Fi adapter (Internet and office devices):',
				rows: [
					['IP Address', 'Automatic (DHCP)'],
					['Subnet Mask', '255.255.255.0'],
					['Default Gateway', '192.168.1.1'],
					['DNS Server', 'Automatic (DHCP)'],
				],
			},
			{
				label: 'Ethernet adapter (printer and scale only):',
				rows: [
					['IP Address', '192.168.10.10'],
					['Subnet Mask', '255.255.255.0'],
					['Default Gateway', 'Leave blank'],
					['DNS Server', 'Leave blank'],
				],
			},
			{
				label: 'Devices on the Ethernet switch:',
				rows: [
					['Printer', '192.168.10.20'],
					['Weighing Scale', '192.168.10.30'],
				],
			},
		],
		note: 'If the Internet stops working after you connect the Ethernet cable, first remove the gateway from the Ethernet adapter. If it still fails, check which adapter the computer prefers; the adapter with the lower interface metric wins. Do not enable bridging or Internet Connection Sharing unless you want the two networks to connect.',
	},
	{
		id: 'share-files-python',
		title: 'Share Files Over a Local Network Using Python',
		body: 'Quickly share files from your device to any other device on the same Wi-Fi or Ethernet network using Python’s built-in HTTP server (no extra installation needed).',
		points: [
			{ label: 'Protocol & Port', text: <>Uses plain HTTP on port <code>8000</code> (unencrypted, suitable only for trusted local networks).</> },
			{ label: 'No Login Required', text: 'Anyone on the LAN who knows the address can download every file in the shared folder, including subfolders. Share a dedicated folder, never your home directory.' },
			{ label: 'Read-Only Sharing', text: 'Others can browse and download files from the shared folder, but cannot upload or change them.' },
			{ label: 'Temporary Use', text: <>Runs only while active in your terminal and stops immediately with <code>Ctrl+C</code>.</> },
			{ label: 'Platform', text: <>The commands below are for Linux (UFW firewall, <code>hostname -I</code>). On Windows, use <code>python</code> or <code>py</code> instead of <code>python3</code>, <code>ipconfig</code> to find your IP, and allow the connection when Windows Firewall asks.</> },
		],
		commands: [
			{
				title: 'Create a Folder to Share',
				description: 'Put only the files you want to share in this folder.',
				command: 'mkdir -p ~/share',
			},
			{
				title: 'Find Your IP Address',
				badge: 'Linux',
				description: 'Shows your local IP address. Use the one that starts with the same numbers as your network (for example 192.168.1.x).',
				command: 'hostname -I',
			},
			{
				title: 'Allow Firewall Access',
				badge: 'If UFW enabled',
				description: 'Opens TCP port 8000 only to devices on your local network. Change 192.168.1.0/24 to match your own subnet.',
				command: 'sudo ufw allow from 192.168.1.0/24 to any port 8000 proto tcp',
			},
			{
				title: 'Start Sharing',
				description: 'Starts a web server on port 8000 that serves only the ~/share folder and listens only on your LAN address. Replace <device-ip> with your IP address.',
				command: 'python3 -m http.server 8000 --bind <device-ip> --directory ~/share',
			},
			{
				title: 'Access from Another Device',
				badge: 'Browser',
				description: 'Open this URL on another device on the same network. Replace <device-ip> with the IP address from the earlier step.',
				command: 'http://<device-ip>:8000',
			},
			{
				title: 'Stop Sharing & Remove Firewall Rule',
				description: 'Press Ctrl+C in the terminal to stop the server, then remove the temporary firewall rule.',
				command: 'sudo ufw delete allow from 192.168.1.0/24 to any port 8000 proto tcp',
			},
		],
		note: 'Both devices must be on the same local network, and client isolation (common on guest Wi-Fi) will block access. Delete the UFW rule when you are finished.',
	},
	{
		id: 'ssh',
		title: 'Connect to Another Device Over SSH',
		body: 'SSH (Secure Shell) lets you securely access a terminal and transfer files on another device over your local network using an encrypted connection.',
		points: [
			{ label: 'Protocol & Port', text: <>Uses encrypted SSH on port <code>22</code>, keeping logins and data private.</> },
			{ label: 'Authentication', text: 'Requires a valid username and password (or SSH key) on the target device. SSH keys are safer than passwords.' },
			{ label: 'Full Remote Access', text: <>Provides an interactive terminal and two-way file transfers via <code>scp</code>.</> },
			{ label: 'Background Service', text: 'Once installed, the SSH server runs continuously and accepts logins from the network. Stop or disable it if you no longer need remote access.' },
			{ label: 'Platform', text: <>The install steps are for Debian/Ubuntu. Windows 10/11 and macOS include an SSH client, so <code>ssh</code> and <code>scp</code> also work from those systems.</> },
		],
		commands: [
			{
				title: 'Install OpenSSH Server',
				badge: 'Target Device',
				description: 'Installs and starts the SSH server on the Debian/Ubuntu device you want to connect to.',
				command: 'sudo apt update && sudo apt install openssh-server',
			},
			{
				title: 'Check the Service',
				badge: 'Target Device',
				description: 'Confirms the SSH server is running.',
				command: 'sudo systemctl status ssh',
			},
			{
				title: 'Allow Firewall Access',
				badge: 'If UFW enabled',
				description: 'Opens SSH (port 22) in UFW only for devices on your local network. Change 192.168.1.0/24 to match your own subnet.',
				command: 'sudo ufw allow from 192.168.1.0/24 to any port 22 proto tcp',
			},
			{
				title: 'Connect from Another Device',
				description: 'Logs into the remote device over the LAN. Replace <username> and <device-ip> (check the IP with hostname -I on the target).',
				command: 'ssh <username>@<device-ip>',
			},
			{
				title: 'Copy Files Over SSH (SCP)',
				badge: 'Optional',
				description: 'Securely copies a file from your device to the remote device’s home directory.',
				command: 'scp file.txt <username>@<device-ip>:~/',
			},
			{
				title: 'Create an SSH Key',
				badge: 'Recommended',
				description: 'Run on your own device. Creates a key pair so you can log in without typing the password each time.',
				command: 'ssh-keygen -t ed25519',
			},
			{
				title: 'Install the Key on the Target',
				badge: 'Recommended',
				description: 'Copies your public key to the remote device (Linux and macOS). After testing key login, you can turn off password login on the target.',
				command: 'ssh-copy-id <username>@<device-ip>',
			},
			{
				title: 'Disconnect',
				description: 'Closes the remote SSH session and returns to your local terminal.',
				command: 'exit',
			},
		],
		note: 'Both devices must be on the same local network. On first connection, check that the host fingerprint is the one you expect before typing “yes”, then enter the target user’s password.',
	},
	{
		id: 'python-vs-ssh',
		title: 'LAN File Share (Python) vs SSH',
		body: 'Both tools work over a local network, but they serve different purposes depending on whether you just need to send files or control another device.',
		table: {
			caption: 'Comparison of the Python LAN file share and SSH/SCP',
			headers: ['Feature', 'Python (LAN Share)', 'SSH / SCP'],
			rows: [
				['Main Purpose', 'Quickly share/download files', 'Remote terminal access & file transfer'],
				['Protocol & Port', 'HTTP (port 8000)', 'SSH (port 22)'],
				['Encryption', 'None (plain HTTP)', 'Encrypted'],
				['Authentication', 'No login required', 'Username & password or SSH key'],
				['Client Needed', 'Any web browser', 'SSH client / terminal'],
				['Access Level', 'Read-only (shared folder and its subfolders)', 'Full shell & two-way file transfer'],
				['Security Risk', 'Anyone on the LAN can download everything in the shared folder', 'Only users with valid credentials; keep the system updated'],
				['Best For', 'Fast file sharing to phones/laptops', 'Managing devices & secure transfers'],
			],
		},
		note: 'Use Python when you want the fastest way to share files to any browser on your LAN without installing anything extra. Use SSH when you need security, two-way transfers, or remote command-line control.',
	},
]

/** Copies text to the clipboard. Returns false if both the modern and fallback methods fail. */
async function copyText(text: string): Promise<boolean> {
	try {
		if (navigator.clipboard?.writeText) {
			await navigator.clipboard.writeText(text)
			return true
		}
	} catch {
		// Not allowed (for example on a non-HTTPS page); use the fallback below.
	}
	try {
		const area = document.createElement('textarea')
		area.value = text
		area.setAttribute('readonly', '')
		area.style.position = 'fixed'
		area.style.opacity = '0'
		document.body.appendChild(area)
		area.select()
		const ok = document.execCommand('copy')
		document.body.removeChild(area)
		return ok
	} catch {
		return false
	}
}

function DataTable({
	caption,
	headers,
	rows,
	columnClass = [],
}: TableData & { columnClass?: string[] }) {
	return (
		<div className="mt-3 overflow-x-auto">
			<table className="w-full text-xs border-collapse">
				<caption className="sr-only">{caption}</caption>
				<thead>
					<tr className="text-muted border-b border-line/60">
						{headers.map((h) => (
							<th key={h} scope="col" className="text-left py-2 pr-4 font-medium">
								{h}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{rows.map((row, j) => (
						<tr key={j} className="border-b border-line/30 hover:bg-panel-2/40">
							{row.map((cell, k) => (
								<td key={k} className={`py-2 pr-4 align-top ${columnClass[k] ?? 'text-fg/80'}`}>
									{cell}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}

function renderPoint(pt: Point): ReactNode {
	if (typeof pt === 'string') return pt
	return (
		<>
			<strong>{pt.label}</strong> — {pt.text}
		</>
	)
}

export default function DocsPage() {
	const [copyState, setCopyState] = useState<{ cmd: string; ok: boolean } | null>(null)
	const timer = useRef<number | undefined>(undefined)
	const reduceMotion = useReducedMotion()

	useEffect(() => () => window.clearTimeout(timer.current), [])

	const handleCopy = async (e: MouseEvent<HTMLButtonElement>) => {
		const cmd = e.currentTarget.dataset.command
		if (!cmd) return
		const ok = await copyText(cmd)
		setCopyState({ cmd, ok })
		window.clearTimeout(timer.current)
		timer.current = window.setTimeout(() => setCopyState(null), 1500)
	}

	const copyLabel = (command: string) => {
		if (copyState?.cmd !== command) return 'Copy'
		return copyState.ok ? 'Copied!' : 'Press Ctrl+C'
	}

	const liveMessage = copyState
		? copyState.ok
			? 'Command copied to clipboard.'
			: 'Copy failed. Select the command and press Ctrl+C.'
		: ''

	return (
		<div className="space-y-6">
			<div className="page-header">
				<div>
					<h1>LAN Printer Setup Guide</h1>
					<p>Networking basics for setting up and troubleshooting devices on a local network</p>
				</div>
			</div>

			<p className="text-muted text-sm leading-relaxed max-w-prose">
				This guide explains the networking basics you need to set up and troubleshoot
				devices on a local network, with a focus on network printers. It covers common
				networking terms, how to read and change basic network settings, how to set up
				a LAN printer, and how to fix simple connectivity problems. It is not a deep
				networking course. Commands are shown for Windows, macOS, and Linux where they
				differ; the Python file-sharing and SSH sections are Linux-focused.
			</p>
			<p className="text-muted text-xs">Last updated: {LAST_UPDATED}</p>

			<p role="status" aria-live="polite" className="sr-only">
				{liveMessage}
			</p>

			<nav aria-label="Contents" className="glass rounded-xl p-5">
				<h2 className="text-base font-semibold mb-2 mt-0">Contents</h2>
				<ol className="text-sm list-none p-0 m-0 gap-x-6 sm:columns-2 space-y-1">
					{SECTIONS.map((s, i) => (
						<li key={s.id}>
							<a href={`#${s.id}`} className="text-fg/80 hover:text-accent">
								{i + 1}. {s.title}
							</a>
						</li>
					))}
				</ol>
			</nav>

			<div className="space-y-5">
				{SECTIONS.map((s, i) => (
					<motion.section
						key={s.id}
						id={s.id}
						aria-labelledby={`${s.id}-title`}
						initial={reduceMotion ? false : { opacity: 0, y: 8 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: reduceMotion ? 0 : i * 0.03 }}
						className="glass rounded-xl p-5 scroll-mt-6"
					>
						<h2 id={`${s.id}-title`} className="text-base font-semibold mb-2 mt-0">
							{i + 1}. {s.title}
						</h2>
						{s.body && <p className="text-sm text-fg/90 mb-2">{s.body}</p>}

						{s.points && s.points.length > 0 && (
							<ul className="space-y-1 text-sm text-fg/80 list-disc pl-5 marker:text-accent">
								{s.points.map((pt, j) => (
									<li key={j}>{renderPoint(pt)}</li>
								))}
							</ul>
						)}

						{s.component && (
							<div className="mt-3">
								<s.component />
							</div>
						)}

						{s.images && (
							<div className="mt-3 flex flex-wrap gap-3">
								{s.images.map((image) => (
									<img
										key={image.src}
										src={image.src}
										alt={image.alt}
										loading="lazy"
										className="rounded-xl border border-line/40 max-w-full"
									/>
								))}
							</div>
						)}

						{s.steps && (
							<ol className="mt-3 space-y-1.5 text-sm text-fg/80 list-decimal pl-5 marker:text-accent">
								{s.steps.map((step, j) => (
									<li key={j}>{step}</li>
								))}
							</ol>
						)}

						{s.commands && s.commands.length > 0 && (
							<div className="mt-4 grid gap-3">
								{s.commands.map((step, idx) => (
									<div
										key={step.title}
										className="bg-panel-2/60 border border-line/50 rounded-xl p-3.5 transition-colors hover:border-accent/40"
									>
										<div className="flex items-start gap-3">
											<span
												aria-hidden="true"
												className="w-6 h-6 rounded-full bg-accent-dim text-accent text-xs font-bold flex items-center justify-center shrink-0 mt-0.5"
											>
												{idx + 1}
											</span>
											<div className="min-w-0 flex-1 space-y-2">
												<div className="flex flex-wrap items-center gap-2">
													<h3 className="text-sm font-semibold text-fg m-0">{step.title}</h3>
													{step.badge && (
														<span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-accent-dim text-accent border border-accent/20">
															{step.badge}
														</span>
													)}
												</div>
												<p className="text-xs text-muted m-0 leading-relaxed">{step.description}</p>
												<div className="flex items-center justify-between gap-3 bg-bg/70 border border-line/60 rounded-lg px-3 py-2">
													<code className="text-xs font-mono text-accent overflow-x-auto whitespace-nowrap">
														{step.command}
													</code>
													<button
														type="button"
														data-command={step.command}
														onClick={handleCopy}
														aria-label={`Copy command: ${step.title}`}
														className="shrink-0 text-[11px] font-medium px-2.5 py-1 rounded-md bg-panel border border-line/60 text-muted hover:text-fg hover:border-accent/50 cursor-pointer transition-colors"
													>
														{copyLabel(step.command)}
													</button>
												</div>
											</div>
										</div>
									</div>
								))}
							</div>
						)}

						{s.examples?.map((ex) => (
							<div key={ex.label} className="mt-3 bg-panel-2/60 rounded-xl p-4 border border-line/40">
								<p className="text-xs text-muted mb-2">{ex.label}</p>
								<div className="space-y-1">
									{ex.rows.map(([l, v]) => (
										<div key={l} className="flex flex-wrap justify-between gap-x-4 text-sm font-mono">
											<span className="text-muted">{l}</span>
											<code className="text-fg">{v}</code>
										</div>
									))}
								</div>
							</div>
						))}

						{s.table && <DataTable {...s.table} />}

						{s.issueGroups?.map((g) => (
							<div key={g.group} className="mt-4">
								<h3 className="text-sm font-semibold mb-1 mt-0">{g.group}</h3>
								<DataTable
									caption={`${g.group}: problems, symptoms, and solutions`}
									headers={['Problem', 'Symptom', 'Solution']}
									rows={g.items.map((iss) => [iss.problem, iss.symptom, iss.fix])}
									columnClass={['text-warn font-medium', 'text-fg/80', 'text-accent']}
								/>
							</div>
						))}

						{s.note && (
							<div className="mt-3 bg-accent-dim/40 border border-accent/20 rounded-xl p-3 text-xs text-accent">
								{s.note}
							</div>
						)}
					</motion.section>
				))}
			</div>
		</div>
	)
}