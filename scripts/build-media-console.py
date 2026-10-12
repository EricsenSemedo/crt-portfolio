"""Build the mid-century walnut media console GLB with Blender.

blender --background --factory-startup --disable-autoexec --python \
  scripts/build-media-console.py -- --textures /path/to/walnut_veneer --output /tmp/console.glb

Dimensions come from TABLE_LAYOUT in src/three/assets/createTable.ts, so the TVs,
PS2 and basketball colliders line up without runtime stretching.
"""
import argparse
import math
from pathlib import Path
import re
import sys

import bpy

parser = argparse.ArgumentParser()
parser.add_argument('--textures', type=Path, required=True)
parser.add_argument('--output', type=Path, required=True)
args = parser.parse_args(sys.argv[sys.argv.index('--') + 1:])
source = (Path(__file__).resolve().parents[1] / 'src/three/assets/createTable.ts').read_text()
layout = dict((k, float(v)) for k, v in re.findall(r'(\w+): (-?[\d.]+)', source.split('export const TABLE_LAYOUT')[1].split('};')[0]))
W, D, H = layout['halfWidth'] * 2, layout['halfDepth'] * 2, layout['topY'] - layout['floorY']
TOP, LEG = layout['topThickness'], layout['legHeight']
INSET = layout['caseInset']
# The room's props are ~3x life size, so the veneer repeats at that scale too.
GRAIN = 4.8
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)


def material(name, color, roughness, metallic=0.0, veneer=False):
    result = bpy.data.materials.new(name)
    result.use_nodes = True
    nodes, links = result.node_tree.nodes, result.node_tree.links
    shader = nodes.get('Principled BSDF')
    shader.inputs['Base Color'].default_value = (*color, 1)
    shader.inputs['Roughness'].default_value = roughness
    shader.inputs['Metallic'].default_value = metallic
    if veneer:
        # A multiply tint darkens the light veneer scan into oiled walnut.
        tint = nodes.new('ShaderNodeMix')
        tint.data_type, tint.blend_type = 'RGBA', 'MULTIPLY'
        tint.inputs['Factor'].default_value = 1
        tint.inputs['B'].default_value = (*color, 1)
        for kind in ['diff', 'rough', 'nor_gl']:
            texture = nodes.new('ShaderNodeTexImage')
            texture.image = bpy.data.images.load(str(args.textures / f'walnut_veneer_{kind}_1k.jpg'), check_existing=True)
            if kind == 'diff':
                links.new(texture.outputs['Color'], tint.inputs['A'])
                links.new(tint.outputs['Result'], shader.inputs['Base Color'])
                continue
            texture.image.colorspace_settings.name = 'Non-Color'
            if kind == 'rough':
                links.new(texture.outputs['Color'], shader.inputs['Roughness'])
            else:
                normal = nodes.new('ShaderNodeNormalMap')
                normal.inputs['Strength'].default_value = .6
                links.new(texture.outputs['Color'], normal.inputs['Color'])
                links.new(normal.outputs['Normal'], shader.inputs['Normal'])
    return result


walnut = material('Oiled walnut', (.58, .37, .22), .55, veneer=True)
slat_wood = material('Dark walnut slats', (.36, .22, .13), .6, veneer=True)
interior = material('Shadowed cabinet interior', (.035, .025, .02), .9)
brass = material('Brushed brass', (.78, .58, .3), .32, 1)
tape = material('Black VHS sleeve', (.018, .018, .02), .45)
labels = [material(f'VHS label {i}', color, .7) for i, color in
          enumerate([(.45, .42, .36), (.33, .12, .08), (.1, .17, .27), (.42, .3, .1)])]


def uv_project(obj, grain_axis):
    # Planar UVs per face at GRAIN scale; the veneer's streaks follow grain_axis (0=x, 1=y, 2=z).
    uv = obj.data.uv_layers.get('UVMap') or obj.data.uv_layers.new(name='UVMap')
    for polygon in obj.data.polygons:
        axes = sorted(range(3), key=lambda axis: abs(polygon.normal[axis]))[:2]
        if grain_axis in axes:
            axes = [a for a in axes if a != grain_axis] + [grain_axis]
        for loop_index in polygon.loop_indices:
            co = obj.data.vertices[obj.data.loops[loop_index].vertex_index].co
            uv.data[loop_index].uv = (co[axes[0]] / GRAIN + .37, co[axes[1]] / GRAIN + .11)


def finish(obj, mat, bevel, grain_axis):
    obj.data.materials.append(mat)
    if mat in (walnut, slat_wood):
        uv_project(obj, grain_axis)
    if bevel:
        modifier = obj.modifiers.new('Rounded edge', 'BEVEL')
        modifier.width, modifier.segments = bevel, 2
        modifier.limit_method = 'ANGLE'
        bpy.context.view_layer.objects.active = obj
        bpy.ops.object.modifier_apply(modifier=modifier.name)
    return obj


def box(name, size, center, mat, bevel=.01, grain_axis=0):
    # Model in Y-up coordinates with +Z toward the viewer, then map to Blender's Z-up.
    bpy.ops.mesh.primitive_cube_add(size=1, location=(center[0], -center[2], center[1]))
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = (size[0], size[2], size[1])
    bpy.ops.object.transform_apply(location=True, rotation=False, scale=True)
    # Blender's Y axis is world -Z; grain axes are given in world terms.
    return finish(obj, mat, bevel, {0: 0, 1: 2, 2: 1}[grain_axis])


