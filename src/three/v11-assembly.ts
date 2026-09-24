import type { ComponentRole } from './model-definition';
import type { LoadedWatch } from './model-loader';
import { createExplodedAssembly, type AssemblyPart } from './exploded-assembly';

/** Open the enclosure before lifting the face and revealing the movement. */
const intervals: Partial<Record<ComponentRole, readonly [number, number]>> = {
  Crystal: [0, 0.55], Bezel: [0.05, 0.6], Crown: [0, 0.4], Caseback: [0, 0.6],
  SecondHand: [0.15, 0.8], MinuteHand: [0.2, 0.85], HourHand: [0.25, 0.9],
  Dial: [0.3, 0.95], Movement: [0.4, 1],
};

export function createV11Assembly(asset: LoadedWatch) {
  const parts: AssemblyPart[] = [];
  for (const [role, objects] of Object.entries(asset.components)) for (const object of objects) {
    const offset: unknown = object.userData.explodeOffset;
    if (object.userData.role !== role || typeof object.userData.component !== 'string' ||
        !Array.isArray(offset) || offset.length !== 3 || !offset.every(value => typeof value === 'number' && Number.isFinite(value) && Math.abs(value) <= 100)) throw new Error('Invalid V11 assembly metadata');
    parts.push({ object, offset: offset as [number, number, number], interval: intervals[role as ComponentRole] ?? [0, 1] });
  }
  if (parts.length !== 43) throw new Error('V11 assembly requires all 43 mapped groups');
  return createExplodedAssembly(parts);
}
