export const craftsmanshipDetails = {
  dial: {
    label: 'Dial', title: 'Light across the dial.',
    description: 'Fine radial lines spread across the charcoal face. Champagne-toned markers and hands stand above the darker surface.',
  },
  case: {
    label: 'Case', title: 'A quieter contrast.',
    description: 'Broad brushed-looking surfaces meet bright edges around the bezel and case. The ridged crown adds a smaller, repeated detail.',
  },
  bracelet: {
    label: 'Bracelet', title: 'Rhythm in the links.',
    description: 'Curved links repeat from the case, with satin-looking centers and brighter borders. Narrow gaps make each link distinct.',
  },
} as const;
export type CraftsmanshipView = keyof typeof craftsmanshipDetails;
export const craftsmanshipViews = Object.keys(craftsmanshipDetails) as CraftsmanshipView[];
