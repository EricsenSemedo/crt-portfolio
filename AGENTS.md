# CRT Portfolio

Retro CRT television portfolio site. Frontend-only SPA deployed to GitHub Pages at `/crt-portfolio/`.

## Core Priorities

Performance first. Reliability first. Keep behavior predictable under load and during failures (session restarts, reconnects, partial streams).

If a tradeoff is required, choose correctness and robustness over short-term convenience.

## Maintainability

Long-term maintainability is a core priority. Before adding functionality, check if there is shared logic that can be extracted to a separate module. Duplicate logic across files is a code smell. Don't take shortcuts by adding local logic — change existing code instead.

## Commands

| Command | Description |
| --- | --- |
| `bun run dev` | Vite dev server with HMR |
| `bun run build` | Production build (also type-checks) |
| `bun run lint` | ESLint |
| `bun run test` | Vitest (single run) |
| `bun run test:watch` | Vitest (watch mode) |

Type-check without building: `bunx tsc --noEmit`

## Non-obvious conventions

TypeScript/React-specific rules live in `.cursor/rules/tsx-standards.mdc` (auto-attaches when editing `*.ts` / `*.tsx`). Project-wide:

- **No Prettier.** Semicolons are inconsistent across files — match the file you're editing.
- **No external state library.** `useState`/`useRef` only.

## PRs

Keep PRs small (50–150 lines). Run `cr review --plain --base main` before submitting.

## Cursor Cloud specific instructions

- **Frontend-only SPA.** No backend, database, Docker, secrets, or external services required.
- **Base path gotcha**: Dev server serves at `/crt-portfolio/`, not `/`. Navigate to `http://localhost:5173/crt-portfolio/` when testing.
- Start dev server with `bun run dev --host 0.0.0.0 --port 5173` for remote access.

## Living Documents

- **[PRD.md](./PRD.md)** — Product requirements, architecture, and task tracker.
- **[LEARNING.md](./LEARNING.md)** — Technology proficiency tracker.
