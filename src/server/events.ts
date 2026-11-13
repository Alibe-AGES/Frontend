import { File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';

import { API_BASE_URL } from '@/constants';
import { resolveApiImageUrl } from '@/utils/apiImageUrl';
import { getMemoryImageUrl as buildMemoryImageUrl } from '@/utils/memoryImageUrl';
import { ApiError } from './api';
import { authenticatedFetch } from './auth';
import { getAuthenticationHeaders } from './authenticated-fetch';
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

  const event = (await response.json()) as EventDetailsResponse;

  return {
    ...event,
    image: resolveApiImageUrl(event.image),
    proposal: {
      ...event.proposal,
      owner: { ...event.proposal.owner, image: resolveApiImageUrl(event.proposal.owner.image) },
      responses: event.proposal.responses.map((response) => ({
        ...response,
        user: { ...response.user, image: resolveApiImageUrl(response.user.image) },
      })),
    },
  };
}

export interface CreateProposalFields {
  locationId?: string;
  externalId?: string;
  name: string;
  address: string;
  description?: string;
}

export interface CreateProposalInput extends CreateProposalFields {
  imageUrl?: string;
}

function buildCreateProposalPayload(input: CreateProposalInput): CreateProposalFields {
  return {
    ...(input.locationId ? { locationId: input.locationId } : {}),
    ...(input.externalId ? { externalId: input.externalId } : {}),
    name: input.name.trim(),
    address: input.address.trim(),
    ...(input.description?.trim() ? { description: input.description.trim() } : {}),
  };
}

function appendProposalFields(formData: FormData, payload: CreateProposalFields): void {
  if (payload.locationId) formData.append('locationId', payload.locationId);
  if (payload.externalId) formData.append('externalId', payload.externalId);
  formData.append('name', payload.name);
  formData.append('address', payload.address);
  if (payload.description) formData.append('description', payload.description);
}

function parseProposalImageUrl(value: string): URL {
  const imageUrl = new URL(value);
  if (imageUrl.protocol !== 'https:' && imageUrl.protocol !== 'http:') {
    throw new ApiError('A imagem do local deve usar uma URL HTTP válida', 400);
  }
  return imageUrl;
}

async function appendProposalImage(formData: FormData, imageUrl: URL): Promise<() => void> {
  const isApiImage = imageUrl.origin === new URL(API_BASE_URL).origin;

  if (Platform.OS === 'web') {
    const imageResponse = isApiImage ? await authenticatedFetch(imageUrl) : await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new ApiError('Não foi possível carregar a imagem do local', imageResponse.status);
    }
    const image = await imageResponse.blob();
    const extension = image.type === 'image/png' ? 'png' : 'jpg';
    formData.append('image', image, `suggestion-image.${extension}`);
    return () => undefined;
  }

  const imageFile = new File(Paths.cache, `suggestion-image-${String(Date.now())}.jpg`);
  const downloadedImage = await File.downloadFileAsync(imageUrl.toString(), imageFile, {
    idempotent: true,
    headers: isApiImage ? await getAuthenticationHeaders() : {},
  });
  try {
    await appendImage(
      formData,
      'image',
      { uri: downloadedImage.uri, fileName: 'suggestion-image.jpg', mimeType: 'image/jpeg' },
      'suggestion-image'
    );
  } catch (error) {
    downloadedImage.delete();
    throw error;
  }
  return () => {
    downloadedImage.delete();
  };
}

async function postCreateProposal(
  url: string,
  payload: CreateProposalFields,
  remoteImageUrl?: string
): Promise<Response> {
  if (!remoteImageUrl) {
    return authenticatedFetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }

  const formData = new FormData();
  appendProposalFields(formData, payload);
  const cleanupImage = await appendProposalImage(formData, parseProposalImageUrl(remoteImageUrl));
  try {
    return await authenticatedFetch(url, { method: 'POST', body: formData });
  } finally {
    cleanupImage();
  }
}

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
  const payload = buildCreateProposalPayload(input);
  const url = `${API_BASE_URL}/api/groups/${groupId}/proposals`;
  const response = await postCreateProposal(url, payload, input.imageUrl);

  if (!response.ok) {
    const text = await response.text();
    throw new ApiError(
      text || response.statusText || 'Não foi possível criar a sugestão',
      response.status
    );
  }

  return (await response.json()) as CreatedProposal;
}

export interface EventMemoryResponse {
  id: string;
  picture: string;
  eventId: string;
}

export function getMemoryImageUrl(memory: EventMemoryResponse): string {
  return buildMemoryImageUrl(memory);
}

export async function getEventMemories(eventId: string): Promise<EventMemoryResponse[]> {
  const response = await authenticatedFetch(`${API_BASE_URL}/api/events/${eventId}/memories`);

  if (!response.ok) {
    const text = await response.text();
    throw new ApiError(
      text || response.statusText || 'Não foi possível carregar as memórias do evento',
      response.status
    );
  }

  return (await response.json()) as EventMemoryResponse[];
}
