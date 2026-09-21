# Project context

Phase 0 and Phase 1 are complete. Phase 1 adds Next.js 16.3.5 App Router, React 19.3, strict TypeScript, Tailwind 4 and ESLint, with an npm lockfile and runnable lint, typecheck, test and build scripts.

The application contains a static foundation homepage, metadata, a browser icon, keyboard skip link and a 404 page with a return-home link. No product specifications are invented. The design system, navigation, 3D, configuration and commerce are still future phases.

Validation on Windows with installed Chrome: lint and type checks pass; development browser tests 10/10 pass; production build passes; production browser tests 10/10 pass; npm audit reports zero vulnerabilities. CI runs the same tests with Playwright Chromium and full-history secret scanning.

The local Playwright Chromium download timed out, so local tests used PLAYWRIGHT_CHANNEL=chrome. ESLint 9 is retained for Next.js plugin compatibility; see SECURITY.md. Physical-device and non-Chromium browser QA remain pending for their later phases.

Next task: Phase 2, design system. Start it on a new branch from updated main after the Phase 1 PR has been reviewed and merged. Use ✅ for completed phases and ⬜ for pending phases. Do not merge a phase PR without user authorization.

Approved product content, licensed 3D assets, payment integration decisions and a deployment domain remain outstanding.

Vercel preview fix: the project was imported with the Other framework preset and expected public output even though next build succeeded. vercel.json now selects the Next.js preset and resets the output directory to its framework default. Validation of the new preview is required before merging.
