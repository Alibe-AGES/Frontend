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
