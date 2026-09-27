# GitHub checks and enforcement

CI runs on every push, pull request, manual dispatch and weekly schedule. The stable aggregate check is `Required checks`; it fails if repository/application validation, any browser matrix job or secret scanning fails, is cancelled or is skipped.

Actions are pinned to immutable commits, permissions default to read-only, checkout does not retain credentials, and full history is scanned for secrets. Dependabot checks Actions and npm weekly (npm becomes applicable when its manifest exists).

Application checks activate when package.json exists: npm ci, lint, typecheck, tests, production build and high/critical dependency audit. Adding application files without a manifest is rejected. Code review must reject placeholder test scripts. Future application phases should add browser, accessibility and server abuse tests for implemented features.

## Enforcement limitation

GitHub returned HTTP 403 when checking rulesets for this private repository: upgrade to GitHub Pro or make the repository public to enable the feature. Visibility has not been changed. CI reports failures but cannot prevent direct pushes or merges without enforceable branch protection.

When supported, protect main with a pull request requirement, resolved conversations, up-to-date `Required checks`, blocked deletion and blocked force pushes. Keep this limitation visible until the remote rule is actually verified.

## Local use

Run `node scripts/check-repository.mjs` before commits. Once the app exists, also run the application CI commands above. Do not treat automated success as a substitute for the manual release tests.

## Phase 1 implementation

The application CI contract is now active. CI installs Playwright Chromium and runs ten browser tests against the development server, builds the app, and repeats those tests against the production server before the dependency audit. No placeholder test scripts are used.


## Phase 9 CI isolation

The first Phase 9 runs reached the 30-minute application job limit while running
all development and production tests sequentially. Development completed with
76 passes and one retried browser-context setup failure; production was cancelled
near its end. The required gate correctly rejected the cancelled job.

Static validation and the dependency audit now run separately from four browser
jobs: development/core, development/movement, production/core and
production/movement. Core runs all tests except movement.spec.ts (currently 74);
movement runs that file (currently 3). Each mode still covers all 77 tests.
Default local `npm test` continues to run the entire suite.

The movement workload has a fresh browser process rather than sharing Chromium
with the following navigation test. In the failed runs, that test timed out during
browser.newContext after movement and passed immediately on retry. Browser
resource pressure is suspected, not proven; no navigation assertion was weakened.
Each browser job keeps one CI worker, existing retries and a 30-minute budget.
Production jobs build before testing. Matrix fail-fast is disabled; failures retain
Playwright traces in seven-day artifacts. The required gate depends on every job.
No application code, render quality, model asset or loading deadline changed.


## Phase 10 browser partition

The original core and movement isolation is preserved. A third `craftsmanship`
partition runs the five Phase 10 tests in its own browser process for each mode.
Each full development/production run now contains 82 tests: 74 core, 3 movement
and 5 craftsmanship. The six browser jobs share the same 30-minute individual
budget, one worker, existing retries and failure artifacts; every job is required
by the unchanged aggregate gate. Default local `npm test` still selects all tests.
