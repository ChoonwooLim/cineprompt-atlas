"""Encode original Blender frame sequences for portable browser playback."""
from pathlib import Path
import subprocess
ROOT=Path(__file__).resolve().parents[1]
for folder in sorted((ROOT/'previews-work').iterdir()):
    if not folder.is_dir() or not (folder/'0095.png').exists():
        continue
    output=ROOT/'public/previews/lab'/folder.name
    subprocess.run(['ffmpeg','-y','-loglevel','error','-framerate','24','-i',str(folder/'%04d.png'),'-c:v','libx264','-crf','22','-pix_fmt','yuv420p','-movflags','+faststart',str(output.with_suffix('.mp4'))],check=True)
    subprocess.run(['ffmpeg','-y','-loglevel','error','-i',str(folder/'0048.png'),'-frames:v','1',str(output.with_suffix('.jpg'))],check=True)
