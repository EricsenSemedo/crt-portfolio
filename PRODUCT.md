# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Hiring managers, recruiters and engineers filling entry-level software and game-development roles. Both tracks share one front door.

They arrive from a link: on Ericsen's résumé, on his LinkedIn profile or a post, or one he shares directly. Résumé links are usually opened on a desktop. LinkedIn links are often opened on a phone, inside LinkedIn's in-app browser.

## Product Purpose

A personal portfolio presented as a late-night room of CRT televisions. A visitor sits down, picks a channel, and is pulled into the screen to see Ericsen's profile, projects and contact links.

A visit succeeds when the visitor:
- reached out,
- read the Profile, which serves as the résumé, and
- watched at least one project demo and remembered it.

## Positioning

The site is itself the strongest project. The takeaway a visitor should leave with: Ericsen knows his stuff, makes deliberate design decisions, and builds experiences that are unforgettable, not just good-looking. They look good, feel good, and show care for craft in both design and software. That care is the evidence that he can solve real problems with software. A template portfolio cannot claim this.

## Operating Context

- Channels: Profile (01), Projects (02) and Contact (03). Projects open into a detail view with Demo and Description channels.
- Visitors are evaluating a candidate, often in a few minutes between other applicants. The experience has to reward a short visit and a long one.

## Capabilities and Constraints

- Frontend-only React, Three.js and Vite single-page app, deployed to GitHub Pages at `/crt-portfolio/`. There is no backend or form submission, and contact is links-only.
- Hash routes: `#/profile`, `#/portfolio`, `#/portfolio/<project>`, `#/contact`.
- The Profile channel is the résumé. No résumé PDF and no public email: contact stays LinkedIn and GitHub (owner's decision, 2026-10-10).
- The three randomized screen transitions are deliberate variety. Polish them, but don't reduce them to one.

## Brand Commitments

- Name: Ericsen Semedo.
- Nostalgic CRT television, with Three.js used with restraint. The core gesture is sitting down to watch and getting pulled into the screen.
- Tungsten Den palette (confirmed 2026-10-10): a warm, dark night room, with blue reserved for the TV signal.
- No eyebrow labels above headings unless the owner adds one.

## Evidence on Hand

- Real projects with media in `src/data/projects.ts`:
  - Software: PullWorth, ToonSync.io, Derma, SHADI.
  - Games: Hero's Quest, Physics Grab & Fling, Don't Get Caught, Grow Your Plant.
  - Additional: Edgewood Remodeling, Stitch, and others.
- Experience and education are in `src/pages/Home.tsx`.
- There are no testimonials, metrics or employer endorsements. Do not invent any.

## Product Principles

1. The experience is the argument. Every interaction should demonstrate craft, not just describe it.
2. Respect the evaluator's time. The immersive path must never block someone who needs the facts quickly.
3. Show, then tell. Demos and real work come before claims.
4. Deliberate over decorated. Every effect earns its place in the TV-room story.

## Accessibility & Inclusion

Keyboard navigation and dialog semantics are already supported and must be preserved. Respect `prefers-reduced-motion`.
