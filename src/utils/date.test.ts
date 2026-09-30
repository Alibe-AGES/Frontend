import { isValidDate, maskDate, maskDayMonth, parseDate, parseDayMonth } from './date';

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

describe('maskDayMonth', () => {
  test('keeps only DD/MM', () => {
    expect(maskDayMonth('18052026')).toBe('18/05');
    expect(maskDayMonth('1')).toBe('1');
  });
});

describe('parseDayMonth', () => {
  const today = new Date(2026, 8, 29);

  test('uses the current year for today or future days', () => {
    expect(parseDayMonth('29/09', today)).toEqual(new Date(2026, 8, 29));
    expect(parseDayMonth('18/12', today)).toEqual(new Date(2026, 11, 18));
  });

  test('rolls past days over to the next year', () => {
    expect(parseDayMonth('18/05', today)).toEqual(new Date(2027, 4, 18));
  });

  test('rejects invalid or incomplete values', () => {
    expect(parseDayMonth('32/01', today)).toBeNull();
    expect(parseDayMonth('18/0', today)).toBeNull();
  });
});
