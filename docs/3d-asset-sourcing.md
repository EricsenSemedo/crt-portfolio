# Garage Scene Asset Sourcing

Use imported assets selectively. The authored CRT layout and camera anchors remain ours; downloaded assets provide surface realism and a few recognizable props.

## Assets in use

| Asset | Creator | Source | License | Modified | Notes |
| --- | --- | --- | --- | --- | --- |
| Basketball lowpoly | NephthysGameDev | [OpenGameArt](https://opengameart.org/content/basketball-lowpoly) | CC0 | Yes | Blender source exported locally to binary glTF |

## Recommended sources

### Poly Haven — first choice

All assets are CC0 and may be modified or used commercially without attribution.

- Vintage CRT: https://polyhaven.com/a/Television_01
- Garage lighting reference/HDRI: https://polyhaven.com/a/garage
- Small workshop lighting reference/HDRI: https://polyhaven.com/a/small_workshop
- Empty workshop lighting reference/HDRI: https://polyhaven.com/a/empty_workshop
- Autoshop lighting reference/HDRI: https://polyhaven.com/a/autoshop_01
- Vintage drill press prop: https://polyhaven.com/a/drill_press_01
- Browse models, textures, and HDRIs: https://polyhaven.com/

Prefer a 1K or 2K HDRI for the website. The 8K–24K downloads are intended for offline rendering and are too expensive for this portfolio.

### Kenney — low-poly supporting props

Kenney packs listed below use CC0 and are useful for inexpensive background silhouettes.

- Furniture Kit: https://kenney.nl/assets/furniture-kit
- Factory Kit: https://kenney.nl/assets/factory-kit
- Car Kit: https://kenney.nl/assets/car-kit

### Sketchfab — only with a recorded license

Filter for downloadable `CC0` or `CC BY` models. CC BY requires a visible credit and source link. Avoid `NC` for a professional portfolio, `ND` when optimization or editing is required, and `SA` unless we intentionally want the derivative asset distributed under the same license.

For each downloaded model, add its title, creator, source URL, download date, and license to an asset ledger before committing it.

## Scene shopping list

1. One hero CRT shell to replace or augment a procedural television.
2. One 1K–2K garage/workshop HDRI for reflections and ambient color, not as the visible room.
3. Concrete floor and painted-block/brick wall PBR textures.
4. Two or three silhouette props: shelf, tool chest, drill press, storage box.
5. Personal props already represented procedurally: basketball, game console, controller, VHS/CD media.

Do not download a complete photoreal garage scene. It will make the portfolio generic, increase draw calls, and make art direction harder.

## Web asset pipeline

1. Download GLB/glTF where available; Three.js recommends glTF for runtime delivery.
2. Open the asset in Blender and remove unseen geometry, duplicate materials, logos, and unnecessary lights/cameras.
3. Keep hero CRT textures at 1024–2048 px; background props at 512–1024 px.
4. Export one GLB per replaceable asset with stable nodes such as `ScreenAnchor`, `ScreenPlane`, and `CameraTarget`.
5. Optimize with glTF Transform, for example:

   ```bash
   npx @gltf-transform/cli optimize source.glb optimized.glb \
     --texture-compress webp
   ```

6. Target roughly 1–3 MB per hero asset and under 500 KB per background prop. Load the overview first and defer nonessential props.
7. Keep the current procedural assets as an automatic fallback if a GLB fails to load.
8. Test mobile memory, focus transitions, and asset disposal before adding another model.

## Attribution ledger template

| Asset | Creator | Source | License | Modified | Notes |
| --- | --- | --- | --- | --- | --- |
| Example CRT | Artist name | Direct model URL | CC BY 4.0 | Yes | Decimated, textures resized |
| Television 01 | Gabriel Radić | https://polyhaven.com/a/Television_01 | CC0 | Yes | 1K glTF art-directed into three distinct CRT variants |
| Garage HDRI | Greg Zaal | https://polyhaven.com/a/garage | CC0 | Yes | 1K HDR used for scene reflections only |
