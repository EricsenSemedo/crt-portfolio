# CRT Portfolio

Frontend-only React/TypeScript SPA with Three.js, Vite, Tailwind CSS, and Framer Motion.

## Working rules

- Prefer Bun and `bunx`. Scripts are listed in `package.json`; run `bun run lint`,
  `bun run test`, and `bun run build` before submitting changes. Build includes type-checking.
- Favor correctness, performance, and reliability. Keep shared behavior in one module
  rather than duplicating it across callers.
- Match surrounding formatting; no Prettier. Use relative imports, function declarations
  for components, and inline `type` imports. Use string unions instead of enums.
- Use React state and refs; do not introduce an external state library or clsx.
- Keep PRs focused (normally 50–150 lines). Run `cr review --base main` before submitting.

## Local preview

GitHub Pages and Vite use `/crt-portfolio/`, including in development.
Run `bun run dev --host 0.0.0.0 --port 5173` and open
`http://localhost:5173/crt-portfolio/`.

## Project scope

[PRD.md](./PRD.md) tracks product requirements and architecture;
[LEARNING.md](./LEARNING.md) tracks technology proficiency.
This is finite, ship-and-stop work. Finish the requested queue without proposing
ongoing aesthetic polish; further portfolio expansion should follow a new showcaseable project.
