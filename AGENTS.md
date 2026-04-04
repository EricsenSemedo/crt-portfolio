# CRT Portfolio

Retro CRT television portfolio site. React 19, TypeScript, Vite 7, Tailwind CSS v4, Framer Motion v12. Deployed to GitHub Pages at `/crt-portfolio/`.

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

- **[PRD.md](./PRD.md)** — Product requirements, architecture, and task tracker. Check off items as completed. Add new tasks to backlog when discovered. Keep it current — it's the source of truth for what's done, in progress, and planned.
- **[LEARNING.md](./LEARNING.md)** — Technology proficiency tracker. Update as concepts move from "new" to "known" or when new technologies are introduced.

## Learning-First Development

This project is an explicit learning vehicle. AI agents and human contributors should prioritize explanation over velocity.

### PR Explanations

Every PR body MUST include a `## What I Learned` section written for the repo owner:

1. **Line-by-line walkthrough** — For non-trivial changes, explain what each significant block of code does and WHY it's written that way. Don't just say "added a function" — explain the pattern, the reasoning, the alternatives.

2. **Concepts introduced** — If the PR uses a pattern, technique, or API the owner might not know (check LEARNING.md proficiency levels), include a brief plain-English explanation with a concrete example.

3. **Technology choices** — If a library, tool, or language feature was chosen over alternatives, explain why.

4. **Tradeoffs made** — Every decision has tradeoffs. State them explicitly: "This is simpler but slightly slower because..." or "This uses more memory but avoids the complexity of..."

### Code Comments

- Add comments for non-obvious logic explaining the WHY, not the WHAT
- Use `// NOTE:` for important context the reader needs
- Use `// LEARN:` for educational annotations that explain a pattern or technique
  (e.g., `// LEARN: This is the observer pattern — we notify all subscribers when state changes`)
- Keep comments concise but don't skip them when a line would confuse a learner

### Commit Messages

- Use conventional commit prefixes: `feat:`, `fix:`, `refactor:`, `test:`, `chore:`, `perf:`, `docs:`
- Keep subject line under 72 characters
- Use the extended body to explain the reasoning behind changes, not just what changed
- Reference relevant concepts or patterns so the owner can search for them later

### Interactive Sessions

When working directly with the repo owner:
- If they ask "why?" — give the full context, not just the surface answer
- If you use a concept they might not know — explain it before moving on
- If there are multiple valid approaches — walk through the tradeoffs so they can build intuition for making these decisions themselves
- Default to explaining more rather than less — the owner will tell you to speed up if they already understand something

### Goal

The agent should leave the owner MORE capable after every interaction — not dependent on the agent. The owner should be able to explain every line of their codebase, defend every architectural choice, and eventually anticipate what the agent would suggest.
