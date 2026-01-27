# AGENTS.md - Coding Agent Instructions

This file contains guidelines for AI coding agents working on the CRT Portfolio project.

## Project Overview

**Project Type:** React Portfolio Website with CRT TV Aesthetic  
**Stack:** React 19, TypeScript, Vite, Tailwind CSS, Framer Motion  
**Package Manager:** npm (use `npm install`, `npm run`, etc.)  
**Node Version:** v20+ (CI uses v20, local development on v25.2.1)

## Build & Development Commands

```bash
# Development
npm run dev              # Start dev server (Vite)

# Building
npm run build           # Build for production (outputs to dist/)
npm run preview         # Preview production build locally

# Code Quality
npm run lint            # Run ESLint on all files

# Testing
# ⚠️ NO TEST FRAMEWORK CONFIGURED YET
# If adding tests, consider Vitest + React Testing Library
```

### Running Single Test (Not Yet Set Up)
When tests are added, use Vitest:
```bash
npm test -- path/to/test.test.tsx        # Single test file
npm test -- --watch path/to/test.test.tsx # Watch mode
```

## Code Style Guidelines

### File Organization

```
src/
├── components/          # Reusable UI components
│   └── portfolio/      # Feature-specific components (use subdirectories)
├── pages/              # Top-level route components (Home, Portfolio, Contact)
├── types/              # Centralized TypeScript type definitions
├── data/               # Static data (e.g., projects.ts)
└── assets/             # Images, videos, static files
```

### Imports

**Order and Style:**
1. React imports first (named imports from "react")
2. External libraries (framer-motion, howler)
3. Internal components (relative imports)
4. Types (using `type` keyword for type-only imports)
5. Data/constants

**Example:**
```tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import PanStage, { type PanStageRef } from "./components/PanStage";
import type { PanState, TVConfig } from "./types";
import { projects } from "./data/projects";
```

**Key Rules:**
- Use named imports for React (not `import React from "react"`)
- Use `type` keyword for type-only imports: `import type { Type } from "./types"`
- Use double quotes for imports
- Prefer relative imports for local files (`./components/...`)
- Use path alias `@/*` for `src/*` when needed (defined in tsconfig.json)

### TypeScript

**Strict Mode Enabled:**
- Always use explicit types for function parameters and return values
- Avoid `any` - use `unknown` or proper types
- Use `interface` for object types, `type` for unions/intersections
- Centralize shared types in `src/types/index.ts`

**Type Definition Patterns:**
```tsx
// Interfaces for objects
export interface Project {
  id: string;
  title: string;
  // ...
}

// Type aliases for unions
export type NavigateFunction = (targetId: string) => void;
type ButtonVariant = 'primary' | 'secondary' | 'ghost';

// Extending built-in types
interface CRTButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  onClick?: () => void;
  // ...
}
```

**React Types:**
- Use `ReactNode` for children props
- Use proper HTML element types: `ButtonHTMLAttributes<HTMLButtonElement>`, `HTMLDivElement`, etc.
- Use `MouseEvent<T>`, `ChangeEvent<T>` for event handlers
- Prefer function components with explicit return types when complex

### Naming Conventions

**Components:**
- PascalCase: `CRTButton`, `TVShell`, `ProjectDetailView`
- Export as default for single-component files
- File names match component names: `CRTButton.tsx`

**Files:**
- Components: PascalCase (`Navbar.tsx`)
- Utilities/data: camelCase (`projects.ts`)
- Types: camelCase (`index.ts` in types/)
- Pages: PascalCase (`Home.tsx`, `Portfolio.tsx`)

**Variables & Functions:**
- camelCase: `panState`, `navigateToTV`, `handleMouseEnter`
- Boolean variables: prefix with `is`, `has`, `should`: `isAnimating`, `hasError`
- Constants: UPPER_SNAKE_CASE (rare, only for true constants)

**Types:**
- Interfaces/Types: PascalCase: `Project`, `PanState`, `TVConfig`
- Prop types: `{ComponentName}Props`: `CRTButtonProps`

### Component Structure

**Recommended Order:**
1. Imports
2. Type definitions (props interface)
3. JSDoc comment for component
4. Component function with props destructuring
5. State declarations (grouped)
6. Refs
7. Memoized values
8. Effects
9. Event handlers
10. Helper functions
11. Render logic
12. Return/JSX

