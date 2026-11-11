import { API_BASE_URL } from '@/constants';
import { resolveApiImageUrl } from '@/utils/apiImageUrl';
import { ApiError } from './api';
import { authenticatedFetch } from './auth';

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

export interface DayAvailabilityUser {
  id: string;
  name: string;
  image: string | null;
  isCurrentUser: boolean;
  availableAllDay: boolean;
  intervals: [string, string][];
}

export interface DayAvailabilities {
  date: string;
  users: DayAvailabilityUser[];
}

export async function getAvailabilitiesByDate(
  groupId: string,
  date: string
): Promise<DayAvailabilities> {
  const query = new URLSearchParams({ date }).toString();
  const response = await authenticatedFetch(
    `${API_BASE_URL}/groups/${groupId}/availabilities?${query}`
  );

  if (!response.ok) {
    const text = await response.text();
    throw new ApiError(
      text || response.statusText || 'Não foi possível carregar as disponibilidades',
      response.status
    );
  }

  const data = (await response.json()) as DayAvailabilities;

  return {
    ...data,
    users: data.users.map((user) => ({ ...user, image: resolveApiImageUrl(user.image) })),
  };
}
