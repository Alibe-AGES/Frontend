import { API_BASE_URL } from '@/constants';
import { ApiError } from './api';

export interface CalendarDay {
  date: string;
  scheduledEventIds: string[];
  proposalIds: string[];
  availableUserIds: string[];
  completedEventIds: string[];
  allUsersAvailable: boolean;
}

export async function getGroupCalendar(
  groupId: string,
  month: number,
  year: number
): Promise<CalendarDay[]> {
  const response = await fetch(
    `${API_BASE_URL}/groups/${groupId}/calendar?month=${String(month)}&year=${String(year)}`
  );

  if (!response.ok) {
    const text = await response.text();
    throw new ApiError(
      text || response.statusText || 'Falha ao buscar o calendário do grupo',
      response.status
    );
  }

  return (await response.json()) as CalendarDay[];
}
