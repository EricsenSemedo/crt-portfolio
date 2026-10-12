"""Build the colonial house seen across the street, as a GLB, with Blender.

blender --background --factory-startup --disable-autoexec --python scripts/build-street-house.py -- \
  --textures /path/to/textures --output /tmp/street-house.glb

--textures holds Poly Haven 1K JPGs: white_planks_clean_{diff,nor_gl}_1k.jpg,
grey_roof_01_{diff,nor_gl}_1k.jpg and red_brick_03_{diff,nor_gl}_1k.jpg.
Origin: front wall centre at ground level, +Z toward the street, Y up. Two windows and
the porch lantern are emissive, so the house reads as lived-in without extra lights.
"""
import argparse
import math
from pathlib import Path
import sys

import bmesh
import bpy

parser = argparse.ArgumentParser()
parser.add_argument('--textures', type=Path, required=True)
parser.add_argument('--output', type=Path, required=True)
args = parser.parse_args(sys.argv[sys.argv.index('--') + 1:])
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

WIDTH, DEPTH, WALL = 10.5, 6.0, 5.0         # Two-storey main block.
PITCH, EAVE = math.radians(36), .35
WING_W, WING_WALL = 4.2, 2.8               # One-storey garage wing on the left.


def material(name, color, roughness, metallic=0.0, textures=None, normal=.7, emission=0.0):
    result = bpy.data.materials.new(name)
    result.use_nodes = True
    nodes, links = result.node_tree.nodes, result.node_tree.links
    shader = nodes.get('Principled BSDF')
    shader.inputs['Base Color'].default_value = (*color, 1)
    shader.inputs['Roughness'].default_value = roughness
    shader.inputs['Metallic'].default_value = metallic
    if emission:
        shader.inputs['Emission Color'].default_value = (*color, 1)
        shader.inputs['Emission Strength'].default_value = emission
    if textures:
        tint = nodes.new('ShaderNodeMix')
        tint.data_type, tint.blend_type = 'RGBA', 'MULTIPLY'
        tint.inputs['Factor'].default_value = 1
        tint.inputs['B'].default_value = (*color, 1)
        # Distant surfaces keep colour and relief; a constant roughness is enough.
        for kind in ['diff', 'nor_gl']:
            texture = nodes.new('ShaderNodeTexImage')
            texture.image = bpy.data.images.load(str(args.textures / f'{textures}_{kind}_1k.jpg'), check_existing=True)
            if kind == 'diff':
                links.new(texture.outputs['Color'], tint.inputs['A'])
                links.new(tint.outputs['Result'], shader.inputs['Base Color'])
                continue
            texture.image.colorspace_settings.name = 'Non-Color'
            node = nodes.new('ShaderNodeNormalMap')
            node.inputs['Strength'].default_value = normal
            links.new(texture.outputs['Color'], node.inputs['Color'])
            links.new(node.outputs['Normal'], shader.inputs['Normal'])
    return result


siding = material('Painted lap siding', (.78, .8, .8), .7, textures='white_planks_clean', normal=1.2)
roof = material('Asphalt shingles', (.62, .6, .58), .85, textures='grey_roof_01', normal=1.0)
brick = material('Chimney brick', (.85, .8, .78), .85, textures='red_brick_03')
trim = material('White trim', (.78, .77, .73), .5)
shutter = material('Black-green shutters', (.04, .06, .05), .6)
door = material('Front door', (.22, .04, .04), .4)
glass = material('Dark window glass', (.02, .025, .03), .12, .4)
lamp_glow = material('Warm lamplit window', (1, .5, .2), .5, emission=1.5)
lantern = material('Porch lantern', (1, .62, .3), .4, emission=4)
concrete = material('Foundation concrete', (.42, .41, .39), .9)
garage_door = material('Painted garage door', (.7, .69, .65), .6)
TILE = {siding: 2.4, roof: 4.0, brick: 1.4}


