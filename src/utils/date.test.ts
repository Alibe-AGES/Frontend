import { isValidDate, maskDate, parseDate, toApiDate } from './date';

describe('maskDate', () => {
  test.each([
    ['1', '1'],
    ['1805', '18/05'],
    ['18052026', '18/05/2026'],
    ['18/05/2026999', '18/05/2026'],
    ['ab18c05', '18/05'],
  ])('masks %s as %s', (input, expected) => {
    expect(maskDate(input)).toBe(expected);
  });
});

describe('parseDate', () => {
  test('parses a valid date in local time', () => {
    expect(parseDate('18/05/2026')).toEqual(new Date(2026, 4, 18));
  });

  test('rejects impossible or incomplete dates', () => {
    expect(parseDate('31/02/2026')).toBeNull();
    expect(parseDate('18/05')).toBeNull();
    expect(isValidDate('00/00/2026')).toBe(false);
  });
});

describe('toApiDate', () => {
  test('converts a valid date to YYYY-MM-DD', () => {
    expect(toApiDate('05/10/2026')).toBe('2026-10-05');
  });

  test('returns null for invalid or incomplete dates', () => {
    expect(toApiDate('31/02/2026')).toBeNull();
    expect(toApiDate('05/10')).toBeNull();
    expect(toApiDate('')).toBeNull();
  });
});
