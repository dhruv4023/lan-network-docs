# NetPrint Console

Static single-page guide for LAN printer provisioning. No build, no dependencies.

## Files

- `index.html` — all content (sections, wizard steps, IP tables)
- `script.js` — routing, search, wizard, checklist persistence, IP validation
- `styles.css` — dark/light theme via `[data-theme]`, print styles

## How to run

Open `index.html` in a browser — no server needed.

## Architecture

- SPA routing via `data-route` attributes + `history.replaceState`
- Wizard uses in-memory `state` object persisted to `localStorage` under key `netprint-console-state-v1`
- Search builds a lightweight index from `h1`/`h2`/`h3`/`li`/`summary`/`p` text at page load
- IP tables (`data-editable-table`) validate on input and flag duplicates + malformed addresses
- Three network topologies: direct, switch-only, router-based; tabs toggle visibility via `data-tabgroup`/`data-tabpanel`
- Checklist state is per-checklist-key in `state.checklists`

## Conventions

- No external dependencies — pure vanilla JS, IIFE-wrapped with `"use strict"`
- CSS custom properties for theming; no preprocessor
- `data-copy` attribute on any element enables click-to-copy (clipboard API with fallback)
- `data-goto` attribute on buttons/links navigates to a route
- `data-checklist` enables persisted checkbox state
- `data-validate-group` / `data-validate` / `data-editable-table` drive IP validation
- Print hides sidebar, topbar, hero actions, wizard nav, and ghost buttons
