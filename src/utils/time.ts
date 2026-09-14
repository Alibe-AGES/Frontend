const NON_DIGITS_REGEX = /\D/g;
const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

export const TIME_LENGTH = 5;

// Mantem o texto digitado sempre no formato HH:mm enquanto o usuario escreve.
export function maskTime(text: string): string {
  const digits = text.replace(NON_DIGITS_REGEX, '').slice(0, 4);

  if (digits.length <= 2) {
    return digits;
  }

  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

export function isValidTime(time: string): boolean {
  return TIME_REGEX.test(time);
}
