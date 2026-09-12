export const GROUP_COLOR_PALETTE = [
  'bg-lime',
  'bg-coral',
  'bg-pink',
  'bg-lime-soft',
  'bg-coral-soft',
] as const;

export type GroupColor = (typeof GROUP_COLOR_PALETTE)[number];

export function getRandomGroupColor(): GroupColor {
  const randomIndex = Math.floor(Math.random() * GROUP_COLOR_PALETTE.length);
  return GROUP_COLOR_PALETTE[randomIndex];
}
