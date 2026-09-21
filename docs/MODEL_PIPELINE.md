# GLB model pipeline

Phase 6 implementation is in progress. No approved/licensed watch GLB has been supplied. `public/models/watch.json` intentionally contains `{"model": null}`, so the website continues to show the procedural placeholder. Do not mark Phase 6 complete until the actual approved asset is integrated and its integrity checks pass.

## Asset handoff

Provide the watch GLB and evidence of ownership or a license permitting website use and redistribution in this repository. Include required attribution and the source URL or ownership record. A manifest string records that review; it is not evidence of permission by itself. Do not substitute a downloaded model or the generated test fixtures.

Use a self-contained GLB 2.0 with embedded PNG/JPEG textures and an uncompressed mesh. The current limit is 8 MiB. Draco, Meshopt and KTX2/Basis assets are rejected until their decoder dependencies and deployment paths are deliberately configured. External buffer/image URLs are rejected before parsing; the loader allows only its own blob resources. This avoids a silently incomplete model or hidden texture downloads.

## Inventory and configuration

Run `node scripts/inspect-glb.mjs path/to/watch.glb` locally. The read-only report lists byte size, active scene, node indices/names, mesh references, images, buffers and extensions. Inspect the real hierarchy and identify logical components; names in the procedural watch are not assumptions about the GLB.

After approval, place the GLB at `public/models/watch.glb` and replace the null manifest with the actual source, license and mapping:

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

Rotation is an optional XYZ Euler orientation in radians. The loader preserves imported node transforms and hierarchy, resolves the logical map, centers the oriented bounds and scales the longest dimension to 2.8 scene units. These scene units are not product dimensions. There is no exploded-view or animation implementation.

## Runtime and recovery

The existing opt-in scene loads the small manifest, then a configured GLB. Both downloads are bounded (16 KiB manifest, 8 MiB GLB), bypass the HTTP cache for retry, and share an AbortController. The existing 12-second deadline covers module loading, model parsing and the first render. Leaving the route or selecting static view aborts pending requests. A parse that finishes after cancellation is discarded and its loaded resources disposed.

Successful GLB parsing resolves the explicit component map before rendering. Renderer, parser, mapping, resource and network failures use the existing safe error UI, static illustration and retry. **View placeholder watch** offers a separate procedural fallback after failure or while viewing a loaded model. An empty manifest loads the placeholder directly.

Loaded models are passed as Fiber primitives, so explicit cleanup disposes imported geometry, materials, textures and decoded image bitmaps. The procedural model retains Fiber-managed cleanup. The camera, DPR cap, lighting, error boundaries, context-loss recovery and motionless demand rendering remain in place.

## Validation and completion gate

Generated box geometry and a generated single-color PNG exercise the real GLTFLoader in automated tests. These assets are created in test memory and served by Playwright routing; they are not in public and are not product assets. Tests cover embedded textures, explicit mapping with duplicate names, scale normalization, idempotent disposal, missing/malformed files, broken/external textures, byte limits, retry, timeout and route-exit cancellation. Existing scene tests retain responsive, reduced-motion and WebGL coverage.

For the approved watch, verify: licensing/attribution, all mapped components, no missing textures or broken materials, file size, orientation/scale, camera framing at all seven widths, no browser errors, repeated entry/exit and every recovery path. Review actual mobile/GPU behavior as part of later device QA. Until the asset checks are recorded, leave Phase 6 pending and the PR draft.

## Local validation with an existing dev server

If port 3000 already serves this checkout, set `PLAYWRIGHT_BASE_URL=http://localhost:3000` to reuse it. Omit this variable for CI or normal isolated tests on port 43170. Clear it before production tests so they start the production build. `PLAYWRIGHT_CHANNEL=chrome` continues to select locally installed Chrome.
