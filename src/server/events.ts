import { API_BASE_URL } from '@/constants';
import { ApiError } from './api';
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

export async function createEvent(groupId: string, input: CreateEventInput): Promise<CreatedEvent> {
  const formData = new FormData();
  formData.append('name', input.name.trim());
  formData.append('date', input.date);
  formData.append('time', input.time);
  formData.append('location', input.location.trim());

  if (input.image) {
    await appendImage(formData, 'image', input.image, 'event-image');
  }

  const response = await fetch(`${API_BASE_URL}/groups/${groupId}/events`, {
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
