# 3D canvas foundation

Visit /watch and select **Load 3D preview**. Phase 4 renders a small faceted lighting study. The placeholder watch belongs to Phase 5; model loading, exploded views, scrolling, configuration and commerce remain later phases.

## Rendering and lifecycle

- `src/components/three/scene-preview.tsx` serves an inline SVG and description, then imports the scene only on request. No renderer is constructed during server rendering or initial page load.
- `src/three/scene-canvas.tsx` owns a fresh canvas and React Three Fiber root per mount. Explicit renderer setup catches asynchronous initialization and draw errors as well as React errors.
- `lighting-study.tsx` supplies one procedural mesh, a perspective camera's subject, ambient/hemisphere lighting and two directional lights. There are no model, texture or HDR downloads.
- ResizeObserver updates the viewport and camera framing. Pixel density is capped at 1.5. Demand rendering draws on initialization and resize, with no animation loop or camera controls.
- Cleanup disconnects observers/listeners, unmounts the Fiber scene, disposes the renderer and removes the canvas. Fiber disposes scene resources and releases the context. Retry creates a new instance.

## Loading and recovery

The static study remains beneath the canvas. Loading has an announced status and a 12-second deadline covering chunk loading through the first successful draw. Chunk failures, unavailable WebGL, renderer errors, React boundary errors and lost graphics contexts lead to a safe error message, static view and retry. Technical error details are not rendered in the page.

**Use static view** unmounts the scene at any point. Without JavaScript, the SVG, description and ordinary page navigation remain available; the load button is omitted. The decorative SVG/canvas are hidden from assistive technology and the figure has a text label and caption.

## Reduced motion

The scene stays still for everyone, including users requesting reduced motion. Loading uses static text. No spinning objects, animated camera, scroll effect or continuous frames are introduced. Future animation must explicitly preserve this static path.

## Dependencies

React and React DOM use the latest installed 19.2 patch (19.2.8), with matching type ranges, because Fiber 9.7 declares React `>=19 <19.3`. Next.js 16.3.5 accepts this version. The lockfile resolves Fiber 9.7 and Three.js 0.186 without forced peer overrides. Drei will be added when a feature needs it.

Three.js currently emits a Clock deprecation warning from Fiber internals. It is not a rendering error; do not suppress it or patch dependencies. Track upstream compatibility during upgrades.

## Validation

See TEST_PLAN.md for recorded results. Browser tests use SwiftShader to exercise real WebGL APIs consistently in local Chrome and CI Chromium. These test-only browser flags do not affect the application or establish physical GPU performance.

When adding models later, retain both React boundaries and explicit asynchronous failure handling. Extend the failure tests for missing/invalid model files and textures rather than treating today's procedural scene tests as model-pipeline coverage.
