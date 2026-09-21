# Watch

A premium, accessible 3D watch experience, planned with Next.js, TypeScript and React Three Fiber.

Current stage: documentation and repository automation. No application has been built yet.

Read [the product brief](docs/PRD.md), [task sequence](docs/TASKS.md), and [coding rules](docs/CODING_RULES.md) before implementation.

## Validation

Run `node scripts/check-repository.mjs`. GitHub Actions runs repository validation and secret scanning on every push and pull request. Once `package.json` exists, CI also requires an npm lockfile and lint, typecheck, test and build scripts, and rejects high/critical dependency vulnerabilities.

See [GitHub checks](docs/GITHUB_CHECKS.md) for enforcement and [test plan](docs/TEST_PLAN.md) for manual release checks. Passing CI is not a production-readiness claim.
