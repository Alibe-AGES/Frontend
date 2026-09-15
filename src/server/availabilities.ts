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

export interface GroupParticipant {
  id: string;
  name: string;
  profilePic: string | null;
}

// Tipagem que prevê tanto um array direto quanto um objeto com a lista
type AvailabilityResponseData =
  | GroupParticipant[]
  | {
      participants?: GroupParticipant[];
      members?: GroupParticipant[];
    };

export async function getAvailabilitiesByDate(
  groupId: string,
  date: string
): Promise<GroupParticipant[]> {
  const response = await fetch(`${API_BASE_URL}/groups/${groupId}/availabilities?date=${date}`);

  console.log('Status da resposta:', response.status);
  if (!response.ok) {
    if (response.status === 404) {
      return [];
    }
    throw new Error('Falha ao buscar participantes');
  }

  const data = (await response.json()) as AvailabilityResponseData;

  if (Array.isArray(data)) {
    return data;
  }

  return data.participants ?? data.members ?? [];
}
