# GitHub checks and enforcement

CI runs on every push, pull request, manual dispatch and weekly schedule. The stable aggregate check is `Required checks`; it fails if repository/application validation or secret scanning fails or is skipped.

Actions are pinned to immutable commits, permissions default to read-only, checkout does not retain credentials, and full history is scanned for secrets. Dependabot checks Actions and npm weekly (npm becomes applicable when its manifest exists).

Application checks activate when package.json exists: npm ci, lint, typecheck, tests, production build and high/critical dependency audit. Adding application files without a manifest is rejected. Code review must reject placeholder test scripts. Future application phases should add browser, accessibility and server abuse tests for implemented features.

## Enforcement limitation

GitHub returned HTTP 403 when checking rulesets for this private repository: upgrade to GitHub Pro or make the repository public to enable the feature. Visibility has not been changed. CI reports failures but cannot prevent direct pushes or merges without enforceable branch protection.

When supported, protect main with a pull request requirement, resolved conversations, up-to-date `Required checks`, blocked deletion and blocked force pushes. Keep this limitation visible until the remote rule is actually verified.

## Local use

Run `node scripts/check-repository.mjs` before commits. Once the app exists, also run the application CI commands above. Do not treat automated success as a substitute for the manual release tests.
