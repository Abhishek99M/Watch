# GLB model pipeline

Phase 6 is complete. The user selected the original Aurel Veil V11 for integration on 2026-09-24. `public/models/watch.json` now maps the actual optimized asset. The master remains at `prototypes/atelier/model-study-v11/aurel-veil.glb`; public asset credits are in `public/ASSET-CREDITS.md`.

## Selected asset and reproducible build

Run `node scripts/prepare-watch.mjs` from the repository root. This verifies the master SHA-256 before producing the web derivative and regenerating its node-index manifest. The report is `docs/WATCH_ASSET_VALIDATION.json`.

- Master: 13,618,624 bytes; web: 8,274,880 bytes (7.89 MiB), approximately 39% smaller.
- All 291,094 triangles, 43 component groups and original group transforms are retained; no decimation.
- Weld/dedup, 16-bit quantization and lossless PNG re-encoding reduce storage. Maximum world-space vertex displacement is approximately 0.61 micrometres in the model's authored scale. This is a numerical optimization tolerance, not a physical manufacturing claim.
- Texture dimensions and decoded pixels are unchanged. PNG palette encoding is accepted only after exact pixel comparison.
- Embedded `Seconds_Sweep_60s` animation and its target/pivot survive export. The website remains still; the retained review viewer has manual Play/Pause. Runtime animation and cinematic scrolling remain later phases.
- KHR_mesh_quantization is handled natively by the installed GLTFLoader; no external decoder or runtime dependency was added. glTF Transform and Sharp are development-only build tools.
- V1-V10 are archived intact at `prototypes/atelier/archive/2026-09-24/`, with inventory and restore instructions. V11 vendors its own loader/exporter/controls and retains the shared `atelier/assets/vendor` module. Archive assets are not website dependencies.


## Asset handoff

Provide the watch GLB and evidence of ownership or a license permitting website use and redistribution in this repository. Include required attribution and the source URL or ownership record. A manifest string records that review; it is not evidence of permission by itself. Do not substitute a downloaded model or the generated test fixtures.

Use a self-contained GLB 2.0 with embedded PNG/JPEG textures and mesh data requiring no external decoder. The current limit is 8 MiB. Draco, Meshopt and KTX2/Basis assets are rejected until their decoder dependencies and deployment paths are deliberately configured. External buffer/image URLs are rejected before parsing; the loader allows only its own blob resources. This avoids a silently incomplete model or hidden texture downloads.

## Inventory and configuration

Run `node scripts/inspect-glb.mjs path/to/watch.glb` locally. The read-only report lists byte size, active scene, node indices/names, mesh references, images, buffers and extensions. Inspect the real hierarchy and identify logical components; names in the procedural watch are not assumptions about the GLB.

For a future replacement, after approval place the GLB at `public/models/watch.glb` and replace the existing manifest with the actual source, license and mapping:

```json
{
  "model": {
    "url": "/models/watch.glb",
    "source": "Approved source or ownership record",
    "license": "Approved license and attribution reference",
    "components": { "Case": [0], "Dial": [1] },
    "rotation": [0, 0, 0]
  }
}
```

The indices above are illustrative only. Each index refers to the original GLB `nodes` array, not a guessed name or child position. At least Case and Dial must be explicitly mapped. Optional roles: Bezel, Crystal, HourHand, MinuteHand, SecondHand, Crown, Movement, Rotor, Gears, Caseback and Strap. Each role can map multiple nodes. Missing, non-mesh, inactive-scene, duplicate or overlapping ancestor/descendant mappings fail visibly. If the actual model is a single fused mesh, obtain a suitable separated asset rather than inventing a component mapping.

Rotation is an optional XYZ Euler orientation in radians. The loader preserves imported node transforms and hierarchy, resolves the logical map, centers the oriented bounds and scales the longest dimension to 2.8 scene units. These scene units are not product dimensions. The website has no exploded-view or playback implementation yet; asset data is preserved for those phases.

## Runtime and recovery

The existing opt-in scene loads the small manifest, then a configured GLB. Downloads are bounded (16 KiB manifest, 8 MiB GLB, plus a 2 MiB cap for the local studio HDR), bypass the HTTP cache for retry, and share an AbortController. The existing 12-second deadline covers module loading, model parsing and the first render. Leaving the route or selecting static view aborts pending requests. A parse that finishes after cancellation is discarded and its loaded resources disposed.

Successful GLB parsing resolves the explicit component map before rendering. Renderer, parser, mapping, resource and network failures use the existing safe error UI, selected-watch studio poster and retry. **View placeholder watch** offers a separate procedural fallback after failure or while viewing a loaded model. An empty manifest loads the placeholder directly.

Loaded models are passed as Fiber primitives, so explicit cleanup disposes imported geometry, materials, textures and decoded image bitmaps. The procedural model retains Fiber-managed cleanup. The configured model uses a local CC0 studio environment with area-light fill, a dark background and full-resolution crystal transmission. Environment textures and PMREM targets are explicitly disposed. The V11 profile uses a 1.5-2 pixel ratio and 1.25 transmission resolution, matching its source viewer. Other model fixtures and the placeholder retain the 1.5 DPR cap. Rendering remains demand-driven, with no automatic rotation. Error boundaries and context-loss recovery remain in place. Canvas CSS and backing-buffer dimensions are synchronized on resize.

