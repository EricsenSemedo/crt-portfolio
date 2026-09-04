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

- Add Three.js to the real React app.
- Create a `ThreeCRTStage` component for the main Home/Portfolio/Contact TV selection scene.
- Keep existing `TVZoomOverlay` and page content initially, but trigger it from the 3D scene.
- Preserve keyboard/button fallback navigation for accessibility.
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
- Scene remains performant enough for portfolio use.
- Reduced-motion mode avoids aggressive camera animation.
- Existing Home, Portfolio, and Contact content remains reachable.

## Notes

The temp prototype lives at `temp/3d-crt-design-lab/` and should be treated as a design reference, not production code. It is useful for camera/mood exploration, but production should use modular assets and eventually Blender-authored models.