def project_uvs(obj, mat):
    tile = TILE.get(mat)
    if not tile:
        return
    uv = obj.data.uv_layers.get('UVMap') or obj.data.uv_layers.new(name='UVMap')
    for polygon in obj.data.polygons:
        n = polygon.normal
        for loop_index in polygon.loop_indices:
            co = obj.data.vertices[obj.data.loops[loop_index].vertex_index].co
            # Blender is Z-up here; world X = co.x, world Y = co.z, world Z = -co.y.
            if mat == siding:
                # Rotate the vertical board scan so the boards run horizontally.
                along = co.x if abs(n.y) > abs(n.x) else co.y
                uv.data[loop_index].uv = (co.z / tile, along / tile)
            elif abs(n.z) > max(abs(n.x), abs(n.y)):
                uv.data[loop_index].uv = (co.x / tile, co.y / tile)
            elif abs(n.y) > abs(n.x):
                uv.data[loop_index].uv = (co.x / tile, co.z / tile)
            else:
                uv.data[loop_index].uv = (co.y / tile, co.z / tile)


def place(obj, name, mat):
    obj.name = name
    obj.data.materials.append(mat)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    project_uvs(obj, mat)
    return obj


def box(name, size, center, mat, rotation=(0, 0, 0)):
    # Y-up/Z-toward-street coordinates mapped to Blender's Z-up.
    bpy.ops.mesh.primitive_cube_add(size=1, location=(center[0], -center[2], center[1]))
    obj = bpy.context.object
    obj.dimensions = (size[0], size[2], size[1])
    obj.rotation_euler = rotation
    return place(obj, name, mat)


