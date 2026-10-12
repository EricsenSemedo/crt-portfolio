"""Pack tree cutouts from render-tree-impostors.py into one WebP atlas.

python3 scripts/pack-tree-atlas.py --output public/models/garage-sunset/street-trees.webp \
  --atlas 1024 /tmp/impostors/jacaranda_tree.png:512 /tmp/impostors/island_tree_01.png:512 ...

Each PNG is cropped to its leaves and trunk, resized to the given pixel height, and
shelf-packed. Colour bleeds into transparent texels so mipmaps keep no dark fringe.
Prints the TREE_ATLAS entries for createGarageTrees.ts (requires Pillow and NumPy).
"""
import argparse
from pathlib import Path

import numpy as np
from PIL import Image

parser = argparse.ArgumentParser()
parser.add_argument('--output', type=Path, required=True)
parser.add_argument('--atlas', type=int, default=1024)
parser.add_argument('--quality', type=int, default=82)
# Leaves are alpha-tested at 0.5, so lossy alpha costs no visible edge quality.
parser.add_argument('--alpha-quality', type=int, default=70)
parser.add_argument('cutouts', nargs='+')
args = parser.parse_args()

atlas = np.zeros((args.atlas, args.atlas, 4), dtype=np.uint8)
x = y = shelf = 0
entries = []
for spec in args.cutouts:
    path, height = spec.rsplit(':', 1)
    image = Image.open(path).convert('RGBA')
    alpha = np.asarray(image)[..., 3]
    rows, cols = np.nonzero(alpha > 8)
    image = image.crop((cols.min(), rows.min(), cols.max() + 1, rows.max() + 1))
    height = int(height)
    width = round(image.width * height / image.height)
    image = image.resize((width, height), Image.LANCZOS)
    if x + width > args.atlas:
        x, y, shelf = 0, y + shelf + 2, 0
    if y + height > args.atlas:
        raise SystemExit(f'{path} does not fit in the atlas')
    atlas[y:y + height, x:x + width] = np.asarray(image)
    entries.append((Path(path).stem, x, y, width, height))
    x, shelf = x + width + 2, max(shelf, height)

# Bleed opaque colours outward so filtering never samples black from empty texels.
rgb = atlas[..., :3].astype(np.float32)
filled = atlas[..., 3] > 8
for _ in range(48):
    total = np.zeros_like(rgb)
    count = np.zeros(filled.shape, dtype=np.float32)
    for dy, dx in ((-1, 0), (1, 0), (0, -1), (0, 1)):
        shifted = np.roll(np.roll(filled, dy, 0), dx, 1)
        total += np.roll(np.roll(rgb, dy, 0), dx, 1) * shifted[..., None]
        count += shifted
    grow = ~filled & (count > 0)
    rgb[grow] = total[grow] / count[grow][:, None]
    filled |= grow
atlas[..., :3] = rgb.astype(np.uint8)
used = y + shelf
atlas = atlas[:used]
args.output.parent.mkdir(parents=True, exist_ok=True)
Image.fromarray(atlas, 'RGBA').save(args.output, 'WEBP', quality=args.quality,
                                    alpha_quality=args.alpha_quality, method=6)
print(args.output, args.output.stat().st_size, 'bytes', atlas.shape[1], 'x', used)
for name, ex, ey, w, h in entries:
    # UV origin is bottom-left; the quad's base sits on the trunk's lowest texel.
    print(f'  {name}: {{ u: {ex / atlas.shape[1]:.4f}, v: {1 - (ey + h) / used:.4f}, '
          f'width: {w / atlas.shape[1]:.4f}, height: {h / used:.4f}, aspect: {w / h:.3f} }},')
