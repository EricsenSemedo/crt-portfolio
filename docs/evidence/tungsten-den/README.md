# Tungsten Den night room

Captured on 2026-10-09 with headless Chromium (ANGLE on GL-EGL, Intel ADL GPU) against the Vite dev server. "Before" is `main` at `949ef50`; "after" is the tree committed as `5d9a60a`.

- `overview-before-after.webp`: 3D overview at 1440 × 900. Daytime garage on the left; on the right, the night room lit by the lamp and the three screens.
- `gallery-before-after.webp`: the Projects channel. Charcoal with blue buttons, then warm surfaces with amber actions.
- `mobile-before-after.webp`: the overview at 390 × 844 before and after, plus the gallery after. This is viewport emulation, not a physical device.
- `detail-contact-after.webp`: Hero's Quest detail and Contact, with the cream hover fill on LinkedIn.

The hover state and the full transition were not recorded. Headless Chromium reports `hover: none`, so hover-driven lighting was checked in code, not on screen.
