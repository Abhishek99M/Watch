import { existsSync, readFileSync, readdirSync } from 'node:fs';
import assert from 'node:assert/strict';

for (const file of ['README.md', '.gitignore', '.env.example', ...['PRD', 'ARCHITECTURE', 'CODING_RULES', 'UI_UX', 'TASKS', 'PROJECT_CONTEXT', 'TEST_PLAN', 'SECURITY', 'GITHUB_CHECKS'].map(name => `docs/${name}.md`)]) {
  assert(existsSync(file) && readFileSync(file, 'utf8').trim(), `Missing or empty required file: ${file}`);
}

if (existsSync('package.json')) {
  assert(existsSync('package-lock.json'), 'Commit package-lock.json for reproducible npm installs');
  const { scripts = {} } = JSON.parse(readFileSync('package.json', 'utf8'));
  for (const name of ['lint', 'typecheck', 'test', 'build']) {
    assert(typeof scripts[name] === 'string' && scripts[name].trim(), `Missing required npm script: ${name}`);
  }
} else {
  // A documentation-only repository may pass; application source may not bypass CI.
  const ignored = new Set(['.git', 'node_modules', 'scripts']);
  function checkDirectory(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (ignored.has(entry.name)) continue;
      const path = `${directory}/${entry.name}`;
      if (entry.isDirectory()) checkDirectory(path);
      else assert(!/\.(?:[cm]?[jt]sx?|html|css|glb|gltf)$/.test(entry.name), `Application file requires package.json and CI scripts: ${path}`);
    }
  }
  checkDirectory('.');
  console.log('Documentation phase: application checks are not yet applicable.');
}
console.log('Repository checks passed.');
