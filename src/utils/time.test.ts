import { isValidTime, maskTime } from './time';

describe('maskTime', () => {
  test('keeps up to two digits without a separator', () => {
    expect(maskTime('')).toBe('');
    expect(maskTime('0')).toBe('0');
    expect(maskTime('09')).toBe('09');
  });

  test('adds the separator after the hour', () => {
    expect(maskTime('093')).toBe('09:3');
    expect(maskTime('0930')).toBe('09:30');
  });

  test('ignores everything that is not a digit', () => {
    expect(maskTime('09:30')).toBe('09:30');
    expect(maskTime('9h30m')).toBe('93:0');
  });

  test('stops at four digits', () => {
    expect(maskTime('0930456')).toBe('09:30');
  });
});

describe('isValidTime', () => {
  test('accepts times inside the 24 hour range', () => {
    expect(isValidTime('00:00')).toBe(true);
    expect(isValidTime('09:30')).toBe(true);
    expect(isValidTime('23:59')).toBe(true);
  });

  test('rejects out of range or incomplete times', () => {
    expect(isValidTime('')).toBe(false);
    expect(isValidTime('9:30')).toBe(false);
    expect(isValidTime('24:00')).toBe(false);
    expect(isValidTime('12:60')).toBe(false);
    expect(isValidTime('0930')).toBe(false);
  });
});
