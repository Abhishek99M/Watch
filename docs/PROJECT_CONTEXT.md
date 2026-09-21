# Project context

Phases 0 through 4 are complete. The project uses Next.js 16.3.5, React 19.2.8, strict TypeScript, Tailwind 4, ESLint and an npm lockfile.

Phase 2 supplies shared tokens, buttons/links, headings, badges, product cards and feedback states. The /design-system reference is noindex and uses illustrative content. See DESIGN_SYSTEM.md.

Phase 3 adds the shared sticky header, home wordmark and The watch / Our story / Cart destinations. Mobile uses a native nonmodal disclosure with keyboard support, Escape/focus return, outside-click/focus-leave dismissal and breakpoint/route reset. Basic toggling and link navigation work without JavaScript. See NAVIGATION.md.

Phase 4 adds an opt-in, lazy-loaded React Three Fiber lighting study to /watch: perspective camera, ambient/hemisphere/directional lights, responsive framing, capped pixel density and demand rendering. Static SVG, loading deadline, safe error boundaries, WebGL/context-loss recovery and retry preserve useful content. The scene stays still for reduced motion. See THREE_FOUNDATION.md.

The /story and /cart pages remain navigation shells. Watch models, product storytelling, specifications, cart state and checkout are not implemented. No product facts or cart quantities have been fabricated.

Validation: repository integrity, lint, type checks, production build and npm audit pass with zero vulnerabilities. All 46 tests pass against both development and production using installed Chrome. Nine 3D tests cover rendering, no WebGL, draw errors, context loss/retry, slow/failed chunks, no JavaScript, seven responsive widths, no continuous drawing and repeated mount/exit. Desktop and 320px screenshots were reviewed. One initial development navigation timeout did not reproduce; the navigation suite and full rerun passed unchanged.

Use PLAYWRIGHT_CHANNEL=chrome locally when the Playwright download is unavailable. CI installs Chromium. Browser tests use SwiftShader; physical-device, screen-reader and Safari/Firefox testing remain later-phase QA. React 19.2 is required by Fiber 9.7's peer range; ESLint 9 remains a documented Next.js plugin compatibility exception.

Next task: Phase 5, placeholder watch. Start on a new branch from updated main after the Phase 4 PR is reviewed and merged. Use ✅ for completed phases and ⬜ for pending phases. Do not merge without user authorization.

Approved product content, licensed 3D assets, payment decisions and a deployment domain remain outstanding. Vercel previews use vercel.json's Next.js preset/default output; local .vercel metadata is ignored.
