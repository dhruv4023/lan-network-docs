# Architecture

## Component Tree

```
<App>                        ← reads activePage from Zustand
├── <Sidebar>                ← nav buttons → setPage(), theme toggle
└── <main>
    ├── {activePage === 'dashboard' && <Dashboard>}
    ├── {activePage === 'router'   && <RouterPage>}
    ├── {activePage === 'devices'  && <DevicesPage>}
    ├── {activePage === 'dhcp'     && <DhcpPage>}
    ├── {activePage === 'topology' && <TopologyPage>}
    ├── {activePage === 'ipcalc'   && <IpCalcPage>}
    └── {activePage === 'logs'     && <LogsPage>}
```

## Data Flow

```
┌─────────────────────────────────────────────────────┐
│                  Zustand Store                       │
│  (single store, all state + actions)                 │
│                                                       │
│  state ← persistState() → localStorage               │
│  state ← loadState() ← localStorage                  │
│                                                       │
│  Actions: setTheme, setPage, updateRouter, addDevice, │
│  removeDevice, addReservation, releaseLease,          │
│  applyScenario, resetNetwork, simulateAction, ...     │
└────────────────────────┬────────────────────────────┘
                         │
                    useStore(selector)
                         │
            ┌────────────┼────────────┐
            ▼            ▼            ▼
        <Dashboard>  <RouterPage>  <DevicesPage>  ...
```

## State Shape (localStorage keys)

```
networkSimulator.router.v1       →  RouterConfig
networkSimulator.devices.v1      →  Device[]
networkSimulator.reservations.v1 →  DhcpReservation[]
networkSimulator.leases.v1       →  DhcpLease[]
networkSimulator.topology.v1     →  TopologyNode[]
networkSimulator.logs.v1         →  LogEntry[]
networkSimulator.settings.v1     →  { theme, sidebarOpen, activePage }
```

## Store Action Pattern

Every mutating action follows this pattern:

```
actionName(args) {
  const s = get()
  // compute new state
  const next = { ...s, modifiedField: newValue }
  persistState(next)
  return next
}
```

## Page Switching

```
sidebar button onClick → setPage('dashboard')
  → Zustand updates settings.activePage
  → App re-renders, renders matching page component
  → No URL changes, no history, no router
```

## DHCP Algorithm (dhcp.ts)

```
findNextAvailableIp(rangeStart, rangeEnd, devices, reservations, excludeIps)
  1. Convert range start/end to numbers
  2. Collect all used IPs (devices + reservations + excludeIps)
  3. Scan range start..end for first unused IP
  4. Return IP or null if pool exhausted
```

## Subnet Calculation (ip.ts)

```
calcIp(ip, mask) → {
  networkAddress: ip & mask             (bitwise AND)
  broadcastAddress: ip | ~mask          (bitwise OR with inverted mask)
  cidr: count 1-bits in mask
  firstHost: networkAddress + 1
  lastHost: broadcastAddress - 1
  totalHosts: 2^(32 - cidr)
  usableHosts: totalHosts - 2
  binary*: dotted binary representation
}
```

## Export/Import

```
storage.ts:
  exportConfig() → loadState() → JSON.stringify → download blob
  importConfig(json) → JSON.parse → validate shape → persistState()
```

## Layout

Desktop (>980px):
```
┌──────────┬────────────────────────────┐
│ Sidebar  │  Main                      │
│ 268px    │  max-width: 1200px         │
│ sticky   │  padding: 1.5rem 1.5rem   │
└──────────┴────────────────────────────┘
```

Mobile (<980px): Sidebar slides in from left; hamburger button fixed top-left.
