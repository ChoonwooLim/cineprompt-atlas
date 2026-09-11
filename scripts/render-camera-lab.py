"""Render an original, reproducible camera comparison in Blender. No external assets."""
import bpy, math, sys
from pathlib import Path
from mathutils import Vector
root=Path(__file__).resolve().parents[1]
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
s=bpy.context.scene
s.render.engine='BLENDER_WORKBENCH'
s.render.resolution_x=800;s.render.resolution_y=450;s.render.resolution_percentage=100
s.render.image_settings.file_format='PNG';s.render.fps=24
s.display.shading.light='STUDIO';s.display.shading.studiolight_rotate_z=0.5
s.display.shading.color_type='MATERIAL';s.display.shading.show_shadows=True
s.display.shading.show_cavity=True;s.display.shading.cavity_type='BOTH'
s.display.shading.background_type='WORLD';s.world.color=(.018,.024,.035)
s.display.shading.show_specular_highlight=True
s.view_settings.view_transform='Standard'
def mat(name,col):
 m=bpy.data.materials.new(name);m.diffuse_color=(*col,1);return m
blue=mat('Deep petrol',(.055,.25,.30));gold=mat('Signal gold',(.85,.64,.17));dark=mat('Graphite',(.075,.095,.13));white=mat('Porcelain',(.65,.72,.76))
def cube(name,loc,scale,material,bevel=.08):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.name=name;o.scale=scale;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(material)
 if bevel: mod=o.modifiers.new('Soft edges','BEVEL');mod.width=bevel;mod.segments=3;o.modifiers.new('Normals','WEIGHTED_NORMAL')
 return o
cube('Stage',(0,3,-.2),(20,24,.4),dark)
for y in (2,5,8):
 for x in (-3,3):cube('Depth marker',(x,y,1.8),(.3,.5,3.6),blue)
 cube('Cross beam',(0,y,3.5),(6.3,.5,.25),blue)
for x in range(-8,9):cube('Grid X',(x,3,.015),(.012,22,.01),white,0)
for y in range(-6,15):cube('Grid Y',(0,y,.016),(18,.012,.01),white,0)
cube('Pedestal',(0,0,.4),(1.5,1.3,.8),blue)
bpy.ops.mesh.primitive_uv_sphere_add(segments=40,ring_count=24,radius=.65,location=(0,0,1.5));bpy.context.object.data.materials.append(gold);bpy.ops.object.shade_smooth()
cube('Background object',(-1.4,4,.7),(.8,.8,1.4),white)
bpy.ops.object.camera_add();cam=bpy.context.object;s.camera=cam;cam.data.sensor_width=36
modes = ('dolly','zoom','dolly-zoom') if '--catalog' not in sys.argv else tuple('camera-%02d'%i for i in range(1,21) if i not in (4,18))
for mode in modes:
 out=root/'previews-work'/mode;out.mkdir(parents=True,exist_ok=True)
 for f in range(96):
  t=f/95;t=t*t*(3-2*t)
  distance=8-3*t if mode!='zoom' else 8
  target=Vector((0,0,1.5));position=Vector((0,-distance,2.2));lens=50*(distance/8) if mode=='dolly-zoom' else (50+30*t if mode=='zoom' else 50);roll=0
  if mode.startswith('camera-'):
   n=int(mode.split('-')[1]);position=Vector((0,-8,2.2));lens=50
   if n==1:position.y=-8+3*t
   elif n==2:position.x=-3+6*t;lens=24
   elif n in (3,9):position.y=-8+3*t;lens=50*(-position.y/8)
   elif n==5:angle=math.radians(-60+120*t);position=Vector((8*math.sin(angle),-8*math.cos(angle),2.8))
   elif n==6:lens=[24,35,50,85][min(3,int(t*4))]
   elif n==7:position=Vector((0,-.3-5*t,9-6.8*t))
   elif n==8:position=Vector((0,-8+5*t,2.2));lens=24
   elif n==10:target=Vector((-2+4*t,2,1.5));lens=35
   elif n==11:position.z=[.35,1.5,3][min(2,int(t*3))]
   elif n==12:position.z=2+8*t;lens=24
   elif n==13:position.x=-2+4*t;target=Vector((-1.4*t,4*t,1.5-.8*t))
   elif n==14:target=Vector((math.tan(math.radians(-35+70*t))*8,0,1.5));lens=35
   elif n==15:roll=math.radians(20*t)
   elif n==16:position.x=-3+6*t;target.x=position.x;lens=35
   elif n==17:lens=35+45*t
   elif n==19:target=Vector((math.tan(math.radians(-30+60*t))*8,0,1.5));lens=24
   elif n==20:position=Vector((-2+4*t,-8+3*t,2.2+math.sin(t*math.pi)))
  cam.location=position
  cam.rotation_euler=(target-cam.location).to_track_quat('-Z','Y').to_euler();cam.rotation_euler.rotate_axis('Z',roll)
  cam.data.lens=lens
  s.render.filepath=str(out/f'{f:04}.png');bpy.ops.render.render(write_still=True)
 bpy.ops.wm.save_as_mainfile(filepath=str(out/'scene.blend'))
 print('FINISHED',mode,flush=True)
