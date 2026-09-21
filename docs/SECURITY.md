# Security

Use server-side validation, authorization and price/inventory recalculation. Reject invalid IDs, wrong types, excessive payloads and unexpected fields. Rate-limit sensitive endpoints; verify payment webhooks; use proven authentication and secure cookies if accounts are added.

Ignore environment files and keep only placeholders in `.env.example`. Scan full Git history in CI. Rotate any exposed credential; deleting it is insufficient.

Audit all npm dependencies at high severity or above. Review upgrades without blindly applying forced fixes. Dependabot checks npm and GitHub Actions weekly.

Configure and test CSP against actual 3D, font and payment dependencies. Add content-type, referrer, permissions and frame protections; require HTTPS in production. Avoid verbose server errors and third-party allowances without need.

CI has read-only repository permissions by default and no deployment credentials. Pull request jobs must not use privileged pull_request_target execution. Protect main with passing checks, resolved conversations and no force pushes/deletion where the GitHub plan allows.

This project is not guaranteed unhackable. Production readiness requires failure and abuse testing and continued maintenance.

## Phase 1 dependency exception

ESLint 9.39.5 is deprecated upstream but remains required by the React, accessibility and import plugins shipped with eslint-config-next 16.3.5. ESLint 10 failed peer validation and runtime rule loading. Keep the compatible version until those plugins support ESLint 10; do not force peer overrides. The current npm audit reports zero vulnerabilities. Dependabot remains enabled.
