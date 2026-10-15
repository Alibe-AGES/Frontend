import { API_BASE_URL } from '@/constants';
import { File } from 'expo-file-system';
import { ApiError } from './api';
import { authenticatedFetch } from './auth';
import { createEvent, getEventDetails, respondToEventProposal } from './events';

jest.mock('./auth', () => ({
  authenticatedFetch: jest.fn((url: string, options?: RequestInit) => fetch(url, options)),
}));

declare const global: { fetch: jest.Mock };

const originalFetch = global.fetch;
const mockAuthenticatedFetch = authenticatedFetch as jest.MockedFunction<typeof authenticatedFetch>;

const CREATED_EVENT = {
  id: 'event-1',
  name: 'Bloom Café',
  date: '2026-10-15',
  time: '20:00',
  image: null,
  budgetStart: null,
  budgetEnd: null,
  status: 'pending',
  groupId: 'group-1',
  location: { id: 'location-1', description: 'Av. João Wallig, 1800', manuallyCreated: true },
  createdAt: '2026-09-29T12:00:00.000Z',
  proposal: {
    id: 'proposal-1',
    ownerId: 'user-1',
    response: { id: 'answer-1', userId: 'user-1', answer: 'yes' },
  },
};

const INPUT = {
  name: '  Bloom Café  ',
  date: '2026-10-15',
  time: '20:00',
  location: ' Av. João Wallig, 1800 ',
};

describe('getEventDetails', () => {
  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  test('fetches event details using the authenticated event endpoint', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: 'event-1', name: 'Bloom Café' }),
    });

    await expect(getEventDetails('event-1')).resolves.toMatchObject({
      id: 'event-1',
      name: 'Bloom Café',
    });
    expect(global.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/api/events/event-1`, undefined);
  });

  test('surfaces the backend error when event details cannot be loaded', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      text: () => Promise.resolve('Evento não encontrado'),
    });

    await expect(getEventDetails('missing-event')).rejects.toMatchObject({
      message: 'Evento não encontrado',
      status: 404,
    });
  });
});

describe('respondToEventProposal', () => {
  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  test('creates the current user response when no response exists yet', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true });

    await respondToEventProposal('event-1', 'yes', false);

    expect(mockAuthenticatedFetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/api/events/event-1/proposal/responses`,
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer: 'yes' }),
      })
    );
  });

  test('updates the current user response when one already exists', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true });

    await respondToEventProposal('event-1', 'no', true);

    expect(mockAuthenticatedFetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/api/events/event-1/proposal/responses/me`,
      expect.objectContaining({ method: 'PATCH', body: JSON.stringify({ answer: 'no' }) })
    );
  });

  test('surfaces response update failures', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
      text: () => Promise.resolve('O usuário não pertence ao grupo do evento'),
    });

    await expect(respondToEventProposal('event-1', 'yes', false)).rejects.toMatchObject({
      status: 403,
      message: 'O usuário não pertence ao grupo do evento',
    });
  });
});

describe('createEvent', () => {
  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  test('posts the trimmed event fields as multipart form data', async () => {
    const append = jest.spyOn(FormData.prototype, 'append');
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(CREATED_EVENT),
    });

    await expect(createEvent('group-1', INPUT)).resolves.toEqual(CREATED_EVENT);

    expect(mockAuthenticatedFetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/groups/group-1/events`,
      expect.objectContaining({ method: 'POST', body: expect.any(FormData) as FormData })
    );
    expect(global.fetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/groups/group-1/events`,
      expect.objectContaining({ method: 'POST', body: expect.any(FormData) as FormData })
    );
    expect(append).toHaveBeenCalledWith('name', 'Bloom Café');
    expect(append).toHaveBeenCalledWith('date', '2026-10-15');
    expect(append).toHaveBeenCalledWith('time', '20:00');
    expect(append).toHaveBeenCalledWith('location', 'Av. João Wallig, 1800');
    expect(append).not.toHaveBeenCalledWith('image', expect.anything());
  });

  test('adds the selected image to the request', async () => {
    const append = jest.spyOn(FormData.prototype, 'append');
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(CREATED_EVENT),
    });

    await createEvent('group-1', {
      ...INPUT,
      image: { uri: 'file://bloom.jpg', fileName: 'bloom.jpg', mimeType: 'image/jpeg' },
    });

    expect(append).toHaveBeenCalledWith('image', expect.any(File));
  });

  test('throws an ApiError with the backend message when creation fails', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      text: () => Promise.resolve('Nome, dia, horário e endereço são obrigatórios'),
    });

    const request = createEvent('group-1', INPUT);

    await expect(request).rejects.toBeInstanceOf(ApiError);
    await expect(request).rejects.toMatchObject({
      message: 'Nome, dia, horário e endereço são obrigatórios',
      status: 400,
    });
  });

  test('falls back to a default message when the error body is empty', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: '',
      text: () => Promise.resolve(''),
    });

    await expect(createEvent('group-1', INPUT)).rejects.toMatchObject({
      message: 'Não foi possível criar o evento',
      status: 500,
    });
  });
});
