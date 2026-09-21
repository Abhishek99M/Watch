# Architecture

Use Next.js App Router, React, TypeScript and Tailwind; Three.js, React Three Fiber and Drei for 3D; GSAP and Lenis for cinematic scrolling; Zustand for shared configuration/cart state. Add Motion or postprocessing only when needed. Select compatible maintained versions at implementation time and commit one npm lockfile.

Directories: `src/app` for routes; `components` for reusable UI; `features` for domains; `three` for scenes and model mapping; `animations` for timelines; `hooks`, `store`, `data`, `lib`, and `types` for their respective responsibilities. Assets belong under `public/models`, `textures`, `images`, and `fonts`.

Keep UI, 3D and checkout responsibilities separate. Lazy-load heavy scenes with a useful static fallback and error boundary. Map logical watch components to actual GLB nodes rather than assuming mesh names.

Define assembled/exploded transforms in configuration and interpolate from progress 0 to 1. Reassembly must return to the original transforms. Keep storytelling camera state separate from interactive camera controls. Avoid React state updates on every animation frame.

Server code owns validated pricing, inventory, payment creation and webhook verification. Never ship server secrets to clients.
