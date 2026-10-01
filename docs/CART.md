# Phase 14: demonstration cart

Approved saleable products, prices, inventory and physical variants are still
unavailable (see PRODUCT_INFORMATION.md). This phase implements a clearly labelled
demo cart for the original Aurel Veil digital design study only. There is no price,
total, checkout, reservation, order, tax, delivery or inventory claim. Midnight blue
and Forest green remain illustrative preview colours and never become cart variants.

## State and ownership

Zustand 5.0.15 is now a direct dependency, as planned in ARCHITECTURE.md. CartProvider
creates a store instance per mounted application provider, rather than a module
singleton shared by server requests. It wraps the header and route children in the
root layout; Server Components remain server-rendered children. React's initial
render uses an empty, unready store; the provider reads localStorage only after
mount. This avoids server access to browser APIs and mismatched hydration output.

The watch information section offers Add to demo cart and View demo cart. Repeated
adds increment the same line, capped at nine demo units. The cart provides a native
quantity select (1-9), removal, a summary without money, and links back to the design.
The limit is explicitly a demonstration bound, not a stock or purchase limit.
Removal restores keyboard focus to the empty-state heading. Status messages announce
changes; both primary menus show the same quantity indicator.

Cart state and Phase 12 dial selection are independent. Reading or changing the cart
never mutates materials, camera, movement, assembly or the cinematic timeline. No
cart view loads 3D. Configuration retains its existing page-scoped lifetime.

## Persistence and recovery

The only stored key is watch.demo-cart.v1. Its maximum 512-character JSON payload
has exactly version (1), itemId (aurel-veil-study) and quantity (integer 1-9).
Nothing from persisted state supplies display text, links, prices or availability.
Invalid JSON, unknown versions/IDs, unexpected fields, wrong types, fractions,
nonfinite values and out-of-range quantities recover to an empty cart with a notice.
Invalid data is removed when storage permits. Empty carts remove the key.

Ordinary changes save immediately. Same-origin storage events synchronize other
tabs, including deletion/clear; the last stored change wins. This is a simple demo,
not transaction-safe concurrent inventory. Browser reload and navigation preserve
valid saved carts. Clearing browser storage removes them. If reading or writing
storage fails, the mounted store remains usable in memory across client navigation;
UI explains that the data lasts for the current page session only. Reload loses
unsaved memory state. No cookies, account tracking or server cart is added.

Client values are never authoritative commercial data. Phase 15 must resolve approved
product IDs and validate quantities, pricing and inventory on the server. This demo
schema must not be accepted as an order or a payment request.

## Access and validation

The cart introduction, demo qualification and navigation are server-rendered. With
JavaScript disabled, controls cannot mutate data and explanatory text directs the
reader to the still-accessible design. WebGL failure is independent of cart state.
Native links/buttons/selects retain keyboard and visible focus behavior. The layout
is still, responsive and compatible with reduced motion without extra animation.

Tests in tests/cart.spec.ts cover validation, isolation, failed storage, persistence,
add/remove/quantity, keyboard focus, cross-tab synchronization, invalid saved content,
no JavaScript and seven widths. They join core; the existing movement, craftsmanship
and configuration partitions remain separate. See TEST_PLAN.md for run results and
cart-validation/ for desktop/mobile evidence. Physical-device and assistive-technology
validation remain later QA gates.
