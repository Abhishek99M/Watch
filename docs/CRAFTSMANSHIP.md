# Phase 10: materials and craftsmanship

The approved V11 GLB, studio lights, textures and rendering quality are retained.
Three manual studies share the existing canvas: dial, case and bracelet. Each
frames mapped, assembled geometry; surrounding watch parts remain present and
may extend beyond the deliberate crop. The scene never recolors, hides or replaces
surfaces for this feature.

## Visible details, not product specifications

The dial view frames `dial` and `bezel`, the case view frames `case`, `crown` and
`bezel`, and the bracelet view frames `end_link_lower` and the first three lower
bracelet groups. Camera angles distinguish the near-front dial, oblique case and
curved bracelet. Bounds are calculated from the actual mapped geometry at the
current aspect ratio. Unsupported component mappings omit these controls.

Copy describes radial lines, charcoal/champagne tones, brushed-looking surfaces,
bright borders and satin-looking link centers. These are observations of a digital
design, not claims of material composition, hand finishing or manufacturing
processes. A permanent server-rendered section supplies the same descriptions
with a qualification about unconfirmed physical specifications. It remains useful
with JavaScript disabled, in static mode and after WebGL failure.

## Ownership and restoration

Craftsmanship uses the Phase 9 exclusive detail owner. Entry saves manual progress
and camera state, restores any movement visibility/hand rotation, and asks the
assembly controller for the exact assembled pose. Switching studies only changes
framing. Return restores the previous manual assembly and camera; viewport changes
use responsive framing. No components are reparented, and the asset is not reloaded.
The other detail controls remain mounted but hidden while a study is active.

Starting cinema releases detail inspection before the existing Phase 8 scroll
controller takes over. Its approach/separation/inspection timing is unchanged.
Reduced-motion users have all three fixed views. There is no new tween, animation
loop, autoplay, scroll listener, shader or postprocessing pass. Orbit, keyboard,
zoom and Reset view operate on the current study. Context loss and static exit use
the established error/retry/teardown flow and return to assembled access.

Phase 11 narrative reassembly and later configuration remain separate.

## Validation

`tests/craftsmanship.spec.ts` covers projection bounds and unchanged transforms,
materials and visibility; real-GLB reverse-view and manual restoration; keyboard
selection; seven responsive widths; reduced motion; movement/cinematic handoff;
context-loss retry; and static/no-JavaScript/failed-model content.

Craftsmanship runs as a separate CI suite in development and production, alongside
the existing core and movement suites. No test is removed from either full mode.
See TEST_PLAN.md for actual run results and craftsmanship-validation/ for reviewed
browser captures. Physical-device performance and Safari/Firefox/screen-reader
validation remain later release gates.
