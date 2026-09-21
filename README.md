# Watch

A premium, accessible 3D watch experience built in phases.

Phase 1 provides Next.js App Router, React, strict TypeScript, Tailwind CSS and ESLint. The homepage is a foundation placeholder; the design system, watch model, 3D story and commerce features follow in later phases.

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
