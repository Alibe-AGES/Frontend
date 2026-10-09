import { API_BASE_URL } from '@/constants';
import { ApiError } from './api';
import { authenticatedFetch } from './auth';
import { getGroupCalendar } from './calendar';
import { getGroupMembers } from './groups';

export interface CreateAvailabilityInterval {
  startTime: string;
  endTime: string;
}

export interface CreateAvailabilityPayload {
  date: string;
  intervals: CreateAvailabilityInterval[];
}

export interface AvailabilityResponse {
  id: string;
  groupId: string;
  userId: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
}

export interface AvailabilityByDateResponse {
  userId: string;
  userName: string;
  profilePic: string | null;
}

export async function createAvailability(
  groupId: string,
  payload: CreateAvailabilityPayload
): Promise<AvailabilityResponse[]> {
  const url = `${API_BASE_URL}/groups/${groupId}/availabilities`;
  const body = JSON.stringify(payload);

  console.log('[Availability] POST', url, body);

  const response = await authenticatedFetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    console.error('[Availability] POST failed', response.status, text);
    throw new ApiError(
      text || response.statusText || 'Não foi possível salvar a disponibilidade',
      response.status
    );
  }

  return (await response.json()) as AvailabilityResponse[];
}

export interface GroupAvailabilityStatus {
  id: string;
  name: string;
  profilePic: string | null;
  hasAvailability: boolean;
}

export async function getAvailabilityStatusesByDate(
  groupId: string,
  date: string
): Promise<GroupAvailabilityStatus[]> {
  const [year, month] = date.split('-').map(Number);

  if (!year || !month) {
    return [];
  }

  const [days, members] = await Promise.all([
    getGroupCalendar(groupId, month, year),
    getGroupMembers(groupId),
  ]);

  const day = days.find((item) => item.date === date);

  const availableIds = new Set(day?.availableUserIds ?? []);

  return members.map((member) => ({
    id: member.id,
    name: member.name,
    profilePic: member.profilePic,
    hasAvailability: availableIds.has(member.id),
  }));
}
