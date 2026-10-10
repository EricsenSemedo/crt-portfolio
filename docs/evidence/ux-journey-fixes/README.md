# UX journey fixes

Captured on 2026-10-10 with headless Chromium against the Vite dev server.

- `phone-demo-before-after.webp`: Hero's Quest demo at 390 × 844. The video grows from 284 px to 334 px wide.
- `home-focus-after.webp`: after PageDown scrolls the Profile, Shift+Tab focuses Home and the hidden header slides back into view.

Measured in the same run (`fix/verify.mjs`, `fix/early.mjs`):

| Check | Before | After |
|---|---|---|
| Profile `scrollTop` after 3 × PageDown | 0 | 1104 |
| Focused element when a channel opens | dialog container | page scroller |
| TV click after Home, at +700 ms | ignored | opens Contact |
| Gallery card channels | CH TH, CH NC… | CH 01 … CH 08 |

Clicks in the first ~0.5 s still don't select anything, because the screen is still zoomed into the previous TV.
