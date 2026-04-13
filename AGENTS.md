# CRT Portfolio

Retro CRT television portfolio site. React 19, TypeScript, Vite 7, Tailwind CSS v4, Framer Motion v12. Deployed to GitHub Pages at `/crt-portfolio/`.

## Core Priorities

Performance first. Reliability first. Keep behavior predictable under load and during failures (session restarts, reconnects, partial streams).

If a tradeoff is required, choose correctness and robustness over short-term convenience.

## Maintainability

Long-term maintainability is a core priority. Before adding functionality, check if there is shared logic that can be extracted to a separate module. Duplicate logic across files is a code smell. Don't take shortcuts by adding local logic — change existing code instead.

## Package Manager

**Bun only.** Use `bun` for installing dependencies and running scripts, `bunx` for one-off executables. Never use `npm`, `npx`, `yarn`, or `pnpm`.

## Commands

| Command | Description |
| --- | --- |
| `bun install` | Install dependencies |
| `bun run dev` | Vite dev server with HMR |
| `bun run build` | Production build (also type-checks) |
| `bun run lint` | ESLint |
| `bun run test` | Vitest (single run) |
| `bun run test:watch` | Vitest (watch mode) |

Type-check without building: `bunx tsc --noEmit`

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
- Start dev server with `bun run dev --host 0.0.0.0 --port 5173` for remote access.

## Living Documents

- **[PRD.md](./PRD.md)** — Product requirements, architecture, and task tracker.
- **[LEARNING.md](./LEARNING.md)** — Technology proficiency tracker.
