# Coding rules

- Read project context, architecture and the relevant task before editing.
- Do not delete existing functionality or rewrite unrelated code.
- Do not work on multiple implementation tasks at once. Complete the first incomplete phase before starting another.
- Use small reviewable commits. Update documentation after every completed task.
- Run validation before claiming completion; record failures and manual checks honestly.
- Keep strict TypeScript and modular components. Avoid circular imports.
- Validate untrusted input on the server, use safe errors and least privilege.
- Never commit credentials or expose server-only secrets to the browser.
- Include accessibility, reduced motion and non-3D fallbacks in feature design.
- Do not deploy until the release gates in TEST_PLAN.md are satisfied.
