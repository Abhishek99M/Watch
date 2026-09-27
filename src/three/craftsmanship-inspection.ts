import { Box3, Vector3, type PerspectiveCamera } from 'three';
import type { CraftsmanshipView } from '../data/craftsmanship';
import type { LoadedWatch } from './model-loader';
import { frameAssembly } from './exploded-assembly';

/** Camera-only studies of mapped V11 surfaces. Nothing is hidden or recolored. */
export function createCraftsmanshipInspection(asset: LoadedWatch) {
  const named = (role: keyof LoadedWatch['components'], names: string[]) =>
    names.map(name => asset.components[role]?.find(object => object.name === name));
  const focuses = {
    dial: [...named('Dial', ['dial']), ...named('Bezel', ['bezel'])],
    case: [...named('Case', ['case']), ...named('Crown', ['crown']), ...named('Bezel', ['bezel'])],
    bracelet: named('Strap', ['end_link_lower', 'bracelet_lower_01', 'bracelet_lower_02', 'bracelet_lower_03']),
  };
  if (Object.values(focuses).some(parts => parts.some(part => !part))) return null;
  const directions = {
    dial: new Vector3(0.12, 0.22, 1.5),
    case: new Vector3(1.1, 0.35, 0.9),
    bracelet: new Vector3(0.55, -0.7, 1.3),
  };
  return {
    frame(view: CraftsmanshipView, camera: PerspectiveCamera, target: Vector3) {
      asset.object.updateMatrixWorld(true);
      const bounds = new Box3();
      for (const part of focuses[view]) bounds.union(new Box3().setFromObject(part!, true));
      if (bounds.isEmpty()) return;
      frameAssembly(camera, bounds, target, directions[view]);
    },
  };
}