def prism(name, points, x0, x1, mat):
    # Extrude a polygon given in (z, y) along X; used for gable ends and roofs.
    mesh = bpy.data.meshes.new(name)
    bm = bmesh.new()
    left = [bm.verts.new((x0, -z, y)) for z, y in points]
    right = [bm.verts.new((x1, -z, y)) for z, y in points]
    bm.faces.new(left[::-1])
    bm.faces.new(right)
    for i in range(len(points)):
        j = (i + 1) % len(points)
        bm.faces.new((left[i], left[j], right[j], right[i]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    return place(obj, name, mat)


def gable_roof(name, x0, x1, front, back, wall, thickness=.14):
    # Two sloped slabs with eave and rake overhangs, ridge parallel to X.
    half = (front - back) / 2
    ridge_z = (front + back) / 2
    top = wall + (half + EAVE) * math.tan(PITCH)
    drop = thickness / math.cos(PITCH)
    for side in [1, -1]:
        eave_z = ridge_z + side * (half + EAVE)
        section = [(eave_z, wall), (ridge_z, top), (ridge_z, top + drop), (eave_z, wall + drop)]
        prism(name, section if side > 0 else section[::-1], x0 - EAVE, x1 + EAVE, roof)
    # Gable ends follow the roof's underside; soffits and fascia close the eaves.
    lift = EAVE * math.tan(PITCH)
    for x in [x0, x1]:
        prism('Gable end', [(front, wall), (front, wall + lift), (ridge_z, top - .01),
                            (back, wall + lift), (back, wall)][::-1], x - .01, x + .01, siding)
    for z, sign in [(front, 1), (back, -1)]:
        box('Soffit', (x1 - x0 + 2 * EAVE, .04, EAVE), ((x0 + x1) / 2, wall - .02, z + sign * EAVE / 2), trim)
        box('Fascia board', (x1 - x0 + 2 * EAVE, .22, .05), ((x0 + x1) / 2, wall - .02, z + sign * EAVE), trim)
    return top


def window(x, sill, height, width=.95, lit=False, shutters=True):
    y = sill + height / 2
    box('Window casing', (width + .22, height + .22, .08), (x, y, .04), trim)
    box('Window glass', (width, height, .02), (x, y, .085), lamp_glow if lit else glass)
    for i in [-1, 1]:
        box('Muntin', (.035, height, .03), (x + i * width / 6, y, .1), trim)
    box('Muntin', (width, .035, .03), (x, y, .1), trim)
    box('Window sill', (width + .36, .06, .16), (x, sill - .1, .1), trim)
    if shutters:
        for side in [-1, 1]:
            box('Shutter', (width * .42, height + .1, .04), (x + side * (width * .71 + .08), y, .06), shutter)


# Main two-storey block, foundation and corner boards.
box('House walls', (WIDTH, WALL, DEPTH), (0, WALL / 2, -DEPTH / 2), siding)
box('Foundation', (WIDTH + .08, .4, DEPTH + .08), (0, .15, -DEPTH / 2), concrete)
for x in [-WIDTH / 2, WIDTH / 2]:
    box('Corner board', (.16, WALL, .16), (x, WALL / 2, -.02), trim)
    box('Corner board', (.16, WALL, .16), (x, WALL / 2, -DEPTH + .02), trim)
box('Frieze board', (WIDTH + .04, .28, .1), (0, WALL - .14, .02), trim)
gable_roof('Main roof', -WIDTH / 2, WIDTH / 2, 0, -DEPTH, WALL)

# Five-bay colonial front: four windows and the door below, five above.
bays = [-4, -2, 0, 2, 4]
for i, x in enumerate(bays):
    window(x, 3.15, 1.3, lit=i in (1, 3))
    if x:
        window(x, .95, 1.55, lit=i == 1)
box('Door surround', (1.5, 2.55, .1), (0, 1.48, .05), trim)
box('Front door', (1.0, 2.15, .08), (0, 1.38, .1), door)
box('Fanlight', (1.0, .28, .03), (0, 2.66, .1), lamp_glow)
for i in [-1, 1]:
    box('Portico column', (.16, 2.7, .16), (i * .9, 1.55, 1.2), trim)
box('Portico beam', (2.1, .22, 1.35), (0, 2.95, .62), trim)
prism('Portico roof', [(1.35, 3.06), (0, 3.06), (.68, 3.6)], -1.12, 1.12, roof)
box('Front step', (2.0, .2, 1.4), (0, .1, .7), concrete)
box('Porch lantern', (.18, .3, .14), (-.82, 2.1, .12), lantern)

# Exterior brick chimney on the right gable.
box('Chimney', (.9, WALL + 3.4, 1.2), (WIDTH / 2 + .45, (WALL + 3.4) / 2, -DEPTH / 2), brick)
box('Chimney cap', (1.05, .12, 1.35), (WIDTH / 2 + .45, WALL + 3.46, -DEPTH / 2), concrete)

# One-storey garage wing, set back a little from the main facade.
wx0, wx1 = -WIDTH / 2 - WING_W, -WIDTH / 2
box('Garage wing walls', (WING_W, WING_WALL, DEPTH - .6), ((wx0 + wx1) / 2, WING_WALL / 2, -.6 - (DEPTH - .6) / 2), siding)
box('Garage wing foundation', (WING_W + .06, .4, DEPTH - .54), ((wx0 + wx1) / 2, .15, -.6 - (DEPTH - .6) / 2), concrete)
box('Corner board', (.16, WING_WALL, .16), (wx0, WING_WALL / 2, -.62), trim)
gable_roof('Garage roof', wx0, wx1 + .2, -.6, -DEPTH, WING_WALL)
box('Garage door casing', (3.3, 2.3, .06), ((wx0 + wx1) / 2, 1.15, -.57), trim)
box('Garage door', (3.1, 2.15, .06), ((wx0 + wx1) / 2, 1.08, -.55), garage_door)
for i in range(1, 4):
    box('Garage door groove', (3.1, .025, .03), ((wx0 + wx1) / 2, i * .54, -.51), shutter)
box('Garage light', (.14, .22, .1), (wx1 - .25, 2.3, -.55), lantern)

bpy.ops.object.select_all(action='SELECT')
bpy.context.view_layer.objects.active = bpy.context.selected_objects[0]
bpy.ops.object.join()
args.output.parent.mkdir(parents=True, exist_ok=True)
bpy.ops.export_scene.gltf(filepath=str(args.output), export_format='GLB', use_selection=True,
                          export_animations=False, export_cameras=False, export_lights=False,
                          export_image_format='JPEG', export_jpeg_quality=90)
print('EXPORTED', args.output)
