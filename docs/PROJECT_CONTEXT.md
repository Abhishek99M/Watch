# Project context

Phases 0 through 5 are complete. The project uses Next.js 16.3.5, React 19.2.8, strict TypeScript, Tailwind 4, ESLint and an npm lockfile.

Phase 2 supplies shared tokens, buttons/links, headings, badges, product cards and feedback states. The /design-system reference is noindex and uses illustrative content. See DESIGN_SYSTEM.md.

Phase 3 adds the shared sticky header, home wordmark and The watch / Our story / Cart destinations. Mobile uses a native nonmodal disclosure with keyboard support, Escape/focus return, outside-click/focus-leave dismissal and breakpoint/route reset. Basic toggling and link navigation work without JavaScript. See NAVIGATION.md.

Phase 4 provides the opt-in, lazy-loaded React Three Fiber canvas on /watch: perspective camera, ambient/hemisphere/directional lights, responsive framing, capped pixel density and demand rendering. Static SVG, loading deadline, safe error boundaries, WebGL/context-loss recovery and retry preserve useful content. See THREE_FOUNDATION.md.

Phase 5 replaces the faceted study with an assembled procedural watch: case, caseback, bezel, dial, markers, fixed hands, crystal, crown, lugs and strap segments. An inline watch illustration and caption clearly identify placeholder design/materials/proportions. The scene stays still for all users, including reduced motion. No new dependencies or asset downloads were added. See PLACEHOLDER_WATCH.md.

The /story and /cart pages remain navigation shells. The real GLB model, product storytelling, specifications, cart state and checkout are not implemented. No product facts or cart quantities have been fabricated.

Phase 5 validation: repository integrity, lint, type checks, production build and npm audit pass with zero vulnerabilities. All 46 tests pass against both development and production using installed Chrome. Scene tests cover successful rendering without model/image asset requests, prototype labeling, no WebGL, draw errors, context loss/retry, slow/failed chunks, no JavaScript, seven responsive widths, no continuous drawing and repeated mount/exit. Production 1440px and 320px screenshots of both 3D and static views were reviewed.

Use PLAYWRIGHT_CHANNEL=chrome locally when the Playwright download is unavailable. CI installs Chromium. Browser tests use SwiftShader; physical-device, screen-reader and Safari/Firefox testing remain later-phase QA. React 19.2 is required by Fiber 9.7's peer range; ESLint 9 remains a documented Next.js plugin compatibility exception. The upstream Fiber/Three.js Clock deprecation warning remains documented.

Phase 6 pipeline implementation is ready for review, but asset integration is pending. The repository has no approved watch GLB or license evidence; public/models/watch.json deliberately contains a null model. The GLTFLoader pipeline supports bounded self-contained GLB downloads, explicit source-node-index mapping, normalization, imported-resource cleanup, retry and procedural fallback. It adds no dependencies or real product asset. See MODEL_PIPELINE.md.

Pipeline validation: repository checks, lint, strict types, production build and audit pass (zero vulnerabilities). All 60 tests pass in both development and production, including 14 generated-fixture GLB tests. Production fixture screenshots were reviewed at 320px and 1440px; this does not constitute actual watch-model validation. The node-inspection tool was verified on the authored fixture.

Next task: finish Phase 6 on feat/phase-6-glb-pipeline after the user supplies an approved watch GLB and license/ownership permission. Keep Phase 6 pending until the actual model passes integrity validation. Use ✅ for completed phases and ⬜ for pending phases. Do not merge without user authorization.

Approved product content, licensed 3D assets, payment decisions and a deployment domain remain outstanding. Vercel previews use vercel.json's Next.js preset/default output; local .vercel metadata is ignored.
