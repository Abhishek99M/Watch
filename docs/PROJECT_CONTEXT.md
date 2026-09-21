# Project context

The workspace and GitHub repository were empty at inspection. Phase 0 establishes the product requirements, architecture, sequential tasks, test plan and security guidance. Repository automation is being configured for pushes and pull requests.

Next task: scaffold Next.js and add real lint, typecheck, test and build scripts with an npm lockfile. There is no website, model, API or checkout yet. Application tests cannot run until those features exist.

Known dependencies: approved product content, licensed model/textures, payment integration decisions and deployment domain. Physical-device/browser and performance verification remain manual release requirements.

Foundation pushed to main; local and GitHub repository checks passed. The first scanner run exposed an upstream action root-commit range error. CI now uses the versioned Gitleaks CLI over all fetched history with release checksum verification.
