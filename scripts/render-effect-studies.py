"""Original Cycles reference scene; render paired, controlled effect studies.

Blender -b --python scripts/render-effect-studies.py -- [preset-id ...]
Each pair is independently reconstructed. No generated or stock imagery.
"""
import bpy, math, sys, subprocess, random, shutil
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/previews/studies'
WORK = ROOT / 'previews-work/studies'
OUT.mkdir(parents=True, exist_ok=True)
WORK.mkdir(parents=True, exist_ok=True)

def material(name, color, metallic=0, rough=.35, transmission=0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    p = m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value = (*color, 1)
    p.inputs['Metallic'].default_value = metallic
    p.inputs['Roughness'].default_value = rough
    p.inputs['Transmission Weight'].default_value = transmission
    p.inputs['IOR'].default_value = 1.46
    return m

def finish(o, name, mat, bevel=0):
    o.name = name; o.data.materials.append(mat)
    if bevel:
        b = o.modifiers.new('Machined edge', 'BEVEL'); b.width=bevel; b.segments=3
        o.modifiers.new('Weighted normals', 'WEIGHTED_NORMAL')
    return o

def box(name, loc, scale, mat, bevel=.03):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o=bpy.context.object; o.scale=scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    return finish(o,name,mat,bevel)

def cylinder(name, loc, radius, depth, mat):
    bpy.ops.mesh.primitive_cylinder_add(vertices=96, radius=radius, depth=depth, location=loc)
    o=finish(bpy.context.object,name,mat,.025)
    for p in o.data.polygons:p.use_smooth=True
    return o

def aim(o, target): o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler()

def area(name, loc, energy, color, size, target=(0,0,1.5), size_y=None):
    d=bpy.data.lights.new(name,'AREA');d.energy=energy;d.color=color;d.shape='DISK';d.size=size
    if size_y is not None:d.shape='RECTANGLE';d.size_y=size_y
    o=bpy.data.objects.new(name,d);bpy.context.collection.objects.link(o);o.location=loc;aim(o,target)
    return o

def base():
    bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
    # Clear orphaned scene data between independent renders.
    for group in (bpy.data.materials,bpy.data.meshes,bpy.data.lights,bpy.data.cameras):
        for d in list(group):
            if not d.users:group.remove(d)
    s=bpy.context.scene;s.render.engine='CYCLES';s.cycles.samples=64;s.cycles.use_denoising=True
    s.cycles.seed=17;s.cycles.max_bounces=10;s.cycles.transmission_bounces=8
    s.render.resolution_x=1600;s.render.resolution_y=900;s.render.resolution_percentage=100
    s.render.image_settings.file_format='PNG';s.render.image_settings.color_mode='RGB'
    s.view_settings.view_transform='AgX';s.view_settings.look='AgX - Medium High Contrast'
    s.world.use_nodes=True;s.world.node_tree.nodes.get('Background').inputs[0].default_value=(.14,.18,.24,1)
    s.world.node_tree.nodes.get('Background').inputs[1].default_value=.12
    stone=material('Warm porcelain',(.64,.55,.42),rough=.27)
    dark=material('Charcoal plaster',(.065,.083,.088),rough=.7)
    brass=material('Brushed champagne brass',(.72,.43,.16),.86,.24)
    teal=material('Petrol ceramic',(.025,.18,.19),.18,.24)
    white=material('Warm white',(.8,.77,.69),rough=.58)
    black=material('Black flags',(.004,.006,.008),rough=.75)
    box('Floor',(0,2,-.10),(30,30,.2),dark)
    box('Rear wall',(0,7,3),(24,.2,6),dark)
    # Repeated architectural elements establish depth and perspective.
    for y in (2.8,5.6):
        for x in (-2.8,2.8):box('Architectural pier',(x,y,2),(.3,.4,4),stone)
        box('Lintel',(0,y,4),(5.9,.4,.25),stone)
    for x in range(-12,13):
        box('Fluted backdrop',(x*.36,6.83,2.5),(.035,.09,5),brass,.012)
    cylinder('Hero plinth',(0,0,.43),.7,.86,teal)
    cylinder('Plinth trim',(0,0,.88),.71,.035,brass)
    cylinder('Sculpture support',(0,.14,1.05),.16,.32,brass)
    bpy.ops.mesh.primitive_monkey_add(location=(0,0,1.68))
    hero=bpy.context.object;hero.scale=(.66,.66,.66);hero.rotation_euler.z=.12
    finish(hero,'Porcelain sculpture — lighting reference',stone)
    sub=hero.modifiers.new('Sculpture subdivision','SUBSURF');sub.levels=2;sub.render_levels=2
    for p in hero.data.polygons:p.use_smooth=True
    cylinder('Foreground object',(-1.38,-1.6,.35),.26,.7,brass)
    cylinder('Midground object',(1.45,2.5,.68),.4,1.36,stone)
    cylinder('Background object',(-.9,5,1),.55,2,teal)
    # A restrained plaque adds a fine, physical detail that reveals focus.
    box('Plaque',(0,-.688,.48),(.36,.025,.17),brass,.006)
    bpy.ops.object.text_add(location=(-.13,-.709,.45),rotation=(math.pi/2,0,0))
    label=bpy.context.object;label.data.body='ATLAS';label.data.size=.077;label.data.extrude=.0005;label.data.materials.append(black)
    bpy.ops.object.camera_add(location=(0,-7,2.3));cam=bpy.context.object;cam.data.lens=50;cam.data.sensor_width=36
    aim(cam,(0,0,1.45));s.camera=cam
    key=area('Key',(-3,-4,5),650,(1,.86,.69),4)
    fill=area('Fill',(4,-2,3),200,(.61,.8,1),3)
    rim=area('Rim',(1,4,4),850,(1,.78,.47),3)
    return s,cam,hero,(key,fill,rim),(stone,dark,brass,teal,white,black)

def volume(density=.035):
    m=bpy.data.materials.new('Local atmospheric volume');m.use_nodes=True
    nt=m.node_tree;nt.nodes.clear();out=nt.nodes.new('ShaderNodeOutputMaterial');v=nt.nodes.new('ShaderNodeVolumePrincipled')
    v.inputs['Density'].default_value=density;v.inputs['Anisotropy'].default_value=.3
    nt.links.new(v.outputs['Volume'],out.inputs['Volume'])
    box('Atmosphere',(0,1,2.5),(9,11,5),m,0)

def configure(id, after):
    s,cam,hero,lights,mats=base();key,fill,rim=lights;stone,dark,brass,teal,white,black=mats
    n=int(id.split('-')[1]);t=int(after)
    if id.startswith('camera'):
        if n==1:cam.location.y=-7+1.5*t
        elif n==2:
            cam.data.lens=24;cam.location.x=-1.8+3.6*t
            box('Foreground occluder',(-1.4,-3,2),(.8,.6,4),stone)
        elif n==3:
            # Optical axis stays horizontal: image-plane subject size is constant.
            cam.location=(0,-5-5*t,1.6);cam.data.lens=35+35*t
        elif n==4:
            cam.location=(0,-5,2.3);cam.data.lens=35
            bpy.data.objects['Foreground object'].location=(-.55,-3,1.8)
            cylinder('Foreground support',(-.55,-3,.725),.18,1.45,dark)
            cam.data.dof.use_dof=True;cam.data.dof.aperture_fstop=.7
            bpy.ops.object.empty_add(location=(0,0,1.68) if after else (-.55,-3,1.8))
            cam.data.dof.focus_object=bpy.context.object
        elif n==5:
            a=math.radians(-60+120*t);cam.location=(7*math.sin(a),-7*math.cos(a),2.4)
        elif n==6:cam.data.lens=24+61*t
        elif n==7:cam.location=(0,-.01,9) if not after else (0,-7,1.7);cam.data.lens=40
        elif n==9:
            cam.location=(0,-5-10*t,1.6);cam.data.lens=35+70*t
        elif n==11:cam.location.z=2.3-1.85*t;cam.data.lens=40
        elif n==15:pass
        elif n==16:cam.location.x=-1.5+3*t;cam.data.lens=35
        elif n==17:cam.data.lens=35+45*t
        elif n==19:cam.data.lens=35
        target=(0,0,1.5) if n==4 else ((cam.location.x,0,1.45) if n==16 else ((-2+4*t,0,1.45) if n==19 else (0,0,1.6 if n in (3,9) else 1.45)))
        aim(cam,target)
        if n==15:cam.rotation_euler.rotate_axis('Z',math.radians(20*t))
    elif id.startswith('lighting'):
        # Both sides have the same scene, camera, view transform and exposure.
        cam.location=(0,-6.5,2.25);cam.data.lens=50;aim(cam,(0,0,1.5))
        if n in (11,12):
            hero.hide_render=True
            bpy.data.objects['Sculpture support'].hide_render=True
            glass=material('Optical glass',(.94,.98,1),rough=.025,transmission=1)
            bottle=cylinder('Glass vessel',(0,0,1.525),.44,1.25,glass if n==11 else brass)
            if n==11:
                # Hollow glass: model a wall, not a solid opaque approximation.
                bpy.ops.mesh.primitive_cylinder_add(vertices=96,radius=.395,depth=1.3,location=(0,0,1.625))
                cutter=bpy.context.object;mod=bottle.modifiers.new('Hollow interior','BOOLEAN');mod.operation='DIFFERENCE';mod.object=cutter
                bpy.context.view_layer.objects.active=bottle;bpy.ops.object.modifier_apply(modifier=mod.name);bpy.data.objects.remove(cutter,do_unlink=True)
                cylinder('Glass base',(0,0,.935),.395,.06,glass)
        if n==1:
            fill.data.energy=60
            if after:key.location=(-4,0,4);aim(key,(0,0,1.5));key.data.size=2;key.data.size_y=3;key.data.shape='RECTANGLE';rim.data.energy=0
        elif n==2:
            if after:fill.data.color=(.04,.3,1);fill.data.energy=650;rim.data.color=(1,.015,.19);rim.data.energy=1100;key.data.color=(1,.95,.9);key.data.energy=350
        elif n==3:
            if after:
                fill.data.energy=0;rim.data.energy=0;key.location=(-3,-2,4);key.data.size=.12;key.data.energy=750;aim(key,(0,0,1.5))
                for j in range(10):box('Blind slat',(-1.3,-.9,.6+j*.28),(1.25,.05,.12),black,0).visible_camera=False
        elif n==4:
            if after:key.data.size=5;key.data.energy=1000;fill.data.size=5;fill.data.energy=850;rim.data.energy=1400;s.world.node_tree.nodes.get('Background').inputs[1].default_value=.5
        elif n==5:
            if after:key.data.energy=60;fill.data.energy=80;rim.location=(1.5,4,2.3);rim.data.size=.2;rim.data.energy=1500;rim.data.color=(1,.49,.15);aim(rim,(0,0,1.3))
        elif n==6:
            key.data.energy=80;fill.data.energy=30;rim.data.energy=0
            beam=area('Window beam',(-3,3.5,4),2500,(.68,.8,1),.3,target=(1,-2,0))
            for j in range(3):box('Window mullion',(-2.4+j*.4,2.8,3.4),(.06,.08,1.3),black,0)
            if after:volume(.045)
        elif n==7:
            key.data.energy=0;fill.data.energy=20;rim.data.energy=50
            cylinder('Candle wax',(-.6,-.6,.94),.08,.32,white)
            candle=area('Candle motivated key',(-.6,-.6,1.16),2 if not after else 38,(1,.32,.07),.08)
        elif n==8:
            key.data.energy=0;fill.data.energy=10;rim.data.energy=0
            area('Door light',(-3,1,2),1200,(1,.72,.42),1.5,target=(0,0,.5),size_y=3)
            door=box('Door leaf',(-1.6,.3,1.5),(.12,2.6,3),black)
            door.visible_camera=False
            if after:door.rotation_euler.z=math.radians(75)
        elif n==9:
            key.data.color=(1,.48,.19);key.data.energy=400;rim.data.color=(.12,.32,1);rim.data.energy=1100
            fill.data.energy=0 if not after else 220;fill.data.color=(.28,.48,1)
        elif n==10:
            key.data.energy=70;fill.data.energy=20;rim.data.energy=1600;rim.data.size=.3
            if after:
                random.seed(22)
                for i in range(180):
                    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1,radius=random.uniform(.006,.014),location=(random.uniform(-1.5,1.5),random.uniform(.3,3),random.uniform(.5,3)))
                    finish(bpy.context.object,'Backlit dust proxy',white)
        elif n==11:
            key.data.energy=200;fill.data.energy=200;rim.data.energy=0
            cam.location=(0,-4,2.1);cam.data.lens=50;aim(cam,(0,0,1.5))
            area('Bright glass background',(0,1.8,4),400,(1,1,1),3,target=(0,3,1.5))
            box('White glass backdrop',(0,3,2),(6,.1,4),white)
            if after:
                for x in (-.58,.58):box('Black edge reflection flag',(x,-.2,1.6),(.16,1.5,1.7),black,0).visible_camera=False
        elif n==12:
            key.data.energy=0;fill.data.energy=0;rim.data.energy=200
            area('Reflection strip',(-2+4*t,-2,2.5),700,(1,.9,.74),.4,target=(0,0,1.6),size_y=3)
        elif n==13:
            key.data.energy=650*t;fill.data.energy=0;rim.data.energy=1400
            s.world.node_tree.nodes.get('Background').inputs[1].default_value=.015
        elif n==14:
            key.data.energy=0;fill.data.energy=0;rim.data.energy=50
            area('Television key',(0,-2,1.3),80 if not after else 240,(.08,.26,1) if not after else (1,.35,.1),1.5)
        elif n==15:
            key.location=(-3,-2,5);aim(key,(0,0,1));key.data.size=.03;fill.data.energy=70;rim.data.energy=0
            if after:
                random.seed(35)
                center=Vector((-1.5,-1,3.34));q=(key.location-center).to_track_quat('Z','Y')
                for i in range(18):
                    position=center+q@Vector(((i%6-2.5)*.18+random.uniform(-.03,.03),(i//6-1)*.3+random.uniform(-.04,.04),0))
                    bpy.ops.mesh.primitive_uv_sphere_add(segments=12,ring_count=8,radius=1,location=position)
                    o=finish(bpy.context.object,'Leaf shadow proxy',black);o.scale=(.10,.045,.006);o.rotation_euler=q.to_euler();o.rotation_euler.rotate_axis('Z',random.random()*6);o.visible_camera=False
        elif n==16:
            if after:
                rim.data.color=(.2,.65,1);rim.data.energy=1000
                area('Background zone',(0,5,3.5),900,(1,.36,.09),2,target=(0,6.8,2))
        elif n==17:
            key.location=(0,0,4);key.data.size=1.2;aim(key,(0,0,0));key.data.energy=600;rim.data.energy=0
            fill.location=(0,-3,2);aim(fill,(0,0,1.7));fill.data.energy=180*t
        elif n==18:
            # Actual refractive droplets on a pane between camera and sculpture.
            glass=material('Window glass',(.97,.99,1),rough=.03,transmission=1)
            key.location=(-4,-1,5);aim(key,(0,0,1.5))
            rim.location=(-4,4,5);aim(rim,(0,0,1.5))
            box('Window pane',(0,-5.1,2),(3,.008,3),glass,0)
            if after:
                random.seed(8)
                for i in range(140):
                    bpy.ops.mesh.primitive_uv_sphere_add(segments=12,ring_count=8,radius=random.uniform(.006,.015),location=(random.uniform(-.65,.65),-5.11,random.uniform(1.4,2.7)))
                    o=finish(bpy.context.object,'Refractive droplet',glass);o.scale=(1,.5,1.5)
                    for p in o.data.polygons:p.use_smooth=True
        elif n==19:
            hero.location.x=-.85
            second=hero.copy();second.data=hero.data.copy();bpy.context.collection.objects.link(second);second.location.x=.85
            for name in ('Hero plinth','Plinth trim','Sculpture support','Plaque'):
                obj=bpy.data.objects[name];other=obj.copy();other.data=obj.data.copy();bpy.context.collection.objects.link(other);obj.location.x-=.85;other.location.x+=.85
            for obj in bpy.data.objects:
                if obj.type=='FONT':obj.hide_render=True
            fill.data.energy=0;rim.data.energy=0;key.data.size=3;key.location=(-3 if after else 0,-2,4);aim(key,(0,0,1.5))
        elif n==20:
            if after:key.data.energy=140;key.data.color=(1,.42,.12);fill.data.energy=70;fill.data.color=(.1,.3,1);rim.data.energy=500;rim.data.color=(.07,.22,1);s.world.node_tree.nodes.get('Background').inputs[1].default_value=.02
    return s

CAMERAS=(1,2,3,4,5,6,7,9,11,15,16,17,19)
ids=['camera-%02d'%n for n in CAMERAS]+['lighting-%02d'%n for n in range(1,21)]
args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
selected=[a for a in args if a!='--force']
if selected:ids=[i for i in ids if i in selected]
p=bpy.context.preferences.addons['cycles'].preferences
try:
    p.compute_device_type='METAL';p.get_devices()
    for d in p.devices:d.use=d.type=='METAL'
    bpy.context.scene.cycles.device='GPU'
except Exception:pass
for id in ids:
    for after in (False,True):
        name=id+('-after' if after else '-before')
        if (OUT/(name+'.webp')).exists() and '--force' not in args:continue
        s=configure(id,after);s.render.filepath=str(WORK/(name+'.png'))
        bpy.ops.render.render(write_still=True)
        subprocess.run([shutil.which('ffmpeg') or '/opt/homebrew/bin/ffmpeg','-y','-i',s.render.filepath,'-quality','88',str(OUT/(name+'.webp'))],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
        print('FINISHED',name,flush=True)
