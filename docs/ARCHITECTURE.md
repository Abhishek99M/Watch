# Architecture

Use Next.js App Router, React, TypeScript and Tailwind; Three.js, React Three Fiber and Drei for 3D; GSAP and Lenis for cinematic scrolling; Zustand for shared configuration/cart state. Add Motion or postprocessing only when needed. Select compatible maintained versions at implementation time and commit one npm lockfile.

Directories: `src/app` for routes; `components` for reusable UI; `features` for domains; `three` for scenes and model mapping; `animations` for timelines; `hooks`, `store`, `data`, `lib`, and `types` for their respective responsibilities. Assets belong under `public/models`, `textures`, `images`, and `fonts`.

Keep UI, 3D and checkout responsibilities separate. Lazy-load heavy scenes with a useful static fallback and error boundary. Map logical watch components to actual GLB nodes rather than assuming mesh names.

Define assembled/exploded transforms in configuration and interpolate from progress 0 to 1. Reassembly must return to the original transforms. Keep storytelling camera state separate from interactive camera controls. Avoid React state updates on every animation frame.

Server code owns validated pricing, inventory, payment creation and webhook verification. Never ship server secrets to clients.


Phase 12 configuration is page-scoped React state above the preview load/retry
boundary. Its material controller owns only the reviewed dial-face assignment;
assembly, animation and camera controllers retain their existing ownership.
A global Zustand configuration/cart store remains deferred until cross-route
consumers exist. No cart or product-data state is introduced in Phase 12.

Phase 13 product information is a Server Component outside the scene boundary,
using reviewed editorial data and native HTML disclosures. It neither consumes
nor changes configuration state: its image/profile are labeled original Charcoal.
Physical product and commerce data remain absent pending approved sources.
