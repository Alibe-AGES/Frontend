import { getMenuLeft, getMenuMaxWidth, getMenuPlacement } from './dropdown.utils';

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

describe('getMenuMaxWidth', () => {
  test('stops at a fixed max width on regular screens', () => {
    expect(getMenuMaxWidth(411)).toBe(220);
  });

  test('keeps a margin on both sides of a narrow screen', () => {
    expect(getMenuMaxWidth(200)).toBe(184);
  });
});

describe('getMenuLeft', () => {
  const trigger = { ...TRIGGER_SIZE, y: 200 };

  test('centers a menu wider than the trigger under it', () => {
    expect(getMenuLeft(trigger, 200, 400)).toBe(80);
  });

  test('lines up a menu as wide as the trigger with it', () => {
    expect(getMenuLeft(trigger, 160, 400)).toBe(100);
  });

  test('moves the menu back inside the right edge', () => {
    expect(getMenuLeft({ ...trigger, x: 300 }, 220, 400)).toBe(172);
  });

  test('moves the menu back inside the left edge', () => {
    expect(getMenuLeft({ ...trigger, x: 0 }, 220, 400)).toBe(8);
  });
});
