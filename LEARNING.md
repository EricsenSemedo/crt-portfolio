# LEARNING.md

Owner knowledge profile for calibrating PR explanations and code comments.

## Proficiency Levels

- **known**: Owner is fluent. Skip detailed explanations.
- **familiar**: Owner understands the concept but may not use it daily. Brief reminders OK.
- **learning**: Owner is actively learning. Explain in detail with context.
- **new**: Concept was just introduced. Full explanation required.

## Concepts

### React 19 / TypeScript

| Concept | Level | Notes |
|---------|-------|-------|
| JSX / component composition | familiar | Function declarations per convention, no arrow components |
| `useState` / `useRef` / `useEffect` | familiar | Core state management, no external libraries |
| `useCallback` / `useMemo` | learning | Used in PanStage and App to prevent stale closures and unnecessary re-renders |
| `forwardRef` / `useImperativeHandle` | learning | PanStage exposes imperative API (`reset`, `centerOn`, `selectTV`) |
| Context API (`createContext`, `useContext`) | familiar | ThemeProvider / `useTheme` pattern |
| `Children.toArray` / ReactElement casting | learning | PanStage iterates children to inject click handlers dynamically |
| TypeScript strict mode | familiar | Zero errors, `noUnusedLocals`, `noUnusedParameters` |
| String literal union types | learning | Used instead of enums per project convention |
| Generic types / `Record<K,V>` | familiar | Page content mapping, variant class objects |
| Ref-backed state for animation closures | learning | `currentTransformRef` + `selectedTVIdRef` in PanStage avoid stale values in animation callbacks |

### Framer Motion v12

| Concept | Level | Notes |
|---------|-------|-------|
| `motion` components | familiar | Used throughout for animated divs, buttons, images |
| `useAnimationControls` | learning | PanStage camera animation with imperative `.start()` calls |
| `AnimatePresence` | familiar | TVZoomOverlay exit animations, channel transitions in Portfolio |
| Spring vs. tween transitions | learning | Zoom-in uses tween (predictable timing), zoom-out uses spring (natural bounce) |
| `useMotionValue` / `useSpring` | learning | ParallaxBackground mouse-following with spring physics |
| `layoutId` animations | learning | ProjectTV to ProjectDetailView iOS App Store-style expansion |
| `whileHover` / `whileTap` | familiar | Micro-interactions on buttons, TV shells |
| `useReducedMotion` | learning | ThemeToggle respects `prefers-reduced-motion` media query |

### Tailwind CSS v4

| Concept | Level | Notes |
|---------|-------|-------|
| `@theme` directive | new | Maps CSS custom properties to Tailwind utility classes in v4 |
| `@import "tailwindcss"` | new | v4 replaces `@tailwind base/components/utilities` directives with single import |
| CSS custom properties with `rgb()` pattern | learning | `rgb(var(--token))` enables alpha composition in Tailwind utilities |
| Class-based theme toggling | familiar | `.light` class on `<html>`, `@theme` reads same CSS tokens |
| `bg-linear-to-r` | new | v4 canonical name replaces `bg-gradient-to-r` |
| `shrink-0` vs `flex-shrink-0` | new | v4 canonical utility names differ from v3 |
| Content configuration | familiar | `content` array in tailwind.config.js |

### Accessibility / WCAG

| Concept | Level | Notes |
|---------|-------|-------|
| Focus trap in modals | learning | `useModalAccessibility` custom hook with Tab/Shift+Tab cycling |
| `aria-modal`, `aria-labelledby` | learning | TVZoomOverlay and ProjectDetailView dialogs |
| `inert` attribute | new | Removes background from tab order and screen readers when modal is open |
| `role="dialog"` | familiar | Applied to overlay containers |
| `role="button"` + `tabIndex` | learning | PanStage child items are interactive divs, need keyboard semantics |
| `focus-visible` ring | familiar | Consistent `:focus-visible` styling across interactive elements |
| `prefers-reduced-motion` | learning | Respected in ParallaxBackground, ThemeToggle, theme transitions |
| Modal stack management | learning | `activeModalStack` array for nested modals (TVZoomOverlay > ProjectDetailView) |
| Color contrast across themes | learning | Separate accent values for dark (400-level) vs light (600-level) to meet WCAG AA |

### Tooling

| Concept | Level | Notes |
|---------|-------|-------|
| Vite 7 (dev server, HMR, build) | familiar | Base path `/crt-portfolio/` configured for GitHub Pages |
| Vitest 4 with jsdom | learning | Unit tests for ThemeProvider / themeUtils |
| ESLint 9 flat config | learning | typescript-eslint, react-hooks, react-refresh plugins |
| bun package manager | new | Project uses `bun run` commands, `bun.lock` |
| GitHub Pages deployment | familiar | Automated via `.github/workflows/deploy.yml` on push to main |
| PostCSS + autoprefixer | familiar | Tailwind v4 build pipeline |
| View Transitions API | new | `document.startViewTransition()` for smooth theme crossfade |
| Howler.js | new | Audio library in dependencies, not yet integrated |

### Architecture / Patterns

| Concept | Level | Notes |
|---------|-------|-------|
| Camera / zoom system | learning | PanStage: viewport-relative centering, `requestAnimationFrame` timing, ref-backed state |
| CRT visual effects pipeline | familiar | Composable overlays: scanlines, vignette, noise, bloom, sweep-line reveal |
| CSS design token architecture | learning | Layered: CSS vars -> `@theme` -> Tailwind utilities -> components |
| Theme intensity multipliers | new | `--crt-scanline-opacity` etc. scale CRT effect intensity per theme mode |
| Imperative ref API for navigation | learning | `useImperativeHandle` exposing `selectTV`, `reset`, `centerOn` on PanStage |
| Pending navigation pattern | learning | `pendingNavigation` state in App for sequential zoom-out-then-zoom-in transitions |
| Mobile browser detection fallbacks | learning | UA-sniffing for Firefox Mobile CSS transition fallback in PanStage |
| Modal accessibility hook | learning | Reusable `useModalAccessibility` handling focus trap, escape, inert, restore focus |
| Barrel exports | familiar | `components/portfolio/index.ts` re-exports for cleaner imports |
