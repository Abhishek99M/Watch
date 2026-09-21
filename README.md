# Watch

A premium, accessible 3D watch experience built in phases.

Phase 1 provides Next.js App Router, React, strict TypeScript, Tailwind CSS and ESLint. Phase 2 adds the shared design system. The homepage remains a foundation placeholder. Phase 3 navigation and the Phase 4 optional 3D lighting study are available; watch models, storytelling and commerce follow in later phases.

## Development

Use Node.js 22 (22.13 or newer) and npm. On Windows PowerShell, use npm.cmd/npx.cmd if script execution policy blocks npm.ps1.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. No environment variables or third-party accounts are required for this phase.

## Validation

```sh
node scripts/check-repository.mjs
npm run lint
npm run typecheck
npx playwright install chromium
npm test
npm run build
npm audit --audit-level=high
```

To exercise the production build, run TEST_PRODUCTION=1 npm test (PowerShell: set $env:TEST_PRODUCTION = '1' first, then remove it after testing). npm start serves the production build.

CI installs Chromium and runs the browser tests against both development and production servers. Tests manage their own server on port 43170, which must be free.

Read [the product brief](docs/PRD.md), [task sequence](docs/TASKS.md), [coding rules](docs/CODING_RULES.md), [GitHub checks](docs/GITHUB_CHECKS.md) and [test plan](docs/TEST_PLAN.md).

If Playwright browser downloads are unavailable locally, set PLAYWRIGHT_CHANNEL=chrome to use an installed Chrome browser. CI uses the default Playwright Chromium. See docs/SECURITY.md for the temporary ESLint compatibility limitation.

## Design system

Visit /design-system for the component reference. See [component usage and tokens](docs/DESIGN_SYSTEM.md). The homepage and 404 page share these styles; product examples in the reference are illustrative.

## Navigation

The shared header links to /watch, /story and /cart. The /watch page includes the optional lighting study; /story and /cart remain navigation shells. Product storytelling and shopping arrive in later phases. The mobile menu works without JavaScript, with enhanced Escape dismissal and focus return when JavaScript is available. See [navigation behavior](docs/NAVIGATION.md).

## 3D foundation

Visit /watch and select Load 3D preview for the static faceted lighting study. It includes responsive camera framing, lighting, loading/error recovery and an SVG alternative. Use static view to release the renderer. See [the canvas architecture](docs/THREE_FOUNDATION.md) for reduced-motion behavior and dependency compatibility.
