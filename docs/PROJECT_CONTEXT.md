# Project context

Phases 0, 1 and 2 are complete. Phase 1 supplies Next.js 16.3.5, React 19.3, strict TypeScript, Tailwind 4, ESLint, an npm lockfile and development/production browser checks.

Phase 2 adds shared semantic color, type, spacing and motion tokens; buttons and button links; a navigation link primitive; section headings; badges; product cards; loading and error states. The homepage and 404 page consume the system. The /design-system reference route has noindex metadata, clearly illustrative content and working interaction/recovery examples. See DESIGN_SYSTEM.md for component usage.

Validation: repository contract, lint, type checks, production build and npm audit pass (zero vulnerabilities). All 20 browser tests pass against development and production servers using installed Chrome. Desktop and 320px screenshots were reviewed. Coverage includes 7:1 text-token contrast, keyboard activation, disabled/busy controls, recovery, reduced motion, 48px targets, no-JavaScript content and seven responsive widths. Playwright uses two workers to avoid the observed local browser crash under four-worker load.

Use PLAYWRIGHT_CHANNEL=chrome locally if the Playwright download is unavailable. CI installs Chromium. ESLint 9 remains a documented Next.js plugin compatibility exception. Physical devices, screen readers and non-Chromium browsers still need later-phase QA.

Next task: Phase 3, navigation. Begin on a new branch from updated main after the Phase 2 PR has been reviewed and merged. Implement full navigation/mobile menu behavior then; Phase 2 supplies its visual primitive only. Mark completed phases with ✅ and pending phases with ⬜. Never merge a phase PR without user authorization.

The approved product content, licensed 3D assets, payment decisions and deployment domain remain outstanding. 3D, product configuration and commerce are not implemented.

Vercel previews use the Next.js preset and default output via vercel.json. This fixed the original Other-preset/public-output failure. Local .vercel metadata is ignored.
