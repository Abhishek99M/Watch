# Placeholder watch

Phase 5 replaces the faceted lighting study on /watch with an illustrative procedural watch. It is a visual stand-in while the approved design and licensed GLB are pending. Colors, proportions and apparent materials are not product specifications.

## Components

- `src/three/placeholder-watch.tsx`: assembled case, caseback, bezel, dial, twelve hour markers, three fixed hands, hand pin, lightly transparent crystal, crown, lugs and two strap segments.
- `src/three/scene-lighting.tsx`: the existing ambient, hemisphere and directional lighting, separated from the model.
- `src/components/three/static-watch.tsx`: matching inline SVG watch for initial content, loading and fallback. Its text description and prototype caption remain available without JavaScript.
- `src/three/scene-canvas.tsx`: the established renderer and camera lifecycle, now composing the lights and watch.

The watch uses cylinders, a torus and boxes with standard materials. Geometry and materials are owned by the Fiber tree for automatic cleanup. Named parts are local procedural identifiers, not assumed future GLB node names. The future asset pipeline must explicitly map its actual nodes.

The assembled watch is centered with a fixed presentation angle and scale chosen to fit the existing responsive camera. Hands are decorative and motionless; this is not a live clock. No controls, state store, timers, animations, model loaders, textures, HDRs or new dependencies are added.

## Preserved behavior

The preview is opt-in and lazy-loaded. The camera still resizes with its container and caps pixel density at 1.5. Demand rendering keeps the model still for everyone, including reduced-motion users.

The existing 12-second deadline, loading status, React boundaries, renderer error handling, context-loss recovery, retry and Use static view action remain. Leaving the route or returning to static view unmounts the scene. See THREE_FOUNDATION.md for lifecycle details.

## Review

Visit /watch at mobile and desktop widths. Confirm the round case, face, hands, crown and both strap segments are visible and that the caption identifies a prototype. Load the 3D view, resize, then return to static view. Repeat with reduced motion and JavaScript/WebGL disabled. Check safe recovery after a lost graphics context or interrupted lazy download.

The browser suite exercises these recovery paths and checks prototype labeling and absence of model/image asset requests during successful rendering. Screenshot review covers the rendered watch and static SVG. Real GPU/device and screen-reader QA remain pending.

Phase 6 is the real GLB model pipeline. Exploded views, movement scenes, material selection, scrolling and commerce remain later work.
