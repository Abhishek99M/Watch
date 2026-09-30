import { Mesh, MeshStandardMaterial, type Material } from 'three';
import { dialTones, isDialTone, type DialTone } from '../data/watch-configuration';
import type { LoadedWatch } from './model-loader';

/** Owns only the reviewed dial material slot; textures and transforms are borrowed. */
export function createWatchConfiguration(asset: LoadedWatch) {
  if (!asset.studioTransform) return null;
  const slots: { mesh: Mesh; index: number; original: MeshStandardMaterial }[] = [];
  for (const group of asset.components.Dial ?? []) group.traverse(object => {
    if (!(object instanceof Mesh)) return;
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.forEach((material, index) => {
      if (material instanceof MeshStandardMaterial && material.name === 'Black sunray dial' && material.map) {
        slots.push({ mesh: object, index, original: material });
      }
    });
  });
  // V11 has exactly one textured dial-face slot. Fail closed on another mapping.
  if (slots.length !== 1) return null;
  const { mesh, index, original } = slots[0];
  const originalAssignment: Material | Material[] = mesh.material;
  let tinted: MeshStandardMaterial | null = null, current: DialTone = 'charcoal', disposed = false;
  return {
    get value() { return current; },
    select(value: DialTone) {
      if (disposed) throw new Error('Configuration is disposed');
      if (!isDialTone(value)) throw new Error('Unsupported dial tone');
      if (value === current) return;
      if (value === 'charcoal') mesh.material = originalAssignment;
      else {
        tinted ??= original.clone();
        // glTF factors and these multipliers are linear. Preserve every texture,
        // roughness/normal/anisotropy value and the original material object.
        const [r, g, b] = dialTones[value].tint;
        tinted.color.copy(original.color);
        tinted.color.r *= r; tinted.color.g *= g; tinted.color.b *= b;
        if (Array.isArray(originalAssignment)) {
          const assignment = [...originalAssignment]; assignment[index] = tinted; mesh.material = assignment;
        } else mesh.material = tinted;
      }
      current = value;
    },
    dispose() {
      if (disposed) return;
      mesh.material = originalAssignment; current = 'charcoal'; disposed = true;
      // Shared imported textures are disposed later by the asset owner.
      tinted?.dispose();
    },
  };
}
