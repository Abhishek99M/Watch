export const componentRoles = ['Case', 'Bezel', 'Crystal', 'Dial', 'HourHand', 'MinuteHand', 'SecondHand', 'Crown', 'Movement', 'Rotor', 'Gears', 'Caseback', 'Strap'] as const;
export type ComponentRole = typeof componentRoles[number];
export type ModelDefinition = {
  url: string;
  source: string;
  license: string;
  components: Partial<Record<ComponentRole, number[]>>;
  rotation: [number, number, number];
  presentation?: 'aurel-veil-v11';
};

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Repository-authored configuration; asset approval is a separate human review. */
export function parseModelDefinition(value: unknown): ModelDefinition | null {
  if (!record(value) || !('model' in value)) throw new Error('Invalid model manifest');
  if (value.model === null) return null;
  const model = value.model;
  if (!record(model) || typeof model.url !== 'string' || !/^\/models\/[a-zA-Z0-9_-]+\.glb$/.test(model.url)) throw new Error('Model must be a local GLB');
  if (typeof model.source !== 'string' || !model.source.trim() || typeof model.license !== 'string' || !model.license.trim()) throw new Error('Asset provenance is required');
  if (!record(model.components)) throw new Error('Component mapping is required');
  const components: ModelDefinition['components'] = {};
  const used = new Set<number>();
  for (const [role, indices] of Object.entries(model.components)) {
    if (!componentRoles.includes(role as ComponentRole) || !Array.isArray(indices) || !indices.length) throw new Error('Invalid component mapping');
    for (const index of indices) {
      if (!Number.isSafeInteger(index) || index < 0 || used.has(index)) throw new Error('Invalid or reused node index');
      used.add(index);
    }
    components[role as ComponentRole] = indices;
  }
  if (!components.Case || !components.Dial) throw new Error('Case and Dial mappings are required');
  const rotation = model.rotation ?? [0, 0, 0];
  if (!Array.isArray(rotation) || rotation.length !== 3 || !rotation.every(angle => typeof angle === 'number' && Number.isFinite(angle))) throw new Error('Invalid model orientation');
  if (model.presentation !== undefined && model.presentation !== 'aurel-veil-v11') throw new Error('Unknown presentation');
  return { presentation: model.presentation as ModelDefinition['presentation'], url: model.url, source: model.source, license: model.license, components, rotation: rotation as [number, number, number] };
}
