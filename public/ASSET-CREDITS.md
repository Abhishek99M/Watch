# Watch asset provenance

- `models/aurel-veil.glb`: web derivative of the project's original authored V11 procedural geometry, lettering and generated material maps. Selected by the user for integration on 2026-09-24. Source and full-quality master: `prototypes/atelier/model-study-v11/`. No third-party watch mesh is included. This is a design study, not a verified physical product or engineered movement; the working name is not a trademark clearance.
- `images/aurel-veil.jpg`: project-created Blender studio render of that master.
- `textures/studio-small-09.hdr`: Studio Small 09, Sergej Majboroda / Poly Haven, CC0. Source: https://polyhaven.com/a/studio_small_09 . Original 1K HDR: https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_09_1k.hdr . Retained original credits in the V11 source folder.

Rebuild: `node scripts/prepare-watch.mjs`. The build verifies the master hash, web size, all component transforms, triangle count, texture pixel equality, animation data and maximum geometric error. See `docs/WATCH_ASSET_VALIDATION.json`.
