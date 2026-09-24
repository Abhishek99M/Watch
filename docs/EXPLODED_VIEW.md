# Phase 7: exploded-view architecture

The approved V11 asset is evaluated from an assembly progress value in [0,1].
This phase adds a manual inspection control; cinematic scrolling remains Phase 8,
movement playback remains Phase 9, and the narrative reassembly section remains
Phase 11. The Phase 6 GLB, textures, studio lighting and assembled camera are unchanged.

## Component evaluation

`src/three/exploded-assembly.ts` snapshots each mapped component's local position,
quaternion, scale and matrix once. Every evaluation starts from these immutable
home transforms. It never increments an existing translation, reparents a mesh,
or mutates a material. Returning to zero copies the exact saved transforms;
disposal also restores them and prevents further evaluation.

Offsets are interpreted in the component parent's local coordinates. Existing
parent scale and rotation therefore remain effective, including the source
millimetre-to-metre conversion and website normalization. Duplicate or nested
parts, invalid stage intervals, and non-finite values are rejected. Finite
progress is clamped to [0,1]; invalid input fails before mutating any part.

`src/three/v11-assembly.ts` requires all 43 mapped V11 groups and validates their
role and bounded, finite authored `explodeOffset` metadata. The enclosure opens
first, then hands and dial lift, then movement layers separate. Each stage uses
a smoothstep curve, yielding the same pose when progress is approached from
either direction. The 32 groups with zero authored offsets (case and bracelet)
remain anchored; 11 groups translate. This is a visual construction study, not
a claim of mechanically executable disassembly or a functioning caliber.

## Preview and camera

The controls appear below the canvas only after a valid V11 scene is ready:
- Component separation: labeled native range input, 0-100%, keyboard/touch support.
- Separate parts and Reassemble: direct endpoint controls with disabled endpoints.
- The existing orbit, zoom and Reset view controls remain available.

The slider directly evaluates the selected pose. Buttons select an endpoint;
there is no timed transition, autoplay, continuous animation or scroll listener.
Reduced-motion users have the same inspection access without an animation loop.

The component controller does not own a camera. A separate framing helper uses
the union of assembled and separated bounds and a three-quarter inspection view.
Entering separation reframes once; further slider changes preserve the user's
orbit. Returning to zero restores the original V11 camera. Resize and Reset view
frame the current mode without changing progress. Fitting the whole envelope
keeps framing stable across partial separation stages.

## Lifecycle and future integration

Scene teardown restores components before disposing GPU resources, clears the
preview handle and removes existing controls/listeners. Static view, reload,
context-loss recovery and retry start assembled. Invalid V11 assembly metadata
uses the existing poster/error/retry/placeholder flow. Other configured models
and the procedural placeholder do not show unsupported separation controls.

Phase 8 can drive the same absolute `apply(progress)` evaluator. It should own
story camera motion separately, explicitly coordinate with orbit controls, and
respect reduced motion rather than adding a second competing transform loop.

## Validation

Numerical tests use the actual V11 node hierarchy, transforms, roles and offsets.
They cover 0/25/50/75/100%, reverse and repeated progress, 100 rapid cycles, exact
local/world restoration, parent preservation, bounded input, disposal, malformed
metadata and camera framing at portrait/desktop aspect ratios. Browser tests load
the real GLB and cover distinct partial poses, pixel-identical reverse/reset,
keyboard endpoints, seven widths, idle rendering under reduced motion, re-entry,
context loss/retry, route exit and fallback without unusable controls.

Physical-phone performance and Safari/Firefox/screen-reader testing remain later
QA gates. See TEST_PLAN.md for completed run results and visual evidence.
