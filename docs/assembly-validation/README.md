# Phase 7 visual validation

- separated-50.png and separated-100.png: actual V11 WebGL assembly at partial and
  full separation. Test-only CSS hides the page header and orbit controls for
  unobstructed image comparisons.
- mobile.png and desktop.png: full page at 320px and 1440px, with all real controls
  visible. Captured by the passing production assembly browser test in Chrome /
  SwiftShader.

The browser test compares each partial pose against the same pose reached in
reverse and verifies pixel-identical restoration of the initial assembled view.
The numerical tests independently verify all 43 actual GLB transforms after 100
rapid forward/reverse cycles. These checks do not establish physical-phone GPU
performance or mechanical accuracy of the illustrative movement.

The assembled-view comparison also passed on Intel Iris Xe / ANGLE Direct3D11.
comparison.json records a 0.01752/255 mean RGB difference from the original V11
viewer, zero Reset difference, and no website warnings. master/optimized/website
captures reproduce the existing Phase 6 parity check; the original reference's
recorded warnings are separate from the website. Reproduce with WATCH_NATIVE_GPU=1
and WATCH_VALIDATION_DIR=docs/assembly-validation using scripts/compare-watch-rendering.mjs.
