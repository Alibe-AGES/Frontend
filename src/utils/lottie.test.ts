import { recolorLottie } from './lottie';

const RED = [1, 0, 0, 1];
const BLUE = [0, 0, 1, 1];

const paint = (ty: string, color: number[]) => ({ ty, c: { a: 0, k: color } });

describe('recolorLottie', () => {
  test('recolors fills and strokes nested inside layers and groups', () => {
    const animation = {
      layers: [{ shapes: [{ ty: 'gr', it: [paint('fl', RED), paint('st', RED)] }] }],
    };

    expect(recolorLottie(animation, { '#FF0000': '#0000FF' })).toEqual({
      layers: [{ shapes: [{ ty: 'gr', it: [paint('fl', BLUE), paint('st', BLUE)] }] }],
    });
  });

  test('swaps two colors without replacing the same shape twice', () => {
    const animation = [paint('fl', RED), paint('fl', BLUE)];

    expect(recolorLottie(animation, { '#FF0000': '#0000FF', '#0000FF': '#FF0000' })).toEqual([
      paint('fl', BLUE),
      paint('fl', RED),
    ]);
  });

  test('keeps colors outside the palette and the original alpha', () => {
    const translucentRed = [1, 0, 0, 0.5];
    const animation = [paint('fl', translucentRed), paint('fl', BLUE)];

    expect(recolorLottie(animation, { '#FF0000': '#00FF00' })).toEqual([
      paint('fl', [0, 1, 0, 0.5]),
      paint('fl', BLUE),
    ]);
  });

  test('ignores color-like values on shapes that are not paints', () => {
    const animation = [{ ty: 'sh', c: { k: RED } }];

    expect(recolorLottie(animation, { '#FF0000': '#0000FF' })).toEqual(animation);
  });

  test('leaves the original animation untouched', () => {
    const animation = [paint('fl', RED)];

    recolorLottie(animation, { '#FF0000': '#0000FF' });

    expect(animation).toEqual([paint('fl', RED)]);
  });
});
