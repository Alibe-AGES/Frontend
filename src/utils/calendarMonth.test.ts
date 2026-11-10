import { resolveCalendarMonth } from './calendarMonth';

const TODAY = new Date(2026, 10, 8);

describe('resolveCalendarMonth', () => {
  test('uses the month and year from the params', () => {
    expect(resolveCalendarMonth('10', '2026', TODAY)).toEqual({ month: 10, year: 2026 });
  });

  test('falls back to the current month and year when params are missing', () => {
    expect(resolveCalendarMonth(undefined, undefined, TODAY)).toEqual({ month: 11, year: 2026 });
  });

  test('falls back to the current month and year when params are invalid', () => {
    expect(resolveCalendarMonth('13', '26', TODAY)).toEqual({ month: 11, year: 2026 });
    expect(resolveCalendarMonth('1.5', 'abc', TODAY)).toEqual({ month: 11, year: 2026 });
  });
});
