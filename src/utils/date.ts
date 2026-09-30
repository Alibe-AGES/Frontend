const NON_DIGITS_REGEX = /\D/g;
const DATE_REGEX = /^(\d{2})\/(\d{2})\/(\d{4})$/;

export const DATE_LENGTH = 10;

// Mantem o texto digitado sempre no formato DD/MM/AAAA enquanto o usuario escreve.
export function maskDate(text: string): string {
  const digits = text.replace(NON_DIGITS_REGEX, '').slice(0, 8);

  if (digits.length <= 2) {
    return digits;
  }
  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }

  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function parseDate(date: string): Date | null {
  const match = DATE_REGEX.exec(date);
  if (!match) {
    return null;
  }

  const [, day, month, year] = match.map(Number);
  const parsed = new Date(year, month - 1, day);
  const isSameDay =
    parsed.getFullYear() === year && parsed.getMonth() === month - 1 && parsed.getDate() === day;

  return isSameDay ? parsed : null;
}

export function isValidDate(date: string): boolean {
  return parseDate(date) !== null;
}

export const DAY_MONTH_LENGTH = 5;

// Mesma mascara, limitada a DD/MM (o ano e inferido em `parseDayMonth`).
export function maskDayMonth(text: string): string {
  return maskDate(text).slice(0, DAY_MONTH_LENGTH);
}

// Usa o ano atual; se o dia ja passou, assume o proximo ano.
export function parseDayMonth(dayMonth: string, today: Date = new Date()): Date | null {
  const year = today.getFullYear();
  const date = parseDate(`${dayMonth}/${String(year)}`);
  if (!date) {
    return null;
  }

  const startOfToday = new Date(year, today.getMonth(), today.getDate());
  return date < startOfToday ? parseDate(`${dayMonth}/${String(year + 1)}`) : date;
}
