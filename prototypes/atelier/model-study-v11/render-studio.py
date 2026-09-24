import bpy, math, sys
from pathlib import Path
from mathutils import Vector
p=Path(__file__).resolve().parent
args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
final='--final' in args
view=next((a.split('=',1)[1] for a in args if a.startswith('--view=')),'hero')
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(p/'aurel-veil.glb'))
roots=[o for o in bpy.context.scene.objects if o.parent is None]
rig=bpy.data.objects.new('Presentation rig',None);bpy.context.collection.objects.link(rig)
for o in roots:o.parent=rig
rig.scale=(100,100,100)
scene=bpy.context.scene
scene.frame_set(0)
scene.render.engine='CYCLES'
scene.cycles.samples=128 if final else 24
scene.cycles.use_adaptive_sampling=True
scene.cycles.adaptive_threshold=.018 if final else .08
scene.cycles.use_denoising=True
scene.cycles.max_bounces=12
scene.cycles.transmission_bounces=10
scene.render.resolution_x=1400 if final else 760
scene.render.resolution_y=1600 if final else 870
scene.render.resolution_percentage=100
scene.render.image_settings.file_format='JPEG';scene.render.image_settings.quality=95
scene.view_settings.view_transform='AgX';scene.view_settings.look='AgX - Medium High Contrast'
scene.view_settings.exposure=.35
world=bpy.data.worlds.new('Photographic studio environment');world.use_nodes=True;scene.world=world
n=world.node_tree.nodes;l=world.node_tree.links;n.clear()
out=n.new('ShaderNodeOutputWorld');env=n.new('ShaderNodeTexEnvironment')
env.image=bpy.data.images.load(str(p/'studio-small-09.hdr'))
tex=n.new('ShaderNodeTexCoord');mapping=n.new('ShaderNodeMapping')
mapping.inputs['Rotation'].default_value[2]=float(next((a.split('=',1)[1] for a in args if a.startswith('--angle=')),'1.2'))
l.new(tex.outputs['Generated'],mapping.inputs['Vector']);l.new(mapping.outputs[0],env.inputs[0])
bg=n.new('ShaderNodeBackground');bg.inputs['Strength'].default_value=.55;l.new(env.outputs['Color'],bg.inputs['Color'])
black=n.new('ShaderNodeBackground');black.inputs['Color'].default_value=(.001,.0012,.0015,1);black.inputs['Strength'].default_value=1
rays=n.new('ShaderNodeLightPath');mix=n.new('ShaderNodeMixShader')
l.new(rays.outputs['Is Camera Ray'],mix.inputs[0]);l.new(bg.outputs[0],mix.inputs[1]);l.new(black.outputs[0],mix.inputs[2]);l.new(mix.outputs[0],out.inputs['Surface'])
def aim(o,v):o.rotation_euler=(Vector(v)-o.location).to_track_quat('-Z','Y').to_euler()
def area(name,loc,energy,size,target):
 d=bpy.data.lights.new(name,'AREA');d.energy=energy;d.shape='DISK';d.size=size
 o=bpy.data.objects.new(name,d);bpy.context.collection.objects.link(o);o.location=loc;aim(o,target)
area('Feathered upper key',(-5,-6,8),55,7,(0,0,0))
area('Dial silk fill',(-3,-12,3),35,8,(0,0,0))
# Narrow reflection strip describes the case curvature without washing out the dial.
strip_data=bpy.data.lights.new('Case edge strip','AREA');strip_data.energy=25;strip_data.shape='RECTANGLE';strip_data.size=.8;strip_data.size_y=6
strip=bpy.data.objects.new('Case edge strip',strip_data);bpy.context.collection.objects.link(strip);strip.location=(6,-3,5);aim(strip,(0,0,0))

