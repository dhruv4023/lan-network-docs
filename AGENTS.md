# NetPrint Console

SPA for provisioning LAN thermal printers. React 19 + Vite 8 + Tailwind CSS v4.

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Build production to `dist/` |
| `npm run preview` | Preview production build |
| `npm run deploy` | Build + publish `dist/` to GitHub Pages (gh-pages branch) |

## Tech Stack

- **React 19** — function components, hooks (`useState`, `useEffect`, `useCallback`, `useRef`)
- **Vite 8** — build tool with `@vitejs/plugin-react`, `@tailwindcss/vite`
- **Tailwind CSS v4** — zero-config via `@tailwindcss/vite` plugin; theme defined in `src/index.css` using `@theme {}`
- **No routing library** — hash-based SPA routing via `history.replaceState`
- **No state library** — `useState` + `localStorage` persistence
- **No test framework** — no tests exist

## Project Structure

```
├── index.html                  Vite entry (source)
├── vite.config.js              base: './', outDir: 'dist'
├── package.json
├── .github/workflows/deploy.yml  CI → GitHub Pages
└── src/
    ├── main.jsx                React mount
    ├── index.css               Tailwind v4 @theme + all @layer components
    ├── App.jsx                 Root: router, state, search buildIndex
    └── components/
        ├── Sidebar.jsx         Nav + theme toggle + print
        ├── Topbar.jsx          Search input + results overlay
        ├── Home.jsx            Landing page, topology cards, checklist
        ├── Wizard.jsx          Multi-step wizard (topology → count → dhcp → result)
        ├── NetworkSetup.jsx    Tabs: direct single / multi-switch + IP table
        ├── RouterConfig.jsx    Router-based guide + IP table
        ├── PrinterConfig.jsx   6-step printer config + verify checklist
        ├── Troubleshooting.jsx  Accordion of issues
        ├── FAQ.jsx             FAQ accordion
        └── Summary.jsx         IP plan ref + progress bars
```

## Architecture & Data Flow

### State
- Single `state` object in `App.jsx` managed by `useState`, persisted to `localStorage` key `netprint-console-state-v1`
- Shape: `{ checklists, theme, wizard, routeTabs }`
- `saveState(updater)` — accepts function or object, calls `setState` + `localStorage.setItem`
- State passes as props to children

### Routing
- Hash-based: `location.hash` determines route, `history.replaceState(null, '', '#' + route)` on navigation
- `navigate(to, tab?)` function passed as `onNavigate`/`navigate` prop
- Routes: `home`, `wizard`, `network`, `router`, `printer`, `troubleshooting`, `faq`, `summary`

### Search
- `Topbar` builds search index from DOM text nodes
- `searchIndexRef` (shared via `useRef` from App) holds `{ text, routeName, routeTitle, el }[]`
- `Home` component populates initial ref entries via `useEffect`

### Theme
- `data-theme` attribute on `<html>` — values `"dark"` (default) or `"light"`
- CSS custom properties redefined in `[data-theme="light"]` selector (`src/index.css`)
- Toggle: `Sidebar` calls `toggleTheme` from `App`

### Clipboard
- Click handler on `[data-copy]` elements copies value to clipboard
- Falls back to `document.execCommand('copy')` via textarea
- Uses `navigator.clipboard.writeText` when available

## Tailwind CSS v4 Theme Colors

Use these in JSX as `bg-{name}`, `text-{name}`, `border-{name}`:

| Token | Dark | Light | Usage |
|---|---|---|---|
| `bg` | `#0a0e13` | `#f4f7f9` | Body background |
| `bg-soft` | `#0e141b` | `#ffffff` | Sidebar, input bg |
| `panel` | `#121922` | `#ffffff` | Cards, panels |
| `panel-2` | `#161f2a` | `#eef2f5` | Secondary panels, hover |
| `line` | `#223040` | `#d7e0e6` | Borders |
| `fg` | `#e8eef4` | `#162028` | Text (foreground) |
| `muted` | `#8da0b3` | `#5b6b78` | Secondary text |
| `accent` | `#54e0c2` | `#0d9b80` | Primary accent |
| `accent-dim` | `#1e463f` | `#d6f3ec` | Accent bg highlight |
| `warn` | `#f2b340` | `#9a6a06` | Warning text/border |
| `warn-dim` | `#4a3a1a` | `#fdf0d2` | Warning bg |
| `danger` | `#ef6461` | `#b3372f` | Error text/border |
| `danger-dim` | `#4a2222` | `#fbe2e0` | Error bg |

Fonts: `font-sans` (Segoe UI stack), `font-mono` (JetBrains Mono / SF Mono stack)

## Component Conventions

- No prop-types — use simple `function Component({ prop1, prop2 })` destructuring
- No comments in JSX or component logic
- No fragment wrappers unless needed
- Use Tailwind arbitrary values `w-[123px]` sparingly; prefer theme tokens
- IPTables in `NetworkSetup.jsx` and `RouterConfig.jsx` use local `useState` for editable rows
- `Wizard.jsx` defines steps as an array of objects with `{ id, field, title, skip?, render, isFinal? }`

## Deployment

- Build → `dist/` (all paths relative via `base: './'`)
- GitHub Actions auto-deploys `dist/` to GitHub Pages on push to `main`
- Manual: `npm run deploy` (requires `gh-pages` to be installed)

## Linting

`npm run lint` runs oxlint (no config file needed).
