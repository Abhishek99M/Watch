from pathlib import Path
import json,hashlib,urllib.request,struct
p=Path('prototypes/atelier/model-study-v11');glb=p/'aurel-veil.glb';b=glb.read_bytes();n=struct.unpack_from('<I',b,12)[0];j=json.loads(b[20:20+n]);report={'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest(),'animations':[a['name'] for a in j.get('animations',[])],'renders':{},'links':{}}
assert report['animations']==['Seconds_Sweep_60s']
for name in ['beauty','bracelet','dial']:
 f=p/(name+'-final.jpg');report['renders'][name]=f.exists() and f.stat().st_mtime>=glb.stat().st_mtime;assert report['renders'][name]
for name in ['index.html','comparison.html','aurel-veil.glb','beauty-final.jpg','bracelet-final.jpg','dial-final.jpg']:
 with urllib.request.urlopen('http://127.0.0.1:43180/model-study-v11/'+name,timeout=20) as r:report['links'][name]=r.status;assert r.status==200
(p/'delivery-validation.json').write_text(json.dumps(report,indent=2));print(json.dumps(report))