# A feathered diffusion screen produces a continuous highlight instead of a hard white patch.
bpy.ops.mesh.primitive_plane_add(size=2,location=(-7,-14,-5))
screen=bpy.context.object;screen.name='Feathered silk';screen.scale=(7,7,7);aim(screen,(0,0,0));screen.visible_camera=False
mat=bpy.data.materials.new('Graduated silk emission');mat.use_nodes=True
sn=mat.node_tree.nodes;sl=mat.node_tree.links;sn.clear()
uv=sn.new('ShaderNodeTexCoord');sub=sn.new('ShaderNodeVectorMath');sub.operation='SUBTRACT';sub.inputs[1].default_value=(.5,.5,0)
sl.new(uv.outputs['UV'],sub.inputs[0]);dot=sn.new('ShaderNodeVectorMath');dot.operation='DOT_PRODUCT'
sl.new(sub.outputs[0],dot.inputs[0]);sl.new(sub.outputs[0],dot.inputs[1])
mul=sn.new('ShaderNodeMath');mul.operation='MULTIPLY';mul.inputs[1].default_value=-18;sl.new(dot.outputs['Value'],mul.inputs[0])
exp=sn.new('ShaderNodeMath');exp.operation='EXPONENT';sl.new(mul.outputs[0],exp.inputs[0])
em=sn.new('ShaderNodeEmission');em.inputs['Strength'].default_value=.5
transparent=sn.new('ShaderNodeBsdfTransparent');sm=sn.new('ShaderNodeMixShader')
sl.new(exp.outputs[0],sm.inputs[0]);sl.new(transparent.outputs[0],sm.inputs[1]);sl.new(em.outputs[0],sm.inputs[2])
mo=sn.new('ShaderNodeOutputMaterial');sl.new(sm.outputs[0],mo.inputs['Surface']);screen.data.materials.append(mat)

camera_data=bpy.data.cameras.new('Product camera');camera=bpy.data.objects.new('Product camera',camera_data);bpy.context.collection.objects.link(camera);scene.camera=camera
camera_data.lens=85
if view=='beauty':
 camera.location=(4.5,-24,9);aim(camera,(0,.6,0));camera_data.lens=84
 scene.render.resolution_x=1800 if final else 1050
 scene.render.resolution_y=1350 if final else 788
elif view=='dial':
 camera.location=(2,-12,3.5);aim(camera,(0,0,0));camera_data.lens=85
 scene.render.resolution_x=1600 if final else 870
 scene.render.resolution_y=1400 if final else 760
elif view=='bracelet':
 camera.location=(8,-3,8);aim(camera,(0,2.4,1));camera_data.lens=65
 scene.render.resolution_x=1600 if final else 870
 scene.render.resolution_y=1400 if final else 760
else:
 camera.location=(8,-25,4.5);aim(camera,(0,1.2,0));camera_data.lens=100
camera.rotation_euler.rotate_axis('Z',-.10)
camera_data.dof.use_dof=False
if view=='beauty':
 camera.rotation_euler.rotate_axis('Z',-.32)
 focus=bpy.data.objects.new('Dial focus',None);bpy.context.collection.objects.link(focus);focus.location=(0,0,0)
 camera_data.dof.use_dof=False;camera_data.dof.focus_object=focus;camera_data.dof.aperture_fstop=5.6;camera_data.dof.aperture_blades=9
 scene.view_settings.exposure=.10
scene.render.filepath=str(p/(view+('-final' if final else '-draft')+'.jpg'))
if '--no-glass' in args:
 for o in scene.objects:
  if o.type=='MESH' and any('Optical crystal' in m.name for m in o.data.materials):o.hide_render=True
 scene.render.filepath=str(p/'diagnostic-no-glass.jpg')
bpy.ops.file.pack_all()
bpy.ops.wm.save_as_mainfile(filepath=str(p/('aurel-veil-'+view+'-studio.blend')))
bpy.ops.render.render(write_still=True)
print('RENDER_COMPLETE',scene.render.filepath)
