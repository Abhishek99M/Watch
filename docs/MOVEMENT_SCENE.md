# Phase 9: movement inspection

The approved V11 GLB and its studio rendering profile are unchanged. After loading
3D, **Inspect movement** presents the two mapped Movement groups in an explicit
isolated view. **Inspect second hand** returns the full watch to its assembled
pose and frames the dial closely. Bracelet edges may extend outside this deliberate
dial crop. **Return to watch** restores the previous assembly progress and camera.
The existing Phase 8 approach, coordinated separation and inspection hold retain
their original timing; movement inspection is a manual detail mode, not an extra
scroll chapter. Starting cinematic mode releases detail inspection first.

## What the asset supports

V11 has one animation, `Seconds_Sweep_60s`: a single linear quaternion track on
`seconds_hand`, lasting 60 seconds. There are two Movement-role groups (`movement`
and `bridges`), with modeled brass wheels, plates, screws and bearing details.
These are illustrative static geometry; there is no animated gear train, validated
escapement, running caliber or live clock. Copy describes this limitation directly.
No geometry, textures, material settings, lighting or embedded animation were edited.
The other watch components are temporarily hidden only in explicitly labeled
isolated inspection, and their original visibility is restored on exit.

## Transform and rendering ownership

`model-loader.ts` retains imported animation clips. `movement-inspection.ts`
accepts only the reviewed 60-second, single-track linear quaternion animation.
Missing or unsupported clips leave static detail inspection usable and display
an unavailable message instead of a broken playback control. Unsupported models
without the mapped movement/hand have no movement controls.

The scene selects one owner at a time. Assembly owns translations; the detail
controller samples only the hand quaternion. It does not create an AnimationMixer
that competes with assembly's absolute transform restoration. Entering a detail
view snapshots manual progress, camera position and target. Switching detail
views restores the hand before applying the required assembly pose. Exiting
restores the snapshot; cinematic activation then evaluates its own absolute pose.
Resize and Reset view reframe the active detail. A compact sticky canvas leaves room
for controls on short and mobile screens. The saved manual camera is restored after
the detail layout returns to its original dimensions; cinematic activation discards
that pending manual restoration before evaluating its own camera. No component is reparented.

Playback starts only after **Play second hand**. Pause retains the selected pose;
Reset and the range endpoints restore the exact authored home quaternion. The
range can be scrubbed in either direction. UI values update through DOM refs,
not per-frame React state. Frames are requested only while explicit playback is
running or the user changes the view. Hidden tabs, an offscreen canvas, preference
changes, view changes and teardown stop playback; it does not automatically resume.
Reduced motion exposes fixed-position scrubbing and no Play button. Teardown
restores visibility and hand rotation before assembly/resource disposal. Static
view, load failure, context loss and retry preserve the existing recovery flow.

## Validation

See `tests/movement.spec.ts` for rotation/separation independence, exact reverse
sampling, portrait/desktop framing, full-model browser playback, restoration,
reduced motion and recovery coverage. Existing assembly and cinematic tests
continue to cover the preserved Phase 7-8 behavior. Actual run results are recorded
in TEST_PLAN.md. Screenshots in movement-validation show the real browser render.
Software WebGL screenshots do not certify physical-phone performance or Safari,
Firefox and assistive-technology behavior; those remain later QA gates.

Phase 10 material/craftsmanship storytelling and Phase 11 narrative reassembly
are not implemented here. No new dependencies or remote assets were added.

Visual comparisons standardize the manual scroll position and exclude only the
one-pixel CSS/compositor perimeter of the canvas crop. Every interior pixel still
requires exact equality, with no tolerance. Original, uncropped captures are saved.
This avoids a measured browser capture artifact: 2,298 changed channel values all
on the first row of a 766px-wide image, with identical rendered watch pixels.
Cinematic captures never change document scroll, which remains the timeline clock.
