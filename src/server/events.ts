import { API_BASE_URL } from '@/constants';
import { ApiError } from './api';
import { authenticatedFetch } from './auth';
import { appendImage, UploadImage } from './images';

export type EventStatus = 'pending' | 'confirmed' | 'declined';
export type ProposalAnswer = 'pending' | 'yes' | 'no';

export interface CreateEventInput {
  name: string;
  // YYYY-MM-DD
  date: string;
  // HH:mm
  time: string;
  location: string;
  image?: UploadImage | null;
}

export interface EventLocationResponse {
  id: string;
  description: string | null;
  manuallyCreated: boolean | null;
}

export interface CreatedEvent {
  id: string;
  name: string | null;
  date: string | null;
  time: string | null;
  image: string | null;
  budgetStart: string | null;
  budgetEnd: string | null;
  status: EventStatus;
  groupId: string;
  location: EventLocationResponse;
  createdAt: string | null;
  proposal: {
    id: string;
    ownerId: string;
    response: { id: string; userId: string; answer: ProposalAnswer };
  };
}

export interface EventDetailsResponse {
  id: string;
  name: string | null;
  date: string | null;
  time: string | null;
  image: string | null;
  budgetStart: string | null;
  budgetEnd: string | null;
  status: EventStatus;
  groupId: string;
  location: EventLocationResponse | null;
  proposal: {
    id: string;
    owner: { id: string; name: string; image: string | null };
    responses: {
      id: string;
      answer: ProposalAnswer;
      createdAt: string;
      user: { id: string; name: string; image: string | null };
    }[];
    createdAt: string;
  };
  createdAt: string | null;
  updatedAt: string;
}

export type EventPresenceAnswer = Extract<ProposalAnswer, 'yes' | 'no'>;

export async function respondToEventProposal(
  eventId: string,
  answer: EventPresenceAnswer,
  hasExistingResponse: boolean
): Promise<void> {
  const method = hasExistingResponse ? 'PATCH' : 'POST';
  const suffix = hasExistingResponse ? '/me' : '';
  const response = await authenticatedFetch(
    `${API_BASE_URL}/api/events/${eventId}/proposal/responses${suffix}`,
    {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answer }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new ApiError(
      text || response.statusText || 'Não foi possível atualizar sua resposta',
      response.status
    );
  }
}

export async function getEventDetails(eventId: string): Promise<EventDetailsResponse> {
  const response = await authenticatedFetch(`${API_BASE_URL}/api/events/${eventId}`);

  if (!response.ok) {
    const text = await response.text();
    throw new ApiError(
      text || response.statusText || 'Não foi possível carregar o evento',
      response.status
    );
  }

  return (await response.json()) as EventDetailsResponse;
}

export async function createEvent(groupId: string, input: CreateEventInput): Promise<CreatedEvent> {
  const formData = new FormData();
  formData.append('name', input.name.trim());
  formData.append('date', input.date);
  formData.append('time', input.time);
  formData.append('location', input.location.trim());

  if (input.image) {
    await appendImage(formData, 'image', input.image, 'event-image');
  }

  const response = await authenticatedFetch(`${API_BASE_URL}/groups/${groupId}/events`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new ApiError(
      text || response.statusText || 'Não foi possível criar o evento',
      response.status
    );
  }

  return (await response.json()) as CreatedEvent;
}
