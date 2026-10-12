"""Box-filter a Radiance HDR down by an integer factor (energy-preserving average).
blender --background --factory-startup --disable-autoexec --python scripts/resize-hdr.py -- \
  /path/to/industrial_sunset_02_puresky_1k.hdr public/environments/sunset-256.hdr 4
Blender only reads the source; the RGBE file is written here so no view transform is applied.
"""
import sys

import bpy
import numpy as np

src, dst, factor = sys.argv[sys.argv.index('--') + 1:]
factor = int(factor)
image = bpy.data.images.load(src)
w, h = image.size
pixels = np.empty(w * h * 4, dtype=np.float32)
image.pixels.foreach_get(pixels)
# Blender stores rows bottom-up; Radiance "-Y" files are top-down.
pixels = pixels.reshape(h, w, 4)[::-1, :, :3]
small = pixels.reshape(h // factor, factor, w // factor, factor, 3).mean(axis=(1, 3))
sh, sw = small.shape[:2]


def to_rgbe(rgb):
    peak = rgb.max(axis=-1)
    mantissa, exponent = np.frexp(peak)
    scale = np.where(peak > 1e-32, mantissa * 256.0 / np.maximum(peak, 1e-32), 0)
    out = np.zeros(rgb.shape[:-1] + (4,), dtype=np.uint8)
    out[..., :3] = np.clip(rgb * scale[..., None], 0, 255).astype(np.uint8)
    out[..., 3] = np.where(peak > 1e-32, exponent + 128, 0)
    return out


def rle(channel):
    # New-style Radiance run-length encoding for one channel of one scanline.
    data, i, n = bytearray(), 0, len(channel)
    while i < n:
        run = 1
        while i + run < n and run < 127 and channel[i + run] == channel[i]:
            run += 1
        if run >= 3:
            data += bytes([128 + run, channel[i]])
            i += run
            continue
        start = i
        while i < n and i - start < 128:
            if i + 2 < n and channel[i] == channel[i + 1] == channel[i + 2]:
                break
            i += 1
        data += bytes([i - start]) + bytes(channel[start:i])
    return data


rgbe = to_rgbe(small)
with open(dst, 'wb') as f:
    f.write(b'#?RADIANCE\nFORMAT=32-bit_rle_rgbe\n\n')
    f.write(f'-Y {sh} +X {sw}\n'.encode())
    for row in rgbe:
        f.write(bytes([2, 2, sw >> 8, sw & 255]))
        for c in range(4):
            f.write(rle(row[:, c].tolist()))
print('RESIZED', w, h, '->', sw, sh)
