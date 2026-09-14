export const GROUP_COLOR_PALETTE = [
  'bg-lime',
  'bg-coral',
  'bg-pink',
  'bg-lime-soft',
  'bg-coral-soft',
] as const;

export type GroupColor = (typeof GROUP_COLOR_PALETTE)[number];

export function getRandomGroupColor(): GroupColor {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  const randomIndex = array[0] % GROUP_COLOR_PALETTE.length;
  return GROUP_COLOR_PALETTE[randomIndex];
}
