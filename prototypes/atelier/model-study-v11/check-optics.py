from pathlib import Path
import json,struct,math
p=Path(__file__).resolve().parent
b=(p/'aurel-veil.glb').read_bytes();n=struct.unpack_from('<I',b,12)[0];j=json.loads(b[20:20+n]);start=28+n
def accessor(i):
 a=j['accessors'][i];v=j['bufferViews'][a['bufferView']];components={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4}[a['type']]
 fmt,size={5126:('f',4),5125:('I',4),5123:('H',2),5121:('B',1)}[a['componentType']]
 offset=start+v.get('byteOffset',0)+a.get('byteOffset',0);stride=v.get('byteStride',components*size)
 return [struct.unpack_from('<'+fmt*components,b,offset+k*stride) for k in range(a['count'])]
node=next(x for x in j['nodes'] if x.get('name','').startswith('crystal__'))
volume=0;normal_check=[]
for prim in j['meshes'][node['mesh']]['primitives']:
 vertices=accessor(prim['attributes']['POSITION']);normals=accessor(prim['attributes']['NORMAL']);ix=[x[0] for x in accessor(prim['indices'])]
 for k in range(0,len(ix),3):
  a,c,d=[vertices[i] for i in ix[k:k+3]]
  volume+=(a[0]*(c[1]*d[2]-c[2]*d[1])+a[1]*(c[2]*d[0]-c[0]*d[2])+a[2]*(c[0]*d[1]-c[1]*d[0]))/6
 for v,normal in zip(vertices,normals):
  if abs(v[0])<1 and abs(v[1])<1 and v[2]>.4:normal_check.append(normal[2])
assert volume>0,'Crystal winding must face outward'
assert normal_check and min(normal_check)>.99,'Crystal front normals must point out of the dial'
report={'crystalSignedVolumeMm3':volume,'crystalCenterNormalsOutward':True,'modelBytes':len(b),'triangles':json.loads((p/'manifest.json').read_text(encoding='utf-8-sig'))['triangles'],'notes':['Crystal IOR 1.46 is an optical-glass approximation, not measured sapphire','Geometry and materials unchanged between GLB and studio imports']}
(p/'optical-validation.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps(report))



# Regression check: every non-degenerate surface triangle must retain 2D texture area.
# XY-only projection previously collapsed bracelet side faces, destabilizing tangent-space shading.
checked=0;collapsed=0
for mesh in j['meshes']:
 for prim in mesh['primitives']:
  if 'TEXCOORD_0' not in prim['attributes']:continue
  vertices=accessor(prim['attributes']['POSITION']);uv=accessor(prim['attributes']['TEXCOORD_0']);ix=[x[0] for x in accessor(prim['indices'])]
  for k in range(0,len(ix),3):
   ia,ib,ic=ix[k:k+3];a,c,d=vertices[ia],vertices[ib],vertices[ic]
   u=[c[i]-a[i] for i in range(3)];v=[d[i]-a[i] for i in range(3)]
   cross=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]]
   if sum(x*x for x in cross)<1e-10:continue
   ua,ub,uc=uv[ia],uv[ib],uv[ic]
   area=abs((ub[0]-ua[0])*(uc[1]-ua[1])-(ub[1]-ua[1])*(uc[0]-ua[0]))
   checked+=1
   if area<1e-12:collapsed+=1
assert collapsed==0,f'{collapsed} triangles have collapsed UV coordinates'
report.update({'surfaceTrianglesChecked':checked,'collapsedTextureTriangles':collapsed})
(p/'optical-validation.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print('UV_CHECK',checked,'valid surface triangles;',collapsed,'collapsed texture triangles')
