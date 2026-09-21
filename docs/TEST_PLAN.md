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

## Phase 1 validation evidence

On 2026-09-21, Windows / installed Chrome:
- Repository contract, ESLint and strict TypeScript checks: passed.
- Development browser suite: 10 passed.
- Production build: passed, with static homepage, not-found route and icon.
- Production browser suite: 10 passed.
- npm audit: zero vulnerabilities.

Browser coverage includes homepage HTTP 200, title and heading, refresh without browser errors, keyboard skip link, missing-route HTTP 404 and return-home navigation, and no horizontal overflow at all seven documented widths under reduced motion.

Local Playwright Chromium download timed out; installed Chrome was selected through PLAYWRIGHT_CHANNEL=chrome. CI installs its own Chromium and repeats development and production tests. This does not certify Safari, Firefox, physical mobile hardware or the later 3D and commerce features.

Manual review: run npm run dev, open http://localhost:3000, refresh, use Tab/Enter on Skip to content, visit /missing-page and Return home, and inspect the page on a real mobile device. Broader browser and accessibility audits remain later-phase requirements.

## Vercel preview regression

Confirm the preview build uses the Next.js framework, completes output collection without a missing-public-directory error, and reaches Ready. Verify the deployed homepage and the /missing-page recovery flow before merging.

Verified on 2026-09-21 for commit c064f0f: Vercel detected Next.js 16.3.5, completed build output collection and reached Ready. Authenticated preview checks returned / = 200 and /missing-page = 404. Both GitHub CI runs and the Vercel check passed.

## Phase 2 validation evidence

On 2026-09-21, Windows / installed Chrome:
- Repository integrity, lint, strict TypeScript, production build and npm audit passed; zero vulnerabilities.
- Development browser suite: 20/20 passed.
- Production browser suite: 20/20 passed.
- Shared controls: keyboard activation, native disabled/busy behavior, recovery/reset and real anchor destinations.
- Text tokens: at least 7:1 contrast on canvas, surface and raised backgrounds.
- All seven documented viewport widths: no horizontal overflow, targets at least 48px, visible focus and no skeleton animation under reduced motion.
- Preview noindex metadata and useful content/navigation without JavaScript.
- Desktop (1440px) and narrow mobile (320px) screenshots reviewed for typography, spacing, wrapping and card stacking.

The first run exposed a test selector collision with Next.js's route announcer; it was scoped to the intended error message. One local browser process crashed under four-worker load; browser concurrency is now two, and both complete suites passed.

Manual review: run npm run dev and visit /design-system. Tab through enabled links/buttons, activate Test action with Enter, use Retry preview and Reset error example, and follow the card/loading anchor links. Enable reduced motion and inspect the static loading skeleton. Review the homepage and /missing-page. Physical-device, screen-reader and non-Chromium testing remain pending.
