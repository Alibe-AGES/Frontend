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
  location?: string;
  locationId?: string;
  matchedSuggestionId?: string;
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

export interface ProposalResponseResult {
  id: string;
  proposalId: string;
  userId: string;
  answer: ProposalAnswer;
  createdAt: string;
  matched: boolean;
}

export async function respondToSuggestion(
  proposalId: string,
  answer: EventPresenceAnswer,
  hasExistingResponse: boolean
): Promise<ProposalResponseResult> {
  const method = hasExistingResponse ? 'PATCH' : 'POST';
  const suffix = hasExistingResponse ? '/me' : '';
  const response = await authenticatedFetch(
    `${API_BASE_URL}/api/proposals/${proposalId}/responses${suffix}`,
    {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answer }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new ApiError(
      text || response.statusText || 'Não foi possível responder à sugestão',
      response.status
    );
  }
  return (await response.json()) as ProposalResponseResult;
}

export interface ProposalDetailsResponse {
  id: string;
  type: 'suggestion' | 'event';
  groupId: string;
  eventId: string | null;
  name: string | null;
  createdAt: string;
  matchedAt: string | null;
  matched: boolean;
  owner: { id: string; name: string; image: string | null };
  location: CreatedProposal['location'] | null;
  myAnswer: ProposalAnswer | null;
}

export async function getProposalDetails(proposalId: string): Promise<ProposalDetailsResponse> {
  const response = await authenticatedFetch(`${API_BASE_URL}/api/proposals/${proposalId}`);
  if (!response.ok) {
    const text = await response.text();
    throw new ApiError(
      text || response.statusText || 'Não foi possível carregar a sugestão',
      response.status
    );
  }
  return (await response.json()) as ProposalDetailsResponse;
}

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

export interface CreateProposalFields {
  locationId?: string;
  externalId?: string;
  name: string;
  address: string;
  description?: string;
}

export type CreateProposalInput = CreateProposalFields;

export interface CreatedProposal {
  id: string;
  type: 'suggestion';
  groupId: string;
  name: string | null;
  createdAt: string;
  owner: {
    id: string;
    name: string;
    image: string | null;
  };
  location: {
    id: string;
    externalId: string | null;
    name: string | null;
    description: string | null;
    address: string | null;
    openingHours: string[];
    rating: number | null;
    phoneNumber: string | null;
    website: string | null;
    priceRange: { start: string | null; end: string | null; currencyCode: string | null };
    imageUrl: string | null;
    manuallyCreated: boolean | null;
  };
  myAnswer: 'yes';
  matched: boolean;
}

export interface ActiveProposal {
  id: string;
  type: 'suggestion';
  groupId: string;
  name: string | null;
  createdAt: string;
  myAnswer: ProposalAnswer | null;
  owner: CreatedProposal['owner'];
  location: CreatedProposal['location'] | null;
  responses: { yes: number; no: number; pending: number };
}

export async function getActiveProposals(groupId: string): Promise<ActiveProposal[]> {
  const response = await authenticatedFetch(`${API_BASE_URL}/api/groups/${groupId}/proposals`);
  if (!response.ok) {
    const text = await response.text();
    throw new ApiError(
      text || response.statusText || 'Não foi possível carregar as propostas',
      response.status
    );
  }
  return (await response.json()) as ActiveProposal[];
}

export async function createEvent(groupId: string, input: CreateEventInput): Promise<CreatedEvent> {
  const formData = new FormData();
  formData.append('name', input.name.trim());
  formData.append('date', input.date);
  formData.append('time', input.time);
  if (input.location) formData.append('location', input.location.trim());
  if (input.locationId) formData.append('locationId', input.locationId);
  if (input.matchedSuggestionId) {
    formData.append('matchedSuggestionId', input.matchedSuggestionId);
  }

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

export async function createProposal(
  groupId: string,
  input: CreateProposalInput
): Promise<CreatedProposal> {
  const payload: CreateProposalFields = {
    ...(input.locationId ? { locationId: input.locationId } : {}),
    ...(input.externalId ? { externalId: input.externalId } : {}),
    name: input.name.trim(),
    address: input.address.trim(),
    ...(input.description?.trim() ? { description: input.description.trim() } : {}),
  };

  const response = await authenticatedFetch(`${API_BASE_URL}/api/groups/${groupId}/proposals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new ApiError(
      text || response.statusText || 'Não foi possível criar a sugestão',
      response.status
    );
  }

  return (await response.json()) as CreatedProposal;
}
