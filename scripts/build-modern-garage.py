"""Build the fitted residential garage GLB with Blender (see asset sourcing docs).

blender --background --factory-startup --disable-autoexec --python \
  scripts/build-modern-garage.py -- --textures /path/to/textures --output /tmp/garage.glb
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
source = (Path(__file__).resolve().parents[1] / 'src/three/assets/garageBounds.ts').read_text()
bounds = dict((key, float(value)) for key, value in re.findall(r'(\w+): (-?[\d.]+)', source.split('export function')[0]))
FLOOR, CEILING = bounds['floorY'], bounds['ceilingY']
WIDTH, BACK, FRONT = bounds['halfWidth'], bounds['doorwayZ'], bounds['frontZ']
DEPTH, CENTER = FRONT - BACK, (FRONT + BACK) / 2
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)


def material(name, color, roughness, metallic=0):
    result = bpy.data.materials.new(name)
    result.use_nodes = True
    shader = result.node_tree.nodes.get('Principled BSDF')
    shader.inputs['Base Color'].default_value = (*color, 1)
    shader.inputs['Roughness'].default_value = roughness
    shader.inputs['Metallic'].default_value = metallic
    return result


plaster = material('Painted plaster - Poly Haven', (.7, .7, .68), .82)
nodes, links = plaster.node_tree.nodes, plaster.node_tree.links
shader = nodes.get('Principled BSDF')
for kind, socket in [('diff', 'Base Color'), ('rough', 'Roughness'), ('nor_gl', 'Normal')]:
    texture = nodes.new('ShaderNodeTexImage')
    texture.image = bpy.data.images.load(str(args.textures / f'plaster-{kind}.jpg'))
    if kind != 'diff':
        texture.image.colorspace_settings.name = 'Non-Color'
    if kind == 'nor_gl':
        normal = nodes.new('ShaderNodeNormalMap')
        normal.inputs['Strength'].default_value = .22
        links.new(texture.outputs['Color'], normal.inputs['Color'])
        links.new(normal.outputs['Normal'], shader.inputs[socket])
    else:
        links.new(texture.outputs['Color'], shader.inputs[socket])
white = material('Satin white panels and trim', (.72, .73, .70), .55)
ceiling = material('Finished white ceiling', (.70, .71, .68), .88)
gray = material('Gray wall base and cabinets', (.19, .22, .23), .64)
metal = material('Galvanized door hardware', (.38, .41, .43), .33, .8)
floor = material('Sealed gray concrete', (.24, .26, .27), .53)


def box(name, size, center, mat, bevel=.008):
    # Model in world Y-up coordinates, then map to Blender's Z-up convention.
    bpy.ops.mesh.primitive_cube_add(size=1, location=(center[0], -center[2], center[1]))
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = (size[0], size[2], size[1])
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.data.materials.append(mat)
    # Wall plaster repeats at the source's physical two-meter scale on each face.
    if mat == plaster:
        for polygon in obj.data.polygons:
            axes = sorted(range(3), key=lambda axis: abs(polygon.normal[axis]))[:2]
            for loop_index in polygon.loop_indices:
                vertex = obj.data.vertices[obj.data.loops[loop_index].vertex_index].co
                obj.data.uv_layers.active.data[loop_index].uv = (vertex[axes[0]] / 2, vertex[axes[1]] / 2)
    if bevel:
        modifier = obj.modifiers.new('Manufactured edge radius', 'BEVEL')
        modifier.width, modifier.segments = bevel, 2
        bpy.ops.object.modifier_apply(modifier=modifier.name)
    return obj


def tube(name, points, radius, mat):
    curve = bpy.data.curves.new(name, 'CURVE')
    curve.dimensions = '3D'
    curve.resolution_u = 1
    curve.bevel_depth, curve.bevel_resolution = radius, 1
    spline = curve.splines.new('POLY')
    spline.points.add(len(points) - 1)
    for point, (x, y, z) in zip(spline.points, points):
        point.co = (x, -z, y, 1)
    obj = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(mat)
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.convert(target='MESH')
    obj.select_set(False)


height = CEILING - FLOOR
for side in [-1, 1]:
    x = side * (WIDTH + .09)
    box('Finished garage wall', (.18, height, DEPTH), (x, FLOOR + height / 2, CENTER), plaster)
    box('Washable lower wall', (.028, .62, DEPTH), (side * (WIDTH - .014), FLOOR + .31, CENTER), gray)
    box('White baseboard', (.045, .11, DEPTH), (side * (WIDTH - .025), FLOOR + .055, CENTER), white)
    box('Ceiling edge trim', (.065, .08, DEPTH), (side * (WIDTH - .035), CEILING - .04, CENTER), white)
box('Finished flat ceiling', (2 * WIDTH + .36, .16, DEPTH), (0, CEILING + .08, CENTER), ceiling)
box('Sealed floor', (2 * WIDTH, .10, DEPTH), (0, FLOOR - .05, CENTER), floor)
# Expansion joints are shallow seams, with no distressed floor texture.
for z in [-.2, 3.2, 6.6]:
    box('Floor expansion joint', (2 * WIDTH, .001, .009), (0, FLOOR + .0005, z), gray, 0)
box('Door lintel', (2 * WIDTH + .2, .28, .26), (0, CEILING - .14, BACK), white)
for side in [-1, 1]:
    box('Door jamb', (.16, height, .24), (side * (WIDTH - .08), FLOOR + height / 2, BACK), white)
# Raised door occupies exactly the collision envelope used by the basketball.
y = bounds['raisedDoorY']
span = bounds['raisedDoorFrontZ'] - (BACK + .095)
for i in range(7):
    length = span / 7
    z = BACK + .095 + length * (i + .5)
    box('Insulated door section', (2 * bounds['raisedDoorHalfWidth'], .075, length - .009), (0, y + .0375, z), white)
    for dz in [-length * .32, length * .32]:
        box('Panel stiffening rib', (8.6, .013, .014), (0, y + .0065, z + dz), white, .003)
    if i < 6:
        for x in [-4.22, -1.42, 1.42, 4.22]:
            box('Section hinge plate', (.075, .011, .12), (x, y + .0055, z + length / 2), metal, .002)
for side in [-1, 1]:
    x = side * 4.52
    # Curved rails join the vertical jamb tracks to the overhead return.
    points = [(x, FLOOR + .1, BACK + .15), (x, y - .35, BACK + .15)]
    for step in range(9):
        angle = math.pi - (math.pi / 2) * step / 8
        points.append((x, y - .35 + .4 * math.sin(angle), BACK + .55 + .4 * math.cos(angle)))
    points.append((x, y + .05, bounds['raisedDoorFrontZ'] + .25))
    tube('Curved steel door rail', points, .026, metal)
    for z in [-2.8, .7]:
        box('Track ceiling hanger', (.05, CEILING - y - .04, .05), (x, (CEILING + y + .04) / 2, z), metal, .004)
# Compact overhead motor above the raised door and its collision plane.
box('Door opener rail', (.07, .065, 4.2), (0, CEILING - .13, -1.25), metal)
box('Door opener housing', (.34, .15, .46), (0, CEILING - .17, .72), gray, .035)
# Finished storage on the side walls gives the room a residential scale.
for z in [-1.8, -.8]:
    box('Wall cabinet body', (.36, 1.2, .92), (-WIDTH + .2, 1.35, z), gray, .015)
    box('Cabinet door', (.025, 1.15, .87), (-WIDTH + .395, 1.35, z), white, .009)
    box('Cabinet pull', (.035, .20, .025), (-WIDTH + .425, 1.25, z + .29), metal, .008)
# Under-ceiling fixtures use emissive surfaces without extra runtime light passes.
lamp = material('Warm white LED diffuser', (.8, .83, .78), .4)
shader = lamp.node_tree.nodes.get('Principled BSDF')
shader.inputs['Emission Color'].default_value = (1, .86, .68, 1)
shader.inputs['Emission Strength'].default_value = 1.8
for x in [-2.9, 2.9]:
    box('Flush ceiling light housing', (.19, .012, 1.8), (x, CEILING - .004, 3.3), metal, .004)
    box('Flush ceiling light diffuser', (.15, .005, 1.73), (x, CEILING - .009, 3.3), lamp, .002)
bpy.ops.object.select_all(action='SELECT')
args.output.parent.mkdir(parents=True, exist_ok=True)
bpy.ops.export_scene.gltf(filepath=str(args.output), export_format='GLB', use_selection=True,
                          export_animations=False, export_cameras=False, export_lights=False,
                          export_image_format='JPEG', export_jpeg_quality=86)
print('EXPORTED', args.output)
