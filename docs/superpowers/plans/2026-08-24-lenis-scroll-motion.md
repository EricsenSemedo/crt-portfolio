# Lenis Scroll Motion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add PX Push-style desktop smooth scrolling, restore the scroll-linked blur-and-fade, retain native touch momentum, and protect the behavior with tests.

**Architecture:** A single scroll-motion hook owns the desktop Lenis instance and its manual animation-frame clock. The same hook updates row-level reveal styles from each row's measured position, replacing the browser-dependent CSS view timeline that caused the regression. Fine-pointer desktop viewports use Lenis; touch and tablet viewports use the existing native overflow scroller.

**Tech Stack:** React 19, TypeScript, Lenis, Vitest, CSS custom properties

---

### Task 1: Capture the motion rules as testable functions

**Files:**
- Create: `src/utils/scrollMotion.ts`
- Test: `src/utils/__tests__/scrollMotion.test.ts`

- [ ] **Step 1: Write failing tests for desktop eligibility, the five-percent threshold, full exit, and reduced motion**
- [ ] **Step 2: Run `bun run test -- src/utils/__tests__/scrollMotion.test.ts` and confirm the new module is missing**
- [ ] **Step 3: Implement pure eligibility and reveal-progress functions with clamped outputs**
- [ ] **Step 4: Run the focused test and confirm it passes**

### Task 2: Put Lenis and row reveals on one clock

**Files:**
- Create: `src/hooks/useScrollMotion.ts`
- Modify: `src/components/TVZoomOverlay.tsx`
- Modify: `src/index.css`
- Modify: `package.json`
- Modify: `bun.lock`

- [ ] **Step 1: Install `lenis` and import its recommended stylesheet**
- [ ] **Step 2: Build one hook that manually calls `lenis.raf(time)` and updates visible `.crt-scroll-reveal` rows in the same frame**
- [ ] **Step 3: Disable Lenis for coarse pointers, tablet-sized viewports, and reduced motion while retaining native scrolling**
- [ ] **Step 4: Remove the CSS view-timeline dependency and drive opacity, blur, and translation through CSS variables**
- [ ] **Step 5: Mount the hook at the TV overlay so each selected screen gets one lifecycle-managed clock**

### Task 3: Verify behavior and release

**Files:**
- Modify only files required by review findings

- [ ] **Step 1: Verify the reveal on a desktop viewport and native scrolling on phone and tablet viewports**
- [ ] **Step 2: Run `bun run test`, `bun run lint`, and `bun run build`**
- [ ] **Step 3: Run `cr review --plain --base main` and address actionable findings**
- [ ] **Step 4: Commit only the portfolio changes, push the feature branch, and merge it into `main`**
