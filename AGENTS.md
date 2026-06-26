# NetSim — Network Configuration Simulator

Interactive React SPA for learning LAN networking concepts: DHCP, static IPs, subnetting, reservations, and topology.

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Build production to `dist/` |
| `npm run preview` | Preview production build |

## Tech Stack

- **React 19** + **TypeScript** — function components, hooks
- **Vite 8** — build tool with `@vitejs/plugin-react`, `@tailwindcss/vite`
- **Tailwind CSS v4** — zero-config via plugin; theme in `src/index.css` using `@theme {}`
- **Zustand** — state management (no context boilerplate)
- **localStorage** — persistence layer with versioned schema (`networkSimulator.*.v1`)
- **No routing library** — page switching via Zustand `settings.activePage`
- **No test framework** — no tests exist

## Project Structure

```
src/
├── main.tsx                  React entry
├── index.css                 Tailwind v4 @theme + all @layer
├── App.tsx                   Root layout + page router
├── types/index.ts            All TypeScript interfaces
├── utils/
│   ├── ip.ts                 IP calc, validation, conversion
│   └── dhcp.ts               DHCP allocation algorithm
├── lib/storage.ts            localStorage persist/load/export
├── data/scenarios.ts         Demo scenario definitions + defaults
├── store/index.ts            Zustand store (all state + actions)
├── components/
│   └── Sidebar.tsx           Nav sidebar
└── pages/
    ├── Dashboard.tsx         Stats cards + scenario buttons
    ├── RouterPage.tsx        Router config + subnet calculator
    ├── DevicesPage.tsx       Device CRUD table + add/edit modal
    ├── DhcpPage.tsx          Reservations + lease table
    ├── TopologyPage.tsx      SVG interactive topology canvas
    ├── IpCalcPage.tsx        IP/subnet calculator with binary
    └── LogsPage.tsx          Severity-coded event log
```

## State Shape

All state in Zustand store (`useStore`), persisted to `localStorage` keys:
- `networkSimulator.router.v1` — RouterConfig
- `networkSimulator.devices.v1` — Device[]
- `networkSimulator.reservations.v1` — DhcpReservation[]
- `networkSimulator.leases.v1` — DhcpLease[]
- `networkSimulator.topology.v1` — TopologyNode[]
- `networkSimulator.logs.v1` — LogEntry[]
- `networkSimulator.settings.v1` — { theme, sidebarOpen, activePage }

## Key Algorithms

- **DHCP allocation** — scans range, skips reserved/used/router/broadcast IPs
- **IP validation** — strict octet checking, duplicate detection, subnet enforcement
- **Subnet calc** — bitwise AND/OR for network/broadcast; CIDR from mask
- **Topology** — SVG with drag-to-move, click-to-connect, conflict highlighting

## Tailwind Theme Tokens

Use `bg-{token}`, `text-{token}`, `border-{token}`:

`bg`, `bg-soft`, `panel`, `panel-2`, `line`, `fg`, `muted`, `accent`, `accent-dim`, `warn`, `warn-dim`, `danger`, `danger-dim`

## Conventions

- No comments in component logic
- One component per file, PascalCase name
- Imports from `../store` for Zustand selectors
- Store actions mutate state + persist + log in one step
- No barrel exports — import directly from file path
