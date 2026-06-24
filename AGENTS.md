# NetPrint Console

Static single-page guide for LAN printer provisioning. No build, no dependencies.

## Files

- `index.html` — app shell (sidebar, topbar, search) + script loading
- `core.js` — state persistence, theme toggle, sidebar, print, clipboard, route registry
- `app.js` — routing, search, tabs, checklists, IP validation, wizard logic
- `styles.css` — dark/light theme via `[data-theme]`, print styles
- `routes/` — one file per route, each registered via `NetPrint.addRoute(name, html)`

## How to run

Open `index.html` in a browser — no server needed.

## Route modules

Each file in `routes/` wraps its HTML content in a template string and registers it:

```
NetPrint.addRoute("routeName", `<section class="route" ...>...</section>`);
```

`app.js` injects all registered routes into `#routeContainer` at startup, then builds the search index and binds components. Loading order is fixed by `<script>` tags in `index.html`.

## Architecture

- SPA routing via `data-route` attributes + `history.replaceState`
- Wizard uses `NetPrint.state.wizard` persisted to `localStorage` under key `netprint-console-state-v1`
- Search builds a lightweight index from `h1`/`h2`/`h3`/`li`/`summary`/`p` text at page load
- IP tables (`data-editable-table`) validate on input and flag duplicates + malformed addresses
- Three network topologies: direct, switch-only, router-based; tabs toggle visibility via `data-tabgroup`/`data-tabpanel`
- Checklist state is per-checklist-key in `NetPrint.state.checklists`

## Conventions

- No external dependencies — pure vanilla JS, IIFE-wrapped with `"use strict"`
- Shared state lives on `window.NetPrint.state`; persist with `NetPrint.saveState()`
- CSS custom properties for theming; no preprocessor
- `data-copy` attribute on any element enables click-to-copy (clipboard API with fallback)
- `data-goto` attribute on any element navigates to a route (delegated listener)
- `data-checklist` enables persisted checkbox state
- `data-validate-group` / `data-validate` / `data-editable-table` drive IP validation
- Print hides sidebar, topbar, hero actions, wizard nav, and ghost buttons
