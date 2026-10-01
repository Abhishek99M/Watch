# Phase 13: approved product information

The watch page now includes an always-readable Aurel Veil design profile after
craftsmanship. This is a digital design study, not a physical product listing.

## Content sources and publication boundary

| Published content | Existing evidence |
| --- | --- |
| Aurel Veil design-study name and original studio image | Existing watch page, scene poster, public/images/aurel-veil.jpg |
| Charcoal radial dial, champagne-toned hands/markers | docs/CRAFTSMANSHIP.md, src/data/craftsmanship.ts, approved V11 |
| Round case, bright bezel edges, ridged crown, curved links | Approved V11 and the existing craftsmanship descriptions |
| Illustrative movement and supported second-hand playback | docs/MOVEMENT_SCENE.md and the reviewed Seconds_Sweep_60s clip |
| Original Charcoal and illustrative Midnight blue / Forest green | docs/WATCH_CONFIGURATION.md and src/data/watch-configuration.ts |

Copy describes visible colour, shape and finish only. It does not infer material
composition from a rendered surface. The studio image and profile explicitly stay
on the original Charcoal design, independent of the selected 3D colour study.

Before physical product claims can be published, the owner must supply approved
material composition, dimensions, movement specifications, water-resistance rating,
warranty terms, price/currency, and availability/inventory. Any future brand history
also needs an approved source. None can be established by researching unrelated
watches online. These fields are deliberately absent from the content data; no
placeholder values, purchase actions or Product/Offer structured data are emitted.
The public disclosure concisely explains the unconfirmed status.

## Architecture and accessibility

src/components/ui/product-information.tsx is a Server Component fed by the small
reviewed content module src/data/product-information.ts. It renders outside the
scene/retry boundary, with semantic section, heading, figure, definition list and
native details/summary disclosures. Reading and keyboard disclosure work without
JavaScript, WebGL or successful asset loading. The existing poster has intrinsic
dimensions, descriptive alternative text, and lazy loading in this section.

No new dependency, state store, material, canvas, controller, timeline, animation,
scroll listener or scene mutation is introduced. Existing page-local configuration
continues to own the selected dial; this profile never claims to summarize that
selection. Reduced motion needs no special transition because this section is still.
Cart and checkout remain Phase 14 and Phase 15.

## Validation

Focused browser coverage: no-JavaScript reading and keyboard disclosures; seven
responsive widths under reduced motion with no GLB request; failed model loading
and return to static view. These lightweight tests join core; movement,
craftsmanship and configuration stay in their existing isolated CI partitions.
See TEST_PLAN.md for actual results and product-information-validation for captures.

## CI-required security patch

The initial Phase 13 quality job passed lint/types/assets but failed npm audit on
Next.js 16.3.5 (GHSA-vcvr-r3jv-pc5j). The targeted update to 16.3.6 is the minimum
patched version identified by the advisory, rather than a broad dependency update.
The affected next/og ImageResponse usage is absent from this project; the existing
security gate still requires a patched dependency. No audit exemption is added.
Source: https://github.com/advisories/GHSA-vcvr-r3jv-pc5j
