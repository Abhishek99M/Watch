/** Illustrative tints of the existing dial texture, never product variants. */
export const dialTones = {
  charcoal: { label: 'Charcoal', swatch: '#292b2b', tint: [1, 1, 1] },
  midnight: { label: 'Midnight blue', swatch: '#263f59', tint: [0.35, 0.62, 1] },
  forest: { label: 'Forest green', swatch: '#294c3a', tint: [0.38, 0.85, 0.57] },
} as const;
export type DialTone = keyof typeof dialTones;
export const dialToneKeys = Object.keys(dialTones) as DialTone[];
export function isDialTone(value: unknown): value is DialTone {
  return typeof value === 'string' && Object.hasOwn(dialTones, value);
}
