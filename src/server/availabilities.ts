import { API_BASE_URL } from '@/constants';
import { ApiError } from './api';

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

export async function createAvailability(
  groupId: string,
  payload: CreateAvailabilityPayload
): Promise<AvailabilityResponse[]> {
  const url = `${String(API_BASE_URL)}/groups/${groupId}/availabilities`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new ApiError(
      text || response.statusText || 'Não foi possível salvar a disponibilidade',
      response.status
    );
  }

  return (await response.json()) as AvailabilityResponse[];
}
