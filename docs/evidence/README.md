# Hash navigation verification

Recorded against the Vite production build on 2026-09-13.

- [Desktop recording](./hash-navigation-desktop.mp4): open Profile; browser Back returns to the TV overview; Forward restores Profile; navigate to Projects and open PullWorth; Back closes the project; Forward reopens it; reload the project URL; close to the gallery. The reload was also verified with the browser Performance API (`navigation.type === "reload"`).
- [Mobile viewport recording](./hash-navigation-mobile.mp4): at 390 × 844, close the directly linked project to the gallery, reopen it, and use browser Back to close it again. Playback is slowed to half speed for readability.

Back/Forward were exercised using the browser's `history.back()` and `history.forward()` methods. The mobile check emulates viewport size; it is not a physical-device swipe test. Both recordings show the existing CRT transitions. The desktop recording includes idle time between actions.

Automated coverage: route selection and redirects; duplicate-entry prevention; direct-link close fallback; Back/Forward through views and projects; retaining the scene; ignoring superseded focus callbacks; acknowledging a TV already focused by a local selection. Lint, all 81 tests, and the type-checked production build passed.
