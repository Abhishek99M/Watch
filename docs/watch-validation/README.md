# V11 rendering comparison

The three captures use the same 550 x 500 canvas dimensions, studio HDR, camera pose and quality settings. They are live WebGL renders, not the offline Blender beauty image.

| Capture | Description |
|---|---|
| [master.png](master.png) | Full-quality V11 GLB in its original viewer |
| [optimized.png](optimized.png) | Web GLB in the original V11 viewer |
| [website.png](website.png) | Web GLB in the corrected website renderer |
| [website-rotated.png](website-rotated.png) | Website after keyboard rotation |

Mean absolute RGB-channel difference, on a 0-255 scale: master versus optimized **0.0125**; V11 viewer versus website **0.0175**. Reset returned an image with **zero pixel difference** from the initial view. These are measured differences for this controlled camera and Intel Direct3D11 renderer, not a universal visual-quality score.

Mouse drag, touch pinch, keyboard rotation, button zoom and reset passed. The inspection script hides overlay buttons only during captures so UI pixels do not contaminate the comparison; controls remain visible in the actual website.

Reproduce with both local servers running: `node scripts/compare-watch-rendering.mjs`. `WATCH_PREVIEW_URL` optionally selects another website URL; the V11 reference uses port 43180. The source viewer and master GLB remain unchanged.

The earlier SwiftShader comparison logged the upstream Clock warning. The latest hardware run below verifies both website warnings are fixed. Physical-phone performance remains a separate QA gate.


Latest report uses Chrome's default Intel Iris Xe / ANGLE Direct3D11 backend.
`referenceWarnings` records warnings from the unchanged original viewer;
`warnings` records the corrected website and is empty. The original viewer
reproduces X4122 on this backend, while the website does not. This distinguishes
the driver-specific fix from the previous SwiftShader-only validation.
