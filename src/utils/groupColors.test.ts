import { GROUP_COLOR_PALETTE, getRandomGroupColor } from './groupColors';

describe('getRandomGroupColor', () => {
  test('returns a color from the palette', () => {
    const color = getRandomGroupColor();

    expect(GROUP_COLOR_PALETTE).toContain(color);
  });

  test('draws from every color in the palette over enough attempts', () => {
    const seen = new Set(Array.from({ length: 200 }, () => getRandomGroupColor()));

    expect(seen.size).toBe(GROUP_COLOR_PALETTE.length);
  });
});
