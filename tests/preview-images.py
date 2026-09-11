"""Decode shipped assets and guard the actual rack-focus demonstration.

Requires Pillow. Pixel checks complement manual pair inspection; they are
not a claim that arbitrary visual effects or complete briefs are verified.
"""
import json
from pathlib import Path
from PIL import Image, ImageChops, ImageStat, ImageFilter

root=Path(__file__).resolve().parents[1]
manifest=json.loads((root/'data/preview-studies.json').read_text())
folder=root/'public/previews/studies'
for id in manifest:
    pair=[]
    for side in ('before','after'):
        image=Image.open(folder/f'{id}-{side}.webp').convert('RGB')
        assert image.size==(1600,900),id
        thumb=Image.open(folder/f'{id}-{side}-thumb.webp')
        assert thumb.size==(480,270),id
        pair.append(image)
    assert sum(ImageStat.Stat(ImageChops.difference(*pair)).mean)>1.5,('Insufficient change',id)

# Foreground edge must soften while the sculpture's facial detail sharpens.
# These fixed ROIs are specific to this authored reference scene.
edges=[Image.open(folder/f'camera-04-{side}.webp').convert('L').filter(ImageFilter.FIND_EDGES) for side in ('before','after')]
foreground=[ImageStat.Stat(im.crop((130,320,230,780))).mean[0] for im in edges]
subject=[ImageStat.Stat(im.crop((620,250,1050,620))).mean[0] for im in edges]
assert foreground[0]>foreground[1]*1.1,('Foreground did not lose focus',foreground)
assert subject[1]>subject[0]*1.5,('Subject did not gain focus',subject)
print(f'PASS: {len(manifest)*4} decoded full/thumbnail assets; rack-focus clarity reverses between foreground and subject.')
