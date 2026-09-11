# Preview workbench

All 240 prompt records retain their IDs, text, variables, and source links. The old category sprite thumbnails have been replaced by a mixture of original Blender camera studies and interactive explanatory diagrams.

- 18 camera entries have original Workbench video/poster pairs (camera-04 rack focus and camera-18 mirror reflection use diagrams because Workbench does not demonstrate those optical effects).
- A separate three-video common-scene study compares dolly, zoom, and dolly zoom. These are technique demonstrations, not claims that each entire Korean production brief has been executed.
- The other 222 entries use category-specific vector diagrams, semantic operation labels, and the original production-direction sentences. They simplify a technique and do not simulate all scene details or measure physical/rendering correctness.
- Cards play on pointer hover only when reduced motion is off. On touch devices, opening a card exposes video controls or a labeled play/pause button, keyboard/touch timeline, and three direction steps. Rendered video steps seek within the media after metadata loads.
- Only 24 cards render initially, with more on demand. Videos use preload=none and JPEG posters; no video is fetched for an inactive card. Media fits the existing static nginx deployment (21 clips total, about 5 MB).
- Mobile detail panels use the full viewport width. Favorites remain device-local.

## Reproduction

Blender 5.2.1 LTS, Workbench, 800×450, 96 frames at 24fps. Original geometry; no external assets.

    blender -b -t 4 --python scripts/render-camera-lab.py
    blender -b -t 4 --python scripts/render-camera-lab.py -- --catalog
    python3 scripts/encode-previews.py

The ignored previews-work directory holds source frame sequences and representative .blend scene snapshots. The Python script is the authoritative animation recipe; scene snapshots preserve only the final pose, not a baked animation.

## Verification

    node tests/preview-catalog.mjs
    npx tsc --noEmit --incremental false
    npm run build:orbitron

The catalog check renders every diagram at both endpoints, checks 12×20 IDs, variable keys, source IDs, and linked video/poster existence. It does not certify the artistic or physical accuracy of diagrams.

Browser checks: search/filter counts; open a video example and a diagram; play/pause; keyboard End on the timeline; variable substitution and clipboard; common-scene comparison tabs; narrow viewport without overflow. Confirm HTTP byte-range responses for MP4 in the deployed nginx container.

## Mobile conversation access

This app URL provides the library, not this Codex conversation. Continue the conversation through ChatGPT mobile Remote after pairing the desktop host in Settings → Connections → Control this Mac. This must be completed by the user; the computer-use tool cannot operate the Codex app's settings. Keep the host app online and awake.
