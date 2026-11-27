import type { CalendarMonth } from '@/utils/calendarMonth';

const MONTHS = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
];

export interface EventsPeriodTexts {
  // Short enough for one line of the dropdown.
  emptyMessage: string;
  // Longer explanation shown by the info button next to the dropdown.
  hint: string;
}

// The event list holds the completed events of one month, or of one day when opened from a day,
// so the texts name that period and tell how to pick another one.
export function describeEventsPeriod(
  { month, year }: CalendarMonth,
  selectedDate?: string
): EventsPeriodTexts {
  const [dateYear, dateMonth, dateDay] = (selectedDate ?? '').split('-').map(Number);

  if (selectedDate && dateYear && dateMonth && dateDay && MONTHS[dateMonth - 1]) {
    return {
      emptyMessage: 'Nenhum evento neste dia',
      hint: `A lista mostra os eventos que já aconteceram em ${dateDay.toString()} de ${MONTHS[dateMonth - 1]} de ${dateYear.toString()}. Para outro dia, volte e escolha o dia no calendário.`,
    };
  }

  const monthName = MONTHS[month - 1];

  return {
    emptyMessage: `Nenhum evento em ${monthName}`,
    hint: `A lista mostra os eventos que já aconteceram em ${monthName} de ${year.toString()}. Para outro mês, volte e troque o mês no calendário.`,
  };
}
