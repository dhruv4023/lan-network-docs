# Architecture

## Component Tree

```
<App>                          ← state owner, router, saveState
├── <Sidebar>                  ← nav buttons, theme toggle, print
├── <Topbar>                   ← search input + results overlay
└── {route === 'home'    && <Home>}
    {route === 'wizard'   && <Wizard>}
    {route === 'network'  && <NetworkSetup>}
    {route === 'router'   && <RouterConfig>}
    {route === 'printer'  && <PrinterConfig>}
    {route === 'troubleshooting' && <Troubleshooting>}
    {route === 'faq'      && <FAQ>}
    {route === 'summary'  && <Summary>}
```

## Data Flow

```
App (state owner)
 │
 ├── saveState(updater)    ← mutates state + localStorage
 ├── state                 ← read-only snapshot
 ├── navigate(to, tab?)    ← sets route, updates hash
 └── toggleTheme()         ← flips dark/light
      │
      ▼
 Children receive props as needed (state, saveState, navigate)
 Components that don't mutate state (Troubleshooting, FAQ) receive no props
```

## State Shape (localStorage key: `netprint-console-state-v1`)

```js
{
  checklists: {
    overview: [true, false, true, ...],   // boolean[] per checklist
    verify:   [false, true, ...],
  },
  theme: "dark" | "light",
  wizard: {
    topology: "single" | "multi" | "router" | null,
    count: "2-3" | "4+" | null,
    dhcp: "yes" | "no" | null,
    step: 0,                               // current step index
  },
  routeTabs: {
    network: "single" | "multi",           // active tab on Network page
  }
}
```

## Route Handling

```
hashchange → App reads location.hash → sets route state
navigate('x') →
  setRoute('x')
  history.replaceState(null, '', '#x')
  window.scrollTo(0, 0)

Initial load: useEffect reads location.hash, sets initial route
Fallback to 'home' if hash is empty or invalid
```

## Search

```
Topbar builds searchIndex (via ref from App)
  ↓
User types → filter index by substring match → show top 8 results
  ↓
Click result:
  navigate to matching route (with tab if applicable)
  scroll to matching element
  flash accent outline on element
```

## Color System

- Dark theme: default in `@theme {}` block
- Light theme: `[data-theme="light"]` overrides same CSS vars
- No `@media (prefers-color-scheme)` — user choice saved in localStorage
- All colors use theme tokens; no hardcoded hex in JSX

## Layout

```
Desktop ( >980px ):
┌──────────┬────────────────────────────┐
│ Sidebar  │  Main                      │
│ 268px    │  max-width: 1080px         │
│          │  padding: 1.6rem 2.2rem    │
│ sticky   │  margin: 0 auto            │
└──────────┴────────────────────────────┘

Mobile ( <980px ):
Sidebar slides in from left (transform: translateX)
Hamburger button fixed top-left
Main padded for mobile (4rem top for button clearance)
```

## Build Flow

```
npm run build
  → Vite reads src/index.html (root)
  → Resolves imports from src/
  → Tailwind scans JSX for class names
  → Output to dist/
    dist/index.html        ← base: './' (relative paths)
    dist/assets/*.js
    dist/assets/*.css
  → GitHub Actions deploys dist/ to Pages
```
