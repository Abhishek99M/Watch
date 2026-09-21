# Test plan

## Current foundation

Run `node scripts/check-repository.mjs`. CI scans Git history for secrets. Validate workflow execution on GitHub before claiming checks are operational.

## Application CI contract

Once package.json exists, require package-lock.json and scripts `lint`, `typecheck`, `test`, `build`. Run npm ci, each script and npm audit --audit-level=high. Tests must exercise actual behavior and failures; no placeholder success scripts.

## Feature and release checks (pending)

- Fresh installation, refresh and direct navigation; no console/compilation errors.
- All responsive widths in UI_UX.md; keyboard navigation, focus, mobile menu Escape, labels and contrast.
- Desktop/mobile WebGL, failed/invalid model URL, missing textures, slow/offline network, retry and static fallback.
- Exploded progress 0/25/50/75/100%, reverse, rapid scroll, resize, repeated entry and reassembly transform equivalence.
- Story slow/fast/reverse, keyboard/touch scroll, refresh halfway, reduced motion and camera/configuration consistency.
- Movement clipping, flicker, offscreen GPU use, loading and error boundaries.
- Product facts verified against approved sources; configuration and cart repeated/rapid interactions.
- Tampered prices and quantities; invalid IDs, wrong types, missing/extra fields, large input and repeated API requests.
- Logged-out, normal/admin, invalid/expired sessions, direct protected URLs and webhook signatures where implemented.
- Security headers, secret scanning, dependency audit, environment isolation and HTTPS.
- Desktop, mid-range laptop and mobile CPU/network performance, model/texture size, frame rate, responsiveness, layout shift and memory.
- Metadata, canonical, social preview, sitemap, robots and no accidental noindex.
- Chrome, Firefox, Safari, Android Chrome and iOS Safari; record actual device/browser results.

Do not deploy with failing builds, unresolved high/critical security issues, exposed secrets, unvalidated checkout, major broken features, missing 3D fallback or unchecked accessibility. Record manual evidence before marking phases complete.
