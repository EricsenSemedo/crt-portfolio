# Issue: Build Production 3D CRT Room Scene With Replaceable Assets

## Summary

Replace the current 2D/DOM-based main TV stage with a higher-quality 3D basement scene. The final website should feel like three real CRT TVs sitting on a basement table, arranged in a subtle concave arc. Selecting a TV should move the camera into the selected screen until the screen fills most of the viewport with only a small amount of bezel visible.

The temp design lab proved the direction, but it also showed the limit of procedural Three.js primitives. For production, build the scene from individual reusable assets first, then assemble them into the final Three.js scene. Later, these placeholder assets can be replaced with Blender-made `.glb` models without changing the interaction model.

## Current Design Direction

- Basement room, not abstract UI.
- Three CRT TVs on a table, centered horizontally.
- TVs arranged in a gentle concave lineup, pointing inward slightly.
- Static roll is the preferred hover/screen wake effect.
- On TV selection, camera zooms into the screen, showing mostly screen and a tiny amount of bezel.
- Each TV should have a different shell and nostalgic detail.
- Props should feel personal/nostalgic, not random decoration.

## Asset List

### Core Scene Assets

- Basement room shell
  - dark back wall
  - floor plane
  - subtle floor/wall texture
  - low, warm basement lighting

- Table
  - long table top
  - legs/supports
  - worn wood or dark laminate material

### TV Assets

- TV 1: VHS CRT
  - distinct shell silhouette
  - visible screen and bezel
  - right-side controls/knobs
  - VHS tape slot or media insert
  - antenna

- TV 2: CD/Disc CRT
  - different shell proportions
  - visible screen and bezel
  - CD/disc tray detail
  - different antenna or top detail

- TV 3: Game CRT
  - different shell from the first two
  - visible screen and bezel
  - old plug-in game/cartridge detail
  - controller on floor or table nearby
  - cord routed toward TV/console

### Prop Assets

- old game console
- wired controller
- cable/cord geometry
- basketball on floor
- optional: VHS tape, CD case, stickers, dust/scuffs, small storage box

## Implementation Plan

### Phase 1: Production Three.js Scene Scaffold

- Extend the existing `ThreeCRTStage`, which owns the canvas and wraps `createPortfolioScene()`.
- Keep scene selection on the shared `PortfolioChannelId` contract. `ThreeCRTStage` emits the selected ID, and the app passes it through the selected item consumed as `TVZoomOverlay.selectedId`.
- Preserve the current close path: closing the overlay clears the selection, requests a scene reset, and returns the camera to the overview before another selection.
- Preserve the accessible channel buttons as keyboard and non-canvas fallbacks for selecting Profile, Projects, and Contact.
- Use responsive camera presets for mobile, desktop, and ultrawide.

### Phase 2: Build Placeholder Assets In Code

Build each asset as its own module/component so it can later be swapped with a Blender `.glb`.

Suggested module split:

- `src/three/assets/createBasementRoom.ts`
- `src/three/assets/createTable.ts`
- `src/three/assets/createVhsTV.ts`
- `src/three/assets/createDiscTV.ts`
- `src/three/assets/createGameTV.ts`
- `src/three/assets/createGameConsole.ts`
- `src/three/assets/createController.ts`
- `src/three/assets/createBasketball.ts`
- `src/three/materials.ts`
- `src/three/cameraPresets.ts`

### Phase 3: Interaction Model

- Hover on TV:
  - no scale/inflation
  - screen comes alive via static roll
  - subtle screen glow increase
  - cursor changes to pointer

- Select TV:
  - camera targets that TV screen anchor
  - zooms close enough that the screen dominates
  - keeps a tiny bezel edge visible
  - after zoom completes, open existing content overlay or render content into screen

- Back/close:
  - return camera to overview
  - restore basement table scene

### Phase 4: Replace Placeholder Assets With Blender Models

When ready, create final models in Blender and export as `.glb`.

Each model should expose named anchors/nodes:

- `ScreenAnchor`
- `ScreenPlane`
- `CameraTarget`
- `HoverLight`
- optional prop anchors like `CablePort`, `CartridgeSlot`, `ControllerPort`

That keeps the Three.js interaction code stable while replacing geometry.

## Acceptance Criteria

- Three TVs are clearly visible on first load across desktop, ultrawide, and mobile.
- TVs feel like objects in a basement room, not cards floating in 3D.
- Each TV has a distinct shell and nostalgic detail.
- Static roll hover feels nostalgic and personal, without cartoon scaling.
- Selecting any TV zooms into the screen with only a small amount of bezel visible.
- The game/controller/basketball props are visible but do not distract from the TVs.
- Performance meets these cold-load budgets with the browser cache disabled and no other active page interactions:
  - Desktop at 1440×900 on a current four-core laptop, 25 Mbps / 40 ms network: at least 55 average FPS during the overview and camera transition, no more than 6 MB of initial scene assets, and an interactive scene within 3.5 seconds.
  - Ultrawide at 2560×1080 on the same desktop profile and network: at least 50 average FPS, no more than 6 MB of initial scene assets, and an interactive scene within 4 seconds.
  - Mid-range mobile at 390×844 on a 2022-class Android device, 10 Mbps / 80 ms network: at least 30 average FPS, no more than 6 MB of initial scene assets, and an interactive scene within 6 seconds.
- Reduced-motion mode avoids aggressive camera animation.
- Existing Home, Portfolio, and Contact content remains reachable.

## Notes

Treat the current `ThreeCRTStage` and modules under `src/three/` as the behavior reference. Production revisions should preserve their interaction contract while moving visual assets toward modular, Blender-authored models.