**Example:**
```tsx
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  onNavigate: (id: string) => void;
}

/**
 * ComponentName - Brief description
 */
export default function ComponentName({ children, onNavigate }: Props) {
  // State
  const [state, setState] = useState(initialValue);
  
  // Refs
  const ref = useRef<HTMLDivElement>(null);
  
  // Effects
  useEffect(() => {
    // ...
  }, []);
  
  // Event handlers
  const handleClick = () => {
    // ...
  };
  
  // Render
  return (
    <div>{children}</div>
  );
}
```

### Styling (Tailwind CSS)

**Patterns:**
- Use Tailwind utility classes directly in JSX
- For complex/repeated styles, create separate components
- Use `className` prop for customization
- Combine classes with template literals for readability
- Use responsive prefixes: `sm:`, `md:`, `lg:`
- Use `clamp()` for responsive sizing: `w-[clamp(12rem,24vw,20rem)]`

**Example:**
```tsx
const baseClasses = `
  font-medium rounded-lg transition-all duration-200
  focus:outline-none focus:ring-2 focus:ring-cyan-400/50
  ${sizeClasses[size]}
  ${variantClasses[variant]}
  ${className}
`.trim();
```

### JSDoc Comments

Add JSDoc for:
- All exported components (brief description)
- Complex utility functions
- Public API functions

**Format:**
```tsx
/**
 * CRTButton - Button component with nostalgic CRT TV-themed animations
 */
export default function CRTButton({ ... }) { ... }
```

### Error Handling

**Patterns:**
- Use optional chaining: `panRef.current?.reset()`
- Provide fallbacks: `byId[panState.selectedId] ?? null`
- Early returns for guards: `if (!panRef.current) return;`
- Disabled states for conditional logic: `if (disabled) return;`

**Avoid:**
- Silent failures without logging
- Unchecked null/undefined access
- Swallowing errors in try-catch without re-throwing or logging

### State Management

**Current Pattern:**
- Use React hooks (useState, useRef, useEffect)
- Lift state to nearest common ancestor
- Pass navigation callbacks via props
- No external state library (Redux, Zustand) - keep it simple

**Effect Dependencies:**
- Always specify dependency arrays
- Use ESLint warnings to catch missing dependencies
- Extract values to avoid object/function recreation
- Note: `react-hooks/set-state-in-effect` is set to 'warn' due to intentional animation coordination patterns

## Project-Specific Guidelines

### CRT Aesthetic
- Maintain retro CRT TV theme throughout
- Use cyan/blue color palette (`cyan-600`, `cyan-700`)
- Apply scanline effects, vignettes, and static noise
- Keep animations smooth but subtle (100-200ms)

### Component Patterns
- All CRT effects should be reusable components
- TVShell wraps TV-like content
- Use `data-pan-id` for selectable TVs
- Maintain aspect ratios with Tailwind: `aspect-square`, `aspect-video`

### Performance
- Use `useMemo` for expensive computations or static data
- Use `useRef` for DOM references and mutable values
- Avoid inline function creation in render (extract handlers)
- Videos are large (13-20MB) - ensure lazy loading

## Git & Deployment

**Branch:** `main`  
**Deployment:** GitHub Pages (automatic on push to main)  
**Base Path:** `/crt-portfolio/` (configured in vite.config.js)

**Commit Guidelines:**
- Use conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`
- Keep commits focused and atomic
- Test locally before pushing (runs `npm run build` in CI)

## Common Pitfalls

1. **Forgetting base path:** All public assets must include `/crt-portfolio/` prefix
2. **Missing type imports:** Use `import type` for type-only imports
3. **Unused vars:** ESLint allows capital letter vars (e.g., `TVs`, `CRT`)
4. **Effect dependencies:** Always include all dependencies in useEffect
5. **Double quotes:** Use double quotes for strings (not single)

## Future Enhancements

When adding these features, follow these guidelines:

**Testing:**
- Install: `npm install -D vitest @testing-library/react @testing-library/jest-dom`
- Add script: `"test": "vitest"`
- Create `vitest.config.ts` with React plugin

**Code Formatting:**
- Install: `npm install -D prettier`
- Add `.prettierrc`: `{ "semi": true, "singleQuote": false, "tabWidth": 2 }`

## Questions or Issues?

- Check existing components for patterns before creating new ones
- Maintain consistency with established code style
- When in doubt, follow the patterns in `App.tsx` and `CRTButton.tsx`
- Preserve the CRT aesthetic in all UI changes