## Validation and completion gate

Generated box geometry and a generated single-color PNG exercise the real GLTFLoader in automated tests. These assets are created in test memory and served by Playwright routing; they are not in public and are not product assets. Tests cover embedded textures, explicit mapping with duplicate names, scale normalization, idempotent disposal, missing/malformed files, broken/external textures, byte limits, retry, timeout and route-exit cancellation. Existing scene tests retain responsive, reduced-motion and WebGL coverage.

For the approved watch, verify: licensing/attribution, all mapped components, no missing textures or broken materials, file size, orientation/scale, camera framing at all seven widths, no browser errors, repeated entry/exit and every recovery path. Review actual mobile/GPU behavior as part of later device QA. The selected V11 asset checks are recorded in TEST_PLAN.md and WATCH_ASSET_VALIDATION.json. Repeat these gates for any replacement asset.

## Local validation with an existing dev server

If port 3000 already serves this checkout, set `PLAYWRIGHT_BASE_URL=http://localhost:3000` to reuse it. Omit this variable for CI or normal isolated tests on port 43170. Clear it before production tests so they start the production build. `PLAYWRIGHT_CHANNEL=chrome` continues to select locally installed Chrome.

## Final verification, 2026-09-24
Repository integrity, lint, strict types, production build and dependency audit pass. All 62 production browser tests pass in Chrome/SwiftShader. Actual-asset checks cover seven widths, reopening, context-loss recovery, route exit and failed-environment fallback. Desktop and phone captures were reviewed. The source viewer second-hand playback check also passes. Physical-device performance remains a later QA gate. Phase 7 begins the website exploded-view architecture.

## V11 visual parity and interaction correction
The original integration passed functional tests but did not preserve V11 presentation quality. It used a different camera/light rig, lower resolution and no orbit controls. The correction uses the explicit `presentation: "aurel-veil-v11"` manifest profile and zero added model rotation. `prepareWatch` exposes the source-to-normalized-scene matrix; `watch-studio.ts` transforms V11 camera/target/light positions with that matrix, scales area dimensions and shadow distances, and scales point-light intensity by the square of the scene scale. This retains the original physical lighting relationships.

The profile matches V11's 28-degree camera, ACES exposure 1, HDR intensity/rotation, shadow spotlight and area lights. It restores anisotropic texture filtering, 1.5-2 DPR and 1.25-resolution glass transmission. Supported `PCFShadowMap` replaces the removed PCFSoft option; V11 itself falls back to PCF in Three r186. Camera framing resets on container resize, as in the reference viewer.

Drag rotates; wheel/pinch and visible buttons zoom; arrows rotate; +/- zoom; Home and Reset view restore the starting camera. There is no automatic motion or damping loop, including under reduced motion. Controls, listeners and shadow resources are disposed on exit. Existing second-hand data remains embedded but website playback and scrolling are separate phases.

`node scripts/compare-watch-rendering.mjs` compares the actual source master, optimized GLB and website at identical 550x500 render dimensions. Run both existing local servers first; optional WATCH_PREVIEW_URL selects another website URL. Captures and measured differences are in `docs/watch-validation/`. The comparison also verifies mouse drag, touch pinch, keyboard rotation, zoom and exact image restoration after Reset. These image checks are distinct from functional Playwright tests.

Warnings: Fiber 9.7 still constructs Three.Clock; the inspected 9.8 minor release also does so, and the unsuccessful upgrade was reverted. No console filtering or dependency patch was introduced. The user-reported PMREM X4122 warning is a driver shader-precision warning; it was not reproduced on SwiftShader and remains a hardware-driver follow-up. Neither warning is presented as fixed. Physical-device performance still requires testing at the higher quality settings.

Final checks after the parity correction: lint, strict types and production build passed; 62/62 production browser tests passed. Controlled comparison and mouse/touch/keyboard/zoom/reset checks passed separately. See TEST_PLAN.md and watch-validation/README.md.


## Rendering warning correction - 2026-09-24

Supersedes the earlier remaining-warning notes: the website now uses a
version-checked, install-time Timer compatibility adapter for Fiber 9.7.0 and an
analytic simplification of Three r186 PMREM sampling. Diagnostics remain enabled.
On Intel Iris Xe / ANGLE Direct3D11, the unmodified V11 viewer reproduced the exact
X4122 warning; the patched production website emitted neither X4122 nor Clock
warnings. The controlled reference/website mean RGB difference was 0.0175 on a
0-255 channel scale; drag, pinch, keyboard, zoom and exact reset passed.
See [Rendering compatibility](RENDERING_COMPATIBILITY.md) for causes, maintenance,
tests and the development-server restart requirement. This does not alter the
GLB or advance the project beyond Phase 6.


## Published source boundary

The GitHub change includes the approved V11 master, standalone viewer and source
scripts, the optimized website asset, required vendor licenses, and validation
captures. Historical V1-V10 studies and Blender binaries/scenes remain local and
ignored; they are not required by the website or derivative build. See the V11
README for rebuild and review commands. CI checks the Timer adapter and rebuilds
the web derivative, rejecting differences in the committed asset/manifest/report.
