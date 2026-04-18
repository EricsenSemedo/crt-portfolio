# PRD — CRT Portfolio

## Overview

Personal portfolio website styled as a retro CRT television interface. Three TV sets
(Home, Portfolio, Contact) are arranged on a pannable/zoomable stage. Clicking a TV
zooms the camera in and opens a full-screen overlay with page content rendered inside
CRT visual effects (scanlines, vignette, static noise, sweep-line animation). The site
supports dark/light theming with effect intensities that scale per mode.

## Problem

Generic portfolio sites fail to stand out or demonstrate frontend craft. A portfolio
should itself be a portfolio piece — showcasing animation, theming, accessibility, and
interaction design skills while presenting project work.

## Goals

- [x] CRT television metaphor with physical TV shells, scanlines, vignette, and static noise
- [x] Camera/zoom system for TV selection with smooth Framer Motion animations
- [x] Full-screen TVZoomOverlay with CRT sweep-line reveal animation
- [x] Dark/light theming via CSS custom properties with View Transitions API
- [x] Theme-aware CRT effect intensity scaling (opacity multipliers per mode)
- [x] Portfolio gallery with per-project detail views (demo channel + description channel)
- [x] Parallax mouse-following background with spring physics
- [x] Responsive layout (mobile-first, flex-based TV arrangement)
- [x] GitHub Pages deployment at `/crt-portfolio/`
- [x] Keyboard navigation and ARIA dialog semantics for modals
- [ ] CRT boot sequence animation on initial page load
- [ ] CRT ambient background and channel labels on overview screen
- [ ] Redesigned page content with CRT terminal aesthetic (Home, Portfolio, Contact)
- [ ] Navbar polish with signal indicator, phosphor glow, and keyboard hints
- [ ] Global keyboard shortcuts for TV navigation
- [ ] Sound effects via Howler.js (dependency already installed but unused)
- [ ] SEO and social sharing meta tags
- [ ] Comprehensive test coverage beyond ThemeProvider

## Non-Goals

- No backend, database, or server-side rendering
- No CMS or dynamic content management
- No user authentication or form submissions (contact is links-only)
- No routing library (single-page app with modal-based navigation)
- No external analytics or tracking scripts
- No IE or legacy browser support

## Architecture

Component tree, key patterns, and module responsibilities are discoverable from `src/` —
start at `src/main.tsx` → `src/App.tsx` → follow imports. Conventions worth flagging that
are NOT obvious from reading code:

- **Theme intensity multipliers:** CRT effect opacities multiply by CSS vars
  (`--crt-scanline-opacity`, `--crt-vignette-opacity`, `--crt-noise-opacity`) that differ
  between dark (1.0) and light (0.4–0.6) modes. Tweaking a single component's opacity
  without going through these tokens will desync theme parity.
- **Firefox Mobile fallback in PanStage:** UA-sniffed CSS transitions are used instead of
  Framer Motion controls because the `transform` interpolation jitters on FF mobile. Don't
  remove the branch without testing on real device.
- **Modal stack ordering:** `activeModalStack` in `useModalAccessibility` enforces
  TVZoomOverlay > ProjectDetailView. Adding a new modal requires registering it in the
  stack so `inert`/focus-restore work correctly.

## Task Tracker

### Completed

- [x] Initial project scaffold (Vite + React + TypeScript)
- [x] PanStage camera system with zoom animations
- [x] TVShell, CRTScanlines, CRTVignette, StaticNoise components
- [x] TVZoomOverlay with sweep-line reveal
- [x] ParallaxBackground with spring physics
- [x] Home, Portfolio, Contact pages
- [x] Project gallery with demo/description channels
- [x] Dark/light theme foundation (CSS design tokens) — PR #22
- [x] Component migration to theme tokens — PR #23
- [x] Theme toggle with Framer Motion — PR #24
- [x] CRT typography (Orbitron, IBM Plex Sans, IBM Plex Mono) — PR #25
- [x] Theme-aware CRT effect intensity scaling — PR #26
- [x] Light mode contrast fixes — PR #27
- [x] View Transitions API for smooth theme switching — PR #28
- [x] ThemeToggle polish with reduced-motion support — PR #29
- [x] TypeScript migration — PR #18
- [x] CRTButton reusable component — PR #14
- [x] Mobile zoom performance optimizations
- [x] ThemeProvider unit tests (Vitest)
- [x] Centralized projects data module — PR #16, #17
- [x] CTA button navigation between TVs
- [x] Navbar component

### In Progress

- [ ] Accessibility: keyboard navigation and ARIA dialog semantics — PR #30

### Backlog

- [ ] CRT boot sequence animation (branch: `feat/crt-boot-sequence`)
- [ ] CRT ambient background + channel labels (branch: `feat/crt-ambient-bg`)
- [ ] Home page CRT terminal redesign (branch: `feat/home-crt-terminal`)
- [ ] Portfolio page CRT terminal redesign (branch: `feat/portfolio-crt-terminal`)
- [ ] Contact page CRT channel redesign (branch: `feat/contact-crt-channel`)
- [ ] Navbar CRT polish: signal indicator, phosphor glow, keyboard hints (branch: `feat/navbar-crt-polish`)
- [ ] Global keyboard shortcuts for TV navigation (branch: `feat/keyboard-shortcuts`)
- [ ] Improve main screen aesthetic (branch: `feat/improve-main-screen-aesthetic`)
- [ ] Sound effects integration (Howler.js already in dependencies)
- [ ] Replace default Vite favicon with custom CRT-themed icon
- [ ] SEO meta tags (og:image, description, etc.)
- [ ] Additional unit/integration tests
- [ ] Performance audit (Lighthouse, bundle analysis)
- [ ] Reduced-motion support audit across all animations

## Success Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Lighthouse Performance | > 90 | TBD |
| Lighthouse Accessibility | > 90 | TBD |
| TypeScript strict mode | Zero errors | Achieved |
| Theme transition smoothness | No layout shift | Achieved |
| Mobile performance | Smooth zoom on mid-range devices | Achieved (Firefox fallback) |
| Test coverage | Key utilities + hooks | ThemeProvider only |

## Learning-First Philosophy

This project is explicitly a learning vehicle for modern frontend technologies.
Every PR, commit message, and code comment should help the owner level up their
engineering skills. See `LEARNING.md` for the owner's current proficiency levels
and `AGENTS.md` "Learning-First Development" section for full requirements.

## Revision History

| Date | Change |
|------|--------|
| 2026-04-04 | Initial PRD created |
