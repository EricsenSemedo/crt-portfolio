"""Render front-view cutouts of Poly Haven trees for the street's impostor atlas.

blender --background --factory-startup --disable-autoexec --python scripts/render-tree-impostors.py -- \
  --gltf /path/to/island_tree_01_1k.gltf --output-dir /tmp/impostors [--nodes a b] [--size 1024]

Each selected root node (or the whole file) is rendered orthographically from glTF +Z
under an even sky, so the cutout holds albedo and soft occlusion but no direction of
light; the scene's own dusk lighting shades the quads. Pack the PNGs with
scripts/pack-tree-atlas.py.
"""
import argparse
from pathlib import Path
import sys

import bpy
from mathutils import Vector

parser = argparse.ArgumentParser()
parser.add_argument('--gltf', type=Path, required=True)
parser.add_argument('--output-dir', type=Path, required=True)
parser.add_argument('--nodes', nargs='*', default=[])
parser.add_argument('--size', type=int, default=1024)
parser.add_argument('--samples', type=int, default=48)
args = parser.parse_args(sys.argv[sys.argv.index('--') + 1:])

bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.gltf(filepath=str(args.gltf))
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.samples = args.samples
scene.cycles.use_denoising = True
scene.cycles.filter_width = 1.0
scene.render.film_transparent = True
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGBA'
scene.view_settings.view_transform = 'Standard'
scene.view_settings.look = 'None'
try:
    prefs = bpy.context.preferences.addons['cycles'].preferences
    for device_type in ('OPTIX', 'CUDA'):
        try:
            prefs.compute_device_type = device_type
            prefs.get_devices()
            if any(d.type == device_type for d in prefs.devices):
                for device in prefs.devices:
                    device.use = device.type == device_type
                scene.cycles.device = 'GPU'
                break
        except TypeError:
            continue
except KeyError:
    pass
print('DEVICE', scene.cycles.device)

world = bpy.data.worlds.new('Even sky')
world.use_nodes = True
world.node_tree.nodes['Background'].inputs['Color'].default_value = (1, 1, 1, 1)
world.node_tree.nodes['Background'].inputs['Strength'].default_value = 1.0
scene.world = world

camera_data = bpy.data.cameras.new('Impostor camera')
camera_data.type = 'ORTHO'
camera = bpy.data.objects.new('Impostor camera', camera_data)
scene.collection.objects.link(camera)
scene.camera = camera
# glTF +Z (the model's front) is Blender -Y, so look along +Y.
camera.rotation_euler = (1.5707963, 0, 0)

roots = [o for o in scene.objects if o.parent is None and o.type in ('MESH', 'EMPTY')]
if args.nodes:
    roots = [o for o in roots if o.name in args.nodes]


def descendants(obj):
    yield obj
    for child in obj.children:
        yield from descendants(child)


args.output_dir.mkdir(parents=True, exist_ok=True)
for root in roots:
    members = set(descendants(root))
    for obj in scene.objects:
        if obj.type == 'MESH':
            obj.hide_render = obj not in members
    points = [obj.matrix_world @ Vector(corner) for obj in members if obj.type == 'MESH' for corner in obj.bound_box]
    lo = Vector((min(p.x for p in points), min(p.y for p in points), min(p.z for p in points)))
    hi = Vector((max(p.x for p in points), max(p.y for p in points), max(p.z for p in points)))
    width, height = hi.x - lo.x, hi.z - lo.z
    side = max(width, height) * 1.04
    camera_data.ortho_scale = side
    camera.location = ((lo.x + hi.x) / 2, lo.y - 50, (lo.z + hi.z) / 2)
    camera_data.clip_end = 200
    scene.render.resolution_x = scene.render.resolution_y = args.size
    name = root.name.replace('_LOD0', '')
    scene.render.filepath = str(args.output_dir / f'{name}.png')
    bpy.ops.render.render(write_still=True)
    # Metres per pixel lets the packer keep every variant at its true relative size.
    print('IMPOSTOR', name, f'{side / args.size:.6f}')
