# Phase 11: narrative reassembly

The optional cinematic view now completes a full visual construction study:
approach, separation, inspection, deliberate reassembly, then a still assembled
finale. V11 geometry, textures, studio lighting, camera lens and render quality
are unchanged. The closing sequence is illustrative, not a manufacturing claim.

## One timeline and one owner

`src/animations/watch-timeline.ts` maps native scroll progress to absolute values:

| Progress | Chapter | Behavior |
| --- | --- | --- |
| 0-12% | A closer look | Existing bounded approach, fully assembled |
| 12-52% | Layers revealed | Existing staged separation and coordinated camera |
| 52-66% | A moment to inspect | Fixed fully separated pose and camera |
| 66-94% | Each layer returns | Reverse the authored component stages while returning the camera |
| 94-100% | Whole again | Exact assembled transforms and original studio camera |

The sticky section extends from 400 to 600 small-viewport heights to accommodate
the closing chapter. These are normalized timeline allocations, not seconds.
There is no autoplay, snap, delayed tween, extra canvas or second scroll trigger.
The existing scene controller alone applies assembly transforms and camera state.
Movement and craftsmanship remain manual detail modes with the same ownership
handoff; entering cinema restores detail visibility and the sampled second hand.

Closing drives the same Phase 7 evaluator from one back to zero. Thus the inner
layers return before the enclosure closes; the anchored case/bracelet do not drift.
Every sample starts from immutable authored transforms, never accumulated offsets.
At 94% the evaluator receives literal zero and framing keeps the exact studio home
camera. Both endpoints and all intermediate samples are independent of direction.
Reverse scrolling reopens the same closing path before retracing the inspection
and opening chapters. No GLB nodes are hidden or replaced by the story.

## Responsive access and lifecycle

The current component bounds continue to drive responsive camera fitting. The
native scrollbar, wheel, keyboard and touch own progress. Still inspection and
final holds do not request new WebGL draws. Exit and reduced-motion changes remove
the trigger and restore assembled manual access. Reduced motion does not offer
cinematic activation; direct separation and fixed detail views remain available.
Context-loss retry, static view, failed chunks, refresh and route exits retain the
existing poster/retry/teardown flows. No new download or fallback dependency exists.
Later watch configuration, product specifications and commerce remain separate.

## Validation

Timeline checks cover finite inputs, monotone closing, continuous boundaries,
exact holds, camera fitting and direction-independent samples. Actual V11 hierarchy
tests cover exact local/world restoration of all 43 groups at the final hold.
Browser checks compare every interior canvas pixel at start/finale and forward/
reverse closing, exercise movement/craftsmanship ownership, seven viewport widths,
reduced motion, idle draws and context loss during closing. Existing fallback,
route and detail tests remain in their isolated CI suites. See TEST_PLAN.md for
completed runs and reassembly-validation/ for visual evidence.

Software WebGL captures verify behavior and appearance in installed Chrome;
physical-device performance and Safari/Firefox/assistive-technology audits remain
later release gates.


Endpoint image comparisons give the canvas a fixed viewport origin only for the
screenshot, at its existing CSS width/height. Sticky entry/exit otherwise changes
fractional compositor placement and can add a screenshot row (699 versus 698
pixels observed on desktop). The test never changes document scroll, model pose,
backing resolution or camera; every interior pixel must still match exactly.
Unmodified full-page mobile captures validate the actual sticky layout separately.
