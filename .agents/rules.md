# Coding Rules & Conventions

## General
- Do NOT add comments to code unless explaining a non-obvious workaround
- Keep functions small; extract repeated JSX into local variables or small helper components
- Prefer `useCallback`/`useMemo` only when passing deps to child components that memoize

## React
- Use function components with destructured props
- No prop-types (no runtime type checking)
- No class components, no legacy lifecycle methods
- No fragment (`<>`) wrapper unless you need to return multiple adjacent elements
- Event handlers: `onClick={fn}`, never `onClick={() => fn()}`
- Conditional rendering: `{condition && <Component />}` or ternary, never `display:none` in JSX
- State initializer: pass function to `useState(() => ...)` for expensive computation

## Tailwind CSS
- Use theme tokens: `bg-panel`, `text-accent`, `border-line`, etc. — never raw hex in JSX
- Arbitrary values (`w-[123px]`) only when no theme token fits
- Responsive: use `max-[980px]:` prefix for mobile overrides
- Dark/light: all theming is handled by `data-theme` attribute; no `dark:` variants needed
- Utility classes over custom CSS — only use `@layer components` in `index.css` for patterns repeated across 3+ components

## State & Props
- Single `state` object in App.jsx, persisted to localStorage key `netprint-console-state-v1`
- Pass state + saveState as props to children that mutate state
- Children that only read state receive it directly (e.g. `state={state}`)
- IP table rows use local `useState` in NetworkSetup.jsx and RouterConfig.jsx

## Clipboard
- `data-copy="text"` attribute on any element makes it copy-to-clipboard on click
- Built into a global document click handler in App-side logic

## Routing
- `App.jsx` holds `route` state; renders one component at a time via `{route === 'x' && <X />}`
- Navigation: `navigate('routeName', 'optionalTabName')`
- Avoid adding new routing dependencies

## Files
- One component per file
- Component file name matches export (PascalCase)
- No barrel exports (`index.js`) — import directly from component file

## No tests
- This project has no test framework or test files. Do not write tests.