def leg(x, z, splay_x, splay_z):
    # Tapered round leg, splayed outward like a mid-century console.
    bpy.ops.mesh.primitive_cone_add(vertices=20, radius1=.04, radius2=.08, depth=LEG + .02,
                                    location=(0, 0, 0))
    obj = bpy.context.object
    obj.name = 'Tapered walnut leg'
    obj.rotation_euler = (-splay_z, -splay_x, 0)
    obj.location = (x + math.sin(splay_x) * LEG / 2, -(z + math.sin(splay_z) * LEG / 2), LEG / 2)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    finish(obj, walnut, 0, 2)
    bpy.ops.mesh.primitive_cylinder_add(vertices=20, radius=.044, depth=.05,
                                        location=(x + math.sin(splay_x) * LEG, -(z + math.sin(splay_z) * LEG), .025))
    bpy.context.object.name = 'Brass leg ferrule'
    bpy.context.object.rotation_euler = (-splay_z, -splay_x, 0)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    finish(bpy.context.object, brass, 0, 1)


# Top slab with a small overhang over the case.
box('Walnut top', (W, TOP, D), (0, H - TOP / 2, 0), walnut, .018, 0)
case_w, case_d = W - 2 * INSET, D - 2 * INSET
case_h = H - TOP - LEG
case_y = LEG + case_h / 2
front = case_d / 2
for x in [-1, 1]:
    for z in [-1, 1]:
        leg(x * (W / 2 - .42), z * (D / 2 - .34), x * .14, z * .1)

# Front: slatted door | open tape bay | three drawers | slatted door, split by stiles.
stile = .05
bay_h = case_h - .08
inner_w = case_w - 5 * stile
door_w, mid_w = inner_w * .29, inner_w * .21
x = -case_w / 2 + stile
bays = []
for width in [door_w, mid_w, mid_w, door_w]:
    bays.append((x, x + width))
    x += width + stile
for left, right in bays[:1] + bays[3:]:
    center = (left + right) / 2
    box('Slatted door frame', (right - left - .012, bay_h, .03), (center, case_y, front + .012), walnut, .006, 1)
    count = 15
    pitch = (right - left - .09) / count
    for i in range(count):
        sx = left + .045 + pitch * (i + .5)
        box('Door slat', (pitch * .62, bay_h - .09, .035), (sx, case_y, front + .04), slat_wood, .006, 1)
    pull_x = right - .07 if left < 0 else left + .07
    box('Brass door pull', (.022, .16, .03), (pull_x, case_y + .05, front + .07), brass, .006)
# The case is a rear block plus a front block that leaves the tape bay open.
bay_depth = .56
box('Walnut case', (case_w, case_h, case_d - bay_depth), (0, case_y, (front - bay_depth - case_d / 2) / 2), walnut, .008, 0)
left, right = bays[1]
for x0, x1 in [(-case_w / 2, left), (right, case_w / 2)]:
    box('Walnut case front', (x1 - x0, case_h, bay_depth), ((x0 + x1) / 2, case_y, front - bay_depth / 2), walnut, .008, 0)
for y in [case_y - case_h / 2 + .02, case_y + case_h / 2 - .02]:
    box('Open bay rail', (right - left + .02, .04, bay_depth), ((left + right) / 2, y, front - bay_depth / 2), walnut, .006, 0)
center = (left + right) / 2
box('Open bay shadow', (right - left, bay_h, .02), (center, case_y, front - .55), interior, 0)
for side in [left, right]:
    box('Open bay side', (.012, bay_h, .55), (side + (.006 if side == left else -.006), case_y, front - .27), interior, 0)
box('Open bay floor', (right - left, .012, .55), (center, case_y - bay_h / 2 + .006, front - .27), walnut, 0, 0)
box('Open bay ceiling', (right - left, .012, .55), (center, case_y + bay_h / 2 - .006, front - .27), interior, 0)
# VHS tapes standing in the open bay, a few with colored spine labels.
tape_w, tape_h = .082, .56
for i in range(int((right - left - .08) / (tape_w + .006))):
    tx = left + .04 + i * (tape_w + .006) + tape_w / 2
    if i in (6, 7):
        continue  # A gap where a couple of tapes are out.
    ty = case_y - bay_h / 2 + .012 + tape_h / 2
    box('VHS tape', (tape_w, tape_h, .32), (tx, ty, front - .2), tape, .004)
    box('VHS spine label', (tape_w * .72, tape_h * .7, .004), (tx, ty, front - .038), labels[i % len(labels)], 0)
left, right = bays[2]
center = (left + right) / 2
drawer_h = (bay_h - .024) / 3
for i in range(3):
    dy = case_y + bay_h / 2 - drawer_h / 2 - i * (drawer_h + .012)
    box('Drawer front', (right - left - .012, drawer_h, .035), (center, dy, front + .014), walnut, .008, 0)
    box('Brass drawer pull', (.26, .022, .03), (center, dy + drawer_h * .18, front + .045), brass, .006)
box('Base reveal', (case_w - .04, .02, case_d - .04), (0, LEG + .01, 0), interior, 0)

bpy.ops.object.select_all(action='SELECT')
bpy.context.view_layer.objects.active = bpy.context.selected_objects[0]
bpy.ops.object.join()
args.output.parent.mkdir(parents=True, exist_ok=True)
bpy.ops.export_scene.gltf(filepath=str(args.output), export_format='GLB', use_selection=True,
                          export_animations=False, export_cameras=False, export_lights=False,
                          export_image_format='JPEG', export_jpeg_quality=90)
print('EXPORTED', args.output)
