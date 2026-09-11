"""Create small card thumbnails without loading full resolution on mobile."""
import json, shutil, subprocess
from pathlib import Path
root=Path(__file__).resolve().parents[1]
folder=root/'public/previews/studies'
manifest=json.loads((root/'data/preview-studies.json').read_text())
for id in manifest:
    for side in ('before','after'):
        source=folder/f'{id}-{side}.webp'
        dest=folder/f'{id}-{side}-thumb.webp'
        subprocess.run([shutil.which('ffmpeg') or '/opt/homebrew/bin/ffmpeg','-y','-i',str(source),'-vf','scale=480:270','-quality','82',str(dest)],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
print('Prepared',len(manifest)*2,'card thumbnails')
