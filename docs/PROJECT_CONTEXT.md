# Project context

Phases 0 through 6 are merged. Phase 7 is implemented on feat/phase-7-exploded-view and awaits PR review and explicit merge approval. The project uses Next.js 16.3.5, React 19.2.8, strict TypeScript, Tailwind 4, ESLint and an npm lockfile.

Phase 2 supplies shared tokens, buttons/links, headings, badges, product cards and feedback states. The /design-system reference is noindex and uses illustrative content. See DESIGN_SYSTEM.md.

Phase 3 adds the shared sticky header, home wordmark and The watch / Our story / Cart destinations. Mobile uses a native nonmodal disclosure with keyboard support, Escape/focus return, outside-click/focus-leave dismissal and breakpoint/route reset. Basic toggling and link navigation work without JavaScript. See NAVIGATION.md.

Phase 4 provides the opt-in, lazy-loaded React Three Fiber canvas on /watch: perspective camera, ambient/hemisphere/directional lights, responsive framing, capped pixel density and demand rendering. Static SVG, loading deadline, safe error boundaries, WebGL/context-loss recovery and retry preserve useful content. See THREE_FOUNDATION.md.

Phase 5 replaces the faceted study with an assembled procedural watch: case, caseback, bezel, dial, markers, fixed hands, crystal, crown, lugs and strap segments. An inline watch illustration and caption clearly identify placeholder design/materials/proportions. The scene stays still for all users, including reduced motion. No new dependencies or asset downloads were added. See PLACEHOLDER_WATCH.md.

The /story and /cart pages remain navigation shells. The selected GLB is integrated; product storytelling, specifications, cart state and checkout are not implemented. No product facts or cart quantities have been fabricated.

Phase 5 validation: repository integrity, lint, type checks, production build and npm audit pass with zero vulnerabilities. All 46 tests pass against both development and production using installed Chrome. Scene tests cover successful rendering without model/image asset requests, prototype labeling, no WebGL, draw errors, context loss/retry, slow/failed chunks, no JavaScript, seven responsive widths, no continuous drawing and repeated mount/exit. Production 1440px and 320px screenshots of both 3D and static views were reviewed.

Use PLAYWRIGHT_CHANNEL=chrome locally when the Playwright download is unavailable. CI installs Chromium. Browser tests use SwiftShader; physical-device, screen-reader and Safari/Firefox testing remain later-phase QA. React 19.2 is required by Fiber 9.7's peer range; ESLint 9 remains a documented Next.js plugin compatibility exception. The upstream Fiber/Three.js Clock deprecation warning remains documented.

Phase 6 is complete as of 2026-09-24. The user selected original Aurel Veil V11. Its 13,618,624-byte master is preserved in prototypes/atelier/model-study-v11; the website uses a separate 8,274,880-byte derivative. All 291,094 triangles, 43 groups, original group transforms, embedded second-hand animation and decoded texture pixels remain. See MODEL_PIPELINE.md, WATCH_ASSET_VALIDATION.json and public/ASSET-CREDITS.md.

Visual-parity correction: the first integration passed functional tests but missed V11's camera, lighting and resolution. The corrected `aurel-veil-v11` presentation profile now transforms the original studio rig through model normalization, restores V11's 1.5-2 DPR and 1.25 glass transmission resolution, and adds drag/touch/keyboard orbit, zoom and Reset. No automatic motion was added. Controlled captures closely match V11: mean absolute channel difference 0.0184/255; optimized-versus-master 0.0129/255; Reset is pixel-identical. See docs/watch-validation/README.md. The upstream Clock warning remains; the unsupported shadow mode was corrected without hiding warnings.

The opt-in preview now uses a bounded local CC0 studio HDR, area-light fill and explicit environment cleanup. The initial/no-JavaScript view uses the selected-watch studio render; procedural fallback remains available. Responsive canvas sizing, retries, context loss and demand rendering are covered. Website playback and cinematic scroll remain later phases; the source viewer retains manual playback and assembly inspection.

Final repository checks, lint, strict types, production build and dependency audit pass (zero vulnerabilities). All 62 production browser tests pass in installed Chrome with SwiftShader. Development coverage passed after targeted rechecks of canvas resizing and a transient navigation timeout. Real-model checks cover seven widths, opt-in downloads, reopen/retry, context loss, route exit and failed studio lighting. Desktop/phone captures were reviewed. Physical-device performance and Safari/Firefox/screen-reader QA remain later gates.

V1-V10 and historical migration helpers are archived intact in prototypes/atelier/archive/2026-09-24, with an inventory of 6,405 preserved study files. No old study assets were deleted. V11 owns its loader/exporter/controls dependencies; shared Three.js modules remain in atelier/assets/vendor. Reference-watch and comparison links were verified after archiving. Portable Blender remains in archived V3's .tools directory.

Phase 6 was merged through PR #8. Phase 7 uses the actual 43-group mapping and preserved home transforms; see EXPLODED_VIEW.md. Phase 8 cinematic scrolling starts only after Phase 7 review. The Phase 7 PR must remain open until the user explicitly authorizes merging.

Approved product content, payment decisions and a deployment domain remain outstanding. Vercel previews use vercel.json's Next.js preset/default output; local .vercel metadata is ignored.


## Rendering warning correction - 2026-09-24

Supersedes the earlier remaining-warning notes: the website now uses a
version-checked, install-time Timer compatibility adapter for Fiber 9.7.0 and an
analytic simplification of Three r186 PMREM sampling. Diagnostics remain enabled.
On Intel Iris Xe / ANGLE Direct3D11, the unmodified V11 viewer reproduced the exact
X4122 warning; the patched production website emitted neither X4122 nor Clock
warnings. The controlled reference/website mean RGB difference was 0.0175 on a
0-255 channel scale; drag, pinch, keyboard, zoom and exact reset passed.
See [Rendering compatibility](RENDERING_COMPATIBILITY.md) for causes, maintenance,
tests and the development-server restart requirement. This does not alter the
GLB or advance the project beyond Phase 6.


## Phase 7 implementation

The optional V11 preview has a labeled separation slider and Separate/Reassemble
buttons below the canvas. A standalone controller evaluates staged translations
from immutable home transforms. Eleven authored groups move while the case and
bracelet remain anchored; all 43 mapped groups are validated and restored exactly.
Camera framing is separate and preserves the original assembled V11 view. No
scroll listeners, autoplay, new dependencies or changes to the approved GLB were
introduced. Context loss, static view, retry and route exit retain existing recovery.
See EXPLODED_VIEW.md and assembly-validation/ for implementation and evidence.
