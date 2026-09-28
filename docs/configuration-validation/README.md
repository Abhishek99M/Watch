# Phase 12 visual review

Production captures from installed Chrome with SwiftShader, reviewed 2026-09-28.
The three dial captures use the same 1440 x 1000 viewport and existing dial detail
camera. Charcoal is the approved original; Midnight blue and Forest green are
illustrative tints of the same texture, not physical product variants.

- charcoal-dial.png: unchanged original material.
- midnight-dial.png / forest-dial.png: restrained colour studies with the original
  radial texture, champagne-toned hands, case and bracelet retained.
- configuration-390.png / configuration-1440.png: unmodified mobile/desktop page
  views with selected state, labels, explanation and Reset appearance control.

Reviewed surface detail, unchanged surrounding materials, readable selected states,
control wrapping and visibility alongside the sticky detail canvas. Automated
checks also cover 320, 375, 768, 1024 and 1920px widths.

Colour reset and reselection require exact interior-pixel equality. Recovery also
compares within the recovered GPU context: its automatic saved colour must differ
from a Charcoal reset and exactly match explicitly selecting the saved tone again.
This avoids platform-dependent differences between independent GPU contexts. No
pixel tolerance is used. Numerical material identity checks remain exact.

Physical-phone performance, Safari/Firefox and assistive-technology validation
remain later release gates.
