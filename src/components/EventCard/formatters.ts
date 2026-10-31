import { parseDayMonth } from '@/utils/date';
import { isValidTime } from '@/utils/time';
import { EventCardEvent } from './EventCard.types';

function formatAmount(value: number | string): string {
  return Number(value).toLocaleString('pt-BR', { maximumFractionDigits: 2 });
}

function hasValue(value: number | string | null | undefined): value is number | string {
  return value !== null && value !== undefined && value !== '';
}

export function formatBudget(
  budgetStart: EventCardEvent['budgetStart'],
  budgetEnd: EventCardEvent['budgetEnd']
): string | null {
  if (hasValue(budgetStart) && hasValue(budgetEnd)) {
    return `R$ ${formatAmount(budgetStart)} - ${formatAmount(budgetEnd)}`;
  }
  if (hasValue(budgetStart)) {
    return `A partir de R$ ${formatAmount(budgetStart)}`;
  }
  if (hasValue(budgetEnd)) {
    return `Até R$ ${formatAmount(budgetEnd)}`;
  }
  return null;
}

export function formatTime(timeslot: EventCardEvent['timeslot']): string | null {
  if (!timeslot) {
    return null;
  }

  const date = new Date(timeslot);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

// Combina a data (DD/MM) e o horario (HH:mm) do rascunho no `timeslot` do backend.
export function buildTimeslot(date: string, time: string, today?: Date): Date | null {
  const day = parseDayMonth(date, today);
  if (!day || !isValidTime(time)) {
    return null;
  }

  const [hours, minutes] = time.split(':').map(Number);
  day.setHours(hours, minutes, 0, 0);
  return day;
}
