# Project context

Phases 0 through 3 are complete. The project uses Next.js 16.3.5, React 19.3, strict TypeScript, Tailwind 4, ESLint and an npm lockfile.

Phase 2 supplies shared tokens, buttons/links, headings, badges, product cards and feedback states. The /design-system reference is noindex and uses illustrative content. See DESIGN_SYSTEM.md.

Phase 3 adds the shared sticky header, home wordmark and The watch / Our story / Cart destinations. Mobile uses a native nonmodal disclosure with keyboard support, Escape/focus return, outside-click/focus-leave dismissal and breakpoint/route reset. Basic toggling and link navigation work without JavaScript. All destinations support direct access and refresh. See NAVIGATION.md.

The /watch, /story and /cart pages are navigation shells. Product storytelling, specifications, cart state and checkout are not implemented. No product facts or cart quantities have been fabricated.

Validation: repository integrity, lint, type checks, production build and npm audit pass with zero vulnerabilities. All 37 tests pass against both development and production using installed Chrome. Navigation includes keyboard, repeated Escape, touch/history, no-JavaScript fallback, direct routes, active links, seven responsive widths and sticky skip-link checks. Desktop and 320px open-menu screenshots were reviewed.

Use PLAYWRIGHT_CHANNEL=chrome locally when the Playwright download is unavailable. CI installs Chromium. ESLint 9 remains a documented Next.js plugin compatibility exception. Physical-device, screen-reader and Safari/Firefox testing remain later-phase QA.

Next task: Phase 4, 3D canvas and fallback. Start on a new branch from updated main after the Phase 3 PR is reviewed and merged. Use ✅ for completed phases and ⬜ for pending phases. Do not merge without user authorization.

Approved product content, licensed 3D assets, payment decisions and a deployment domain remain outstanding. Vercel previews use vercel.json's Next.js preset/default output; local .vercel metadata is ignored.
