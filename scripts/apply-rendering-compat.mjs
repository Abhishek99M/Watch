import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import { createFiberTimer } from './compat/fiber-timer.mjs';

// Temporary, version-checked upstream compatibility fixes. Never filter console output.
const read = path => fs.readFile(path, 'utf8');
for (const [name, version] of [['three', '0.186.0'], ['@react-three/fiber', '9.7.0']]) {
  const pkg = JSON.parse(await read(`node_modules/${name}/package.json`));
  assert.equal(pkg.version, version, `Review rendering compatibility fixes before upgrading ${name}`);
}
const changes = [];
function replaceOnce(source, before, after, file) {
  if (source.includes(after)) return source;
  assert.equal(source.split(before).length, 2, `Unexpected dependency content: ${file}`);
  return source.replace(before, after);
}
for (const file of await fs.readdir('node_modules/@react-three/fiber/dist')) {
  if (!/^events-.*\.(?:esm|cjs\.dev|cjs\.prod)\.js$/.test(file)) continue;
  const path = `node_modules/@react-three/fiber/dist/${file}`;
  const source = await read(path);
  const namespace = file.includes('.esm.') ? 'THREE' : 'THREE__namespace';
  const patched = replaceOnce(source, `clock: new ${namespace}.Clock(),`,
    `clock: (${createFiberTimer.toString()})(${namespace}),`, path);
  changes.push([path, patched]);
}
assert.equal(changes.length, 3, 'Expected all three Fiber runtime bundles');
// PMREM always calls this function with V=(0,0,1). Therefore s=1 and
// t1^2+t2^2=r^2=Xi.x. The analytic identity avoids trig cancellation during
// ANGLE/D3D constant folding (X4122), keeping the same GGX sample distribution.
const before = 'float s = 0.5 * (1.0 + V.z);\n\t\t\t\tt2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;\n\n\t\t\t\t// Section 4.3: Reprojection onto hemisphere\n\t\t\t\tvec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;';
const after = '// watch: PMREM V=N, so use the exact radial identity.\n\t\t\t\tvec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - Xi.x)) * V;';
for (const path of ['node_modules/three/src/extras/PMREMGenerator.js', 'node_modules/three/build/three.module.js']) {
  const source = (await read(path)).replaceAll('\r\n', '\n');
  assert(source.includes('importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness)'), `PMREM assumption changed: ${path}`);
  changes.push([path, replaceOnce(source, before, after, path)]);
}
// Validate every target before writing any file. Re-running is safe.
for (const [path, source] of changes) await fs.writeFile(path, source);
console.log('Applied Timer and PMREM compatibility fixes (Fiber 9.7.0 / Three r186).');
