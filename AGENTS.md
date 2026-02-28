# CRT Portfolio

Retro CRT television portfolio site. React 19, TypeScript, Vite 7, Tailwind CSS v4, Framer Motion v12. Deployed to GitHub Pages at `/crt-portfolio/`.

## Commands

| Command | Description |
| --- | --- |
| `yarn dev` | Vite dev server with HMR |
| `yarn build` | Production build (also type-checks) |
| `yarn lint` | ESLint |
| `yarn test` | Vitest (single run) |
| `yarn test:watch` | Vitest (watch mode) |

Type-check without building: `npx tsc --noEmit`

## Non-obvious conventions

- **No Prettier.** Semicolons are inconsistent across files — match the file you're editing.
- **Relative imports only.** `@/*` alias exists in tsconfig but is unused — stay consistent with relative paths.
- **Function declarations** for components, not arrow functions: `export default function Name(...)`.
- **No enums.** Use string literal unions.
- **No clsx.** Use string concatenation for conditional classes.
- **No external state library.** `useState`/`useRef` only.
- **Inline `type` keyword** in imports: `import { useState, type ReactNode } from "react"`.

## Agent Skills

Skills at `.agents/skills/<name>/SKILL.md` are auto-discovered.

- **Code Review**: `.agents/skills/code-review/SKILL.md` — CodeRabbit auto-reviews PRs; use `cr` CLI for local reviews.
- **Frontend Design**: `.agents/skills/frontend-design/SKILL.md` — use when building/restyling UI.
- **Vercel React Best Practices**: `.agents/skills/vercel-react-best-practices/SKILL.md` — 57 React/Next.js perf rules from Vercel Engineering.
- **Requesting Code Review**: `.agents/skills/requesting-code-review/SKILL.md` — dispatch code-reviewer subagent before merging.
- **Continual Learning**: `.agents/skills/continual-learning/SKILL.md` — mine transcripts for recurring corrections, update AGENTS.md.
- **Find Skills**: `.agents/skills/find-skills/SKILL.md` — discover and install skills via `npx skills find`.
- **Agent Browser**: `.agents/skills/agent-browser/SKILL.md` — browser automation CLI for web testing.

## PRs

Keep PRs small (100–300 lines, max 500). Run `cr review --plain --base main` before submitting.

## Cursor Cloud specific instructions

- **Frontend-only SPA.** No backend, database, Docker, secrets, or external services required.
- **Base path gotcha**: Dev server serves at `/crt-portfolio/`, not `/`. Navigate to `http://localhost:5173/crt-portfolio/` when testing.
- Start dev server with `yarn dev --host 0.0.0.0 --port 5173` for remote access.
