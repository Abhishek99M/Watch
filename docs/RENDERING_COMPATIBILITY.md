# Rendering compatibility fixes (Three r186 / Fiber 9.7.0)

The website applies two temporary upstream compatibility fixes through
`scripts/apply-rendering-compat.mjs`. `npm install` / `npm ci` runs it via
`postinstall`. Both dependencies are pinned to the reviewed versions; unknown
versions or changed source patterns fail explicitly instead of silently patching.
The script validates all targets before writing and is safe to run again.

## Deprecated Clock

Fiber 9.7.0 constructs `THREE.Clock` internally when creating a root. Replacing an
application timer cannot prevent that constructor warning. The current stable
Fiber 9.8.0 also uses Clock; Fiber 10 is prerelease.

The patch replaces the constructor call in Fiber's ESM, development CommonJS and
production CommonJS bundles with `createFiberTimer`, a Timer-backed adapter for
Fiber 9's clock interface. It retains seconds, automatic start, explicit
start/stop/reset, writable elapsedTime/oldTime and manual advance compatibility.
It creates no document listeners. `node --test scripts/rendering-compat.test.mjs`
checks those semantics. No console warnings are filtered.

## X4122 during environment preparation

The Windows ANGLE/D3D shader compiler reports floating-point precision loss while
constant-folding PMREM's GGX sampling shader. In this shader the view direction is
always (0,0,1), so `s=1`, and the disk sample satisfies
`t1*t1 + t2*t2 = Xi.x`. The patch uses `sqrt(max(0, 1-Xi.x))` for the hemisphere
height and removes the redundant interpolation with a zero coefficient. This
avoids trigonometric cancellation while preserving the mathematical sampling
distribution, sample count, environment resolution and intended appearance.

Only the imported Three WebGL bundle and its matching source are patched. The
original V11 viewer has its own vendor copy and remains an unmodified reference.
Shader diagnostics stay enabled. The GLB, textures, lights and camera are unchanged.

## Validation and maintenance

The production comparison script checks visual agreement with the unmodified V11
viewer, drag/pinch/keyboard/zoom/reset and absence of Clock/X4122 messages. Set
`WATCH_NATIVE_GPU=1` to test Chrome's default graphics backend; otherwise it uses
SwiftShader. The report records the actual GPU and reference-viewer diagnostics.
The watch browser regression also fails if either warning returns.

After applying this patch to an already-running development server, stop and
restart `npm run dev` to invalidate cached dependency modules, then reload /watch.
The production build consumes the patched dependencies directly.

When upgrading Three or Fiber, review upstream fixes first. Remove the relevant
patch when upstream supports the replacement; rerun timing, visual and lifecycle
checks. Do not loosen version checks just to make an upgrade install.

`GET /watch 200 ...` is a successful HTTP request timing log, not an error. A cold
Next development request can include compilation and server-rendering overhead;
its duration is not a production performance measurement.

References:
- https://github.com/pmndrs/react-three-fiber/issues/3741
- https://threejs.org/docs/pages/Timer.html
- https://learn.microsoft.com/en-us/windows/win32/direct3dhlsl/hlsl-errors-and-warnings

Verified: production build, lint, typecheck, repository checks, Timer unit test,
repeatable postinstall, hardware visual/interaction comparison, and 62/62 production
browser tests (3.7 minutes). The hardware comparison used Intel Iris Xe / ANGLE
Direct3D11 and reproduced X4122 in the reference viewer only.
