import { getMenuPlacement } from './dropdown.utils';

const SCREEN = { height: 800, topInset: 40, bottomInset: 20 };
const TRIGGER_SIZE = { x: 100, width: 160, height: 40 };

describe('getMenuPlacement', () => {
  test('opens below the trigger when the menu fits there', () => {
    const placement = getMenuPlacement({ ...TRIGGER_SIZE, y: 200 }, 150, SCREEN);

    expect(placement).toEqual({ direction: 'down', offset: 240, maxHeight: 532 });
  });

  test('opens above the trigger near the bottom of the screen', () => {
    const placement = getMenuPlacement({ ...TRIGGER_SIZE, y: 680 }, 150, SCREEN);

    expect(placement).toEqual({ direction: 'up', offset: 120, maxHeight: 632 });
  });

  test('keeps the menu below when there is more room there, even if it must scroll', () => {
    const placement = getMenuPlacement({ ...TRIGGER_SIZE, y: 300 }, 900, SCREEN);

    expect(placement.direction).toBe('down');
    expect(placement.maxHeight).toBe(432);
  });

  test('limits an upward menu to the room above the trigger', () => {
    const placement = getMenuPlacement({ ...TRIGGER_SIZE, y: 500 }, 900, SCREEN);

    expect(placement.direction).toBe('up');
    expect(placement.maxHeight).toBe(452);
  });

  test('never returns a negative max height', () => {
    const placement = getMenuPlacement({ ...TRIGGER_SIZE, y: 790 }, 150, {
      height: 800,
      topInset: 800,
      bottomInset: 0,
    });

    expect(placement.maxHeight).toBe(0);
  });
});
