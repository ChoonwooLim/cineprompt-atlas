# Actual effect comparisons

The previous Workbench clips and 222 schematic animations have been removed. They did not reliably demonstrate the requested optical effects. All 240 original prompt records, IDs, variable substitutions and references are preserved.

## Current coverage

- **33 paired render studies:** 13 camera and 20 lighting entries. Each has a physically rendered reference and changed state, 1600×900 WebP, Cycles 64 samples with denoising and AgX Medium High Contrast.
- Camera IDs: 01, 02, 03, 04, 05, 06, 07, 09, 11, 15, 16, 17, 19. Lighting IDs: 01–20.
- **207 entries do not have an actual render yet.** Their cards and details explicitly say so and show the production brief. No generic diagrams or unrelated clips are presented as effect previews.
- These are controlled technique studies using Blender's Suzanne reference mesh and original procedural test geometry. They are **not full executions of the 240 filmmaking briefs**. Two stills cannot establish animation timing, acting, simulation quality, path safety, or final production readiness.
- `data/preview-studies.json` records actual changes, observation guidance, limitations, resolution and rendering conditions for each entry.
- In four lighting isolation studies, flags/occluders are hidden from direct camera rays while still participating in shadows/reflections. This is disclosed in the individual methodology.

## Interface

- Wipe comparison, side-by-side, reference only and applied only; a labeled native range input supports touch and keyboard.
- Native modal enlargement supports Escape, close button, before/after selection, and links to original images.
- An actual-render-only filter exposes available studies. Empty filtered categories let the user restore production briefs.
- Cards use 480×270 thumbnails with lazy loading, not full-size render pairs. Full-resolution files load only in an opened detail or comparison lab. Only 24 cards are initially mounted.
- No automatic video/animation playback. Pointer hover reveals the applied still; reduced-motion preferences disable the transition.

## Reproduction

Requires Blender 5.2.1 LTS and ffmpeg on PATH. Metal is selected when available; otherwise Cycles uses CPU. The scene is rebuilt independently for each side with deterministic seeds, identical view transform and fixed exposure. Lighting pairs keep camera/materials fixed. Camera studies explicitly vary camera parameters.

```sh
blender -b -t 8 --python scripts/render-effect-studies.py
python3 scripts/prepare-preview-assets.py
```

Existing renders are skipped. To regenerate selected studies:

```sh
blender -b -t 8 --python scripts/render-effect-studies.py -- camera-04 lighting-11 --force
python3 scripts/prepare-preview-assets.py
```

The ignored `previews-work/studies` directory holds full-size PNG intermediates. The checked-in Python recipe is authoritative; rendered .blend scene files are not required by the app.

## Validation and limits

```sh
node tests/preview-catalog.mjs
python3 tests/preview-images.py  # Pillow required
npx tsc --noEmit --incremental false
npm run build:orbitron
```

The catalog test checks preservation of 12×20 records, source references and variables, server-renders every card/detail, verifies comparison controls and scope disclosure, rejects identical pairs, and rejects misleading image substitutes for unavailable entries. Decoded images are checked for dimensions, file integrity, and pair differences. Contact sheets of every pair and enlarged focus/glass/shadow examples are visually inspected; low-contrast or obstructed comparisons are rerendered. These checks do not certify full production briefs.

Browser interaction testing has not been repeated for this revision. Native controls and responsive layout are implemented; actual phone interaction still needs device testing. Deployment includes container health and HTTP verification of the actual new assets.

## Mobile conversation access

The production app URL is the library, not this Codex conversation. Continue this task through ChatGPT mobile Remote after pairing the desktop host in Settings → Connections → Control this Mac. Pairing still requires the user; the computer-use tool cannot operate the Codex app settings. Keep the host app online and awake.
