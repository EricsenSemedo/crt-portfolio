# CRT Portfolio

## Commands

| Command | Description |
| --- | --- |
| `yarn dev` | Vite dev server with HMR |
| `yarn build` | Production build (also type-checks) |
| `yarn lint` | ESLint |
| `yarn test` | Vitest (single run) |

Type-check without building: `npx tsc --noEmit`

## Non-obvious conventions

- **No Prettier.** Semicolons are inconsistent across files — match the file you're editing.
- **Relative imports only.** `@/*` alias exists in tsconfig but is unused — stay consistent with relative paths.
- **Function declarations** for components, not arrow functions: `export default function Name(...)`.
- **No enums.** Use string literal unions.
- **No clsx.** Use string concatenation for conditional classes.
- **No external state library.** `useState`/`useRef` only.
- **Inline `type` keyword** in imports: `import { useState, type ReactNode } from "react"`.

## PRs

Keep PRs small (100–300 lines, max 500). Run `cr review --plain --base main` before submitting.

## Cursor Cloud specific instructions

- **Frontend-only SPA.** No backend, database, Docker, secrets, or external services required.
- **Base path gotcha**: Dev server serves at `/crt-portfolio/`, not `/`. Navigate to `http://localhost:5173/crt-portfolio/` when testing.
- Start dev server with `yarn dev --host 0.0.0.0 --port 5173` for remote access.
