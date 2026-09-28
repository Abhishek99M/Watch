# Phase 12: watch configuration

The approved V11 has one appearance, one bracelet geometry, and no
KHR_materials_variants collection. Inspection of the source GLB found a distinct
textured dial-face material: `Black sunray dial` (material 8), used by node 28
within mapped Dial node 27. Other dial materials carry the chapter ring, printing,
applied signature and markers. These are retained without recolouring.

## Supported scope

The preview offers Charcoal (original), Midnight blue and Forest green. The latter
two are explicitly illustrative colour studies of the existing digital dial, not
authored physical product variants. No strap replacement, metal/material claim,
size, price, availability or purchase action is invented. Swatches indicate tones;
the rendered appearance depends on the preserved textures and studio lighting.

The original Charcoal selection leaves the imported material untouched. A
non-default selection lazily clones only the reviewed dial-face material and
multiplies its original linear RGB factor by a restrained tint. Texture objects,
normal/roughness maps, anisotropy, metallic properties, geometry, glass and all
other materials remain unchanged. Returning to Charcoal reinstates the exact
original material assignment, not an approximation reconstructed from values.

`src/three/watch-configuration.ts` requires the V11 presentation profile and one
matching textured slot in the mapped Dial group. Missing or ambiguous mappings
omit configuration controls. The controller validates choices before mutation,
never modifies shared imported materials, and reuses at most one clone. Teardown
restores the original assignment and disposes the clone; the model loader remains
the owner of shared textures and original materials.

## State and scene ownership

ScenePreview owns the page-local DialTone selection above individual load/retry
attempts. The scene applies the current selection before its first render, and
later changes update the material with a demand-frame invalidation. No GLB reload,
new rendering loop, camera reset, component transform, visibility change or
animation mixer is introduced. Assembly, movement, craftsmanship and cinematic
owners continue to manage their existing responsibilities independently.

The selection survives manual separation, all detail views, full forward/reverse
cinema, resize, preference changes, context-loss retry and static exit/re-entry.
Cinema temporarily hides the choices; it does not clear them. Craftsmanship dial
copy describes the selected study, while static editorial copy explicitly refers
to the original Charcoal appearance. The poster is never tinted or presented as
an image of an unsupported selection. Fallback copy labels the saved choice, and
static mode offers Reset appearance. Unsupported models and placeholders have
no unusable configuration controls. Reload or leaving the page starts fresh.

Native radio inputs provide checked state, labels and arrow-key navigation.
Selected borders, swatches, text and a polite selected-value summary avoid relying
on colour alone. Reset appearance is disabled at the original setting. Options
wrap responsively and have at least 48px hit height. Changes are immediate and
remain available under reduced motion. Useful explanatory copy is server-rendered
without JavaScript or WebGL.

The state is intentionally scoped to this preview, with no storage, URL parsing,
cart or server data. A global configuration/cart store is deferred until actual
cross-route consumers exist; this phase adds no state-management dependency.
Approved product information remains Phase 13; commerce stays in later phases.

## Validation

`tests/configuration.spec.ts` checks the actual GLB material mapping, clone
isolation, unchanged imported textures/properties/transforms, exact reset,
bounded allocation, invalid input and disposal. Real-model browser checks cover
native keyboard changes, distinct colours, exact image reset/reselection,
movement/craftsmanship/cinematic handoffs, seven widths, reduced motion, idle
drawing, saved-colour context-loss recovery, static re-entry and unsupported fallbacks.

Configuration has its own development/production CI partition. Existing core,
movement and craftsmanship partitions are unchanged and all eight browser jobs
feed the existing required gate. See TEST_PLAN.md for run results and
configuration-validation/ for reviewed desktop/mobile captures.

Physical-phone performance, Safari/Firefox and assistive-technology audits remain
later release gates. Software WebGL captures do not certify those platforms.


Same-context image resets remain pixel-exact. A freshly rebuilt WebGL context
showed 44 channel differences of at most 2/255 in the unchanged seconds subdial;
recovery therefore checks that bound over every interior pixel, followed by exact
reset/reselection in the recovered context. See TEST_PLAN.md for measurements.
