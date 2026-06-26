# Coding Rules & Conventions

## General
- No comments in component logic
- One component per file, PascalCase export
- Imports from `../store` for Zustand selectors (never direct import of store)
- No barrel exports — import directly from file path

## React + TypeScript
- Function components with destructured props — no `React.FC`
- No prop-types (use TypeScript interfaces from `../types`)
- No class components, no legacy lifecycle
- Conditional rendering: `{condition && <X />}` or ternary
- Event handlers: `onClick={fn}`, never `onClick={() => fn()}`
- Hooks only: `useState`, `useEffect`, `useCallback`, `useRef`

## Zustand Store
- Store in `src/store/index.ts` using `create<State & Actions>()`
- Selectors in components: `useStore(s => s.someValue)`
- Actions must: mutate state → `persistState(next)` → return `next`
- Every mutating action should add a `log()` entry automatically
- Never call `persistState` outside store actions

## State Management Pattern
1. Component dispatches store action
2. Store action computes new state
3. Store calls `persistState(next)` to save to localStorage
4. Store appends log entry
5. Store returns new state → all subscribers re-render

## Tailwind CSS
- Theme tokens only: `bg-panel`, `text-accent`, `border-line` — no raw hex in JSX
- Arbitrary values (`w-[123px]`) only when no token exists
- Responsive: `max-[980px]:` prefix for mobile
- Dark/light handled by `data-theme` CSS vars — no `dark:` variants

## Routing
- No routing library — pages switched via `settings.activePage` in Zustand
- Sidebar buttons call `setPage('pageId')`
- `App.tsx` renders `pages[activePage] || <Dashboard />`

## No tests
- This project has no test framework. Do not write tests.
