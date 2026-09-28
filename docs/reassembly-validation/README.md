# Phase 11 visual review

Production browser captures from installed Chrome with SwiftShader, 2026-09-27.
Desktop canvas captures use a 1440 x 1000 viewport; mobile full-page captures use
390 x 844. The approved V11 asset and its studio rendering settings are unchanged.

- start-desktop: original assembled camera and watch.
- inspection-desktop: separated inspection hold at 60% story progress.
- closing-desktop / closing-mobile: returning layers at 80%.
- assembled-desktop / assembled-mobile: the exact assembled hold at 96%.

Reviewed the product framing, aligned layers, visible dial/case/bracelet surfaces,
readable captions and accessible Exit control. Desktop component crops normalize
only screenshot placement to avoid fractional sticky compositor differences;
mobile captures show the unmodified page layout. Browser comparisons require exact
interior-pixel equality at story start, final hold, 100%, and repeated reverse poses.

Seven widths (320, 375, 390, 768, 1024, 1440, 1920) passed responsive checks.
These software-rendered captures do not certify physical-phone performance or
Safari/Firefox/screen-reader behavior; those remain later release gates.
