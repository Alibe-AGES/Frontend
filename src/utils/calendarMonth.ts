export interface CalendarMonth {
  month: number;
  year: number;
}

export function resolveCalendarMonth(
  monthParam?: string,
  yearParam?: string,
  today: Date = new Date()
): CalendarMonth {
  const parsedMonth = Number(monthParam);
  const parsedYear = Number(yearParam);

  return {
    month:
      Number.isInteger(parsedMonth) && parsedMonth >= 1 && parsedMonth <= 12
        ? parsedMonth
        : today.getMonth() + 1,
    year:
      Number.isInteger(parsedYear) && parsedYear >= 1000 && parsedYear <= 9999
        ? parsedYear
        : today.getFullYear(),
  };
}
