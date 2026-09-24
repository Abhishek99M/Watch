# Phase 8: cinematic scroll timeline

The optional V11 preview now offers **Start cinematic view**. A native-scroll,
CSS-sticky stage maps document position to an absolute pose through GSAP
ScrollTrigger. The approved GLB, textures, lighting, DPR and transmission settings
are unchanged. Manual Phase 7 separation and orbit controls remain available.

## Sequence and ownership

`src/animations/watch-timeline.ts` defines one normalized clock:
- 0-18%: the assembled watch approaches by up to 8%, limited by available framing room.
- 18-80%: components separate while the camera turns gently toward a three-quarter inspection angle.
- 80-100%: fixed separated pose and camera, giving the viewer time to inspect.

The initial retreat has been removed. `frameCinematic` fits the current positions
of the individual components, with an 8% projected framing margin. It no longer
frames the oversized union of all possible positions before the reveal begins.
Camera travel and separation share the same smoothstep progress. The camera eases
back only as needed to keep the opening watch visible, ending with a tighter hold.

Each component's assembled world bounds and world translation are cached once.
The controller evaluates their corners using the same stages as the actual parts;
there is no per-frame vertex scan. The original full-envelope camera remains in
use for manual Phase 7 inspection. Assembly parent transforms remain fixed.
Reverse scrolling evaluates the same absolute values. Zero restores every saved component
transform. Exiting cinematic mode restores the original V11 camera and assembled
pose. This does not implement the later narrative reassembly or movement scenes.

The scene owns rendering and component transforms; the UI owns the scroll trigger.
During cinematic mode, OrbitControls and manual zoom controls are disabled, the
canvas permits vertical touch scrolling, and it leaves the keyboard tab order.
The native page scrollbar, wheel, Page Down and touch remain the navigation model.
Exiting transfers ownership back to manual controls. The same toggle button is
retained across modes so keyboard focus is preserved. Resize reframes the current
pose and refreshes scroll measurements. No per-frame React state drives the scene.

## Motion, cost and recovery

The timeline loads only after explicit activation and uses native scrolling.
Lenis is deferred: this phase does not need document-level scroll interception or
an additional continuous animation clock. This follows the cinematic brief's
native-scroll-first direction. ScrollTrigger supplies progress and responsive
measurements; CSS supplies sticky positioning without a generated pin spacer.

There is no autoplay or delayed catch-up tween. A stationary pose does not request
new WebGL frames, including the inspection hold and scrolling past the section.
All active progress comes from scroll position, with smoothstep easing in the pose
mapping and the Phase 7 component stages. The preview retains its bounded load
and safe poster/error/retry/placeholder flows.

Reduced-motion users receive direct manual controls and no cinematic activation.
Changing the preference while active exits the timeline and restores the assembled
watch. Leaving the scene kills its own trigger and restores assembly state. A failed or timed-out (12-second deadline)
lazy animation import returns to manual exploration. Refresh returns to the opt-in
static poster even when the browser restores a deep document scroll position; no
3D download or motion starts automatically. Product information stays available
without WebGL or JavaScript.

## Validation scope

`tests/timeline.spec.ts` verifies staging, exact endpoints, finite input and repeated
forward/reverse evaluation. `tests/cinematic.spec.ts` exercises the actual V11 GLB:
rendered reverse/hold parity, manual assembled restoration, native wheel scrolling,
seven viewport widths, preference changes and refresh recovery. Existing Phase 7
numerical tests retain exact transform coverage. See TEST_PLAN.md for actual runs.

Physical-device frame delivery, Safari/Firefox and assistive-technology audits
remain release gates. Software WebGL captures establish behavior and framing, not
physical-phone performance or a production-readiness certification.

Reference: https://gsap.com/docs/v3/Plugins/ScrollTrigger/ (refresh and kill lifecycle).
