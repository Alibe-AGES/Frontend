import { API_BASE_URL } from '@/constants';
import { File } from 'expo-file-system';
import { ApiError } from './api';
import { authenticatedFetch } from './auth';
import {
  createEvent,
  createProposal,
  getEventDetails,
  respondToEventProposal,
  updateEvent,
} from './events';

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

const CREATED_PROPOSAL = {
  id: 'proposal-1',
  createdAt: '2026-10-09T17:00:00.000Z',
  owner: {
    id: 'user-1',
    name: 'Ana Beatriz Silva',
    image: '/users/user-1/profile-picture',
  },
  event: {
    id: 'event-1',
    name: 'Café de sábado',
    date: '2026-10-17',
    time: '15:00',
    budgetStart: '30.00',
    budgetEnd: '60.00',
    status: 'pending' as const,
    groupId: 'group-1',
  },
  location: {
    id: '44444444-4444-4444-8444-444444444444',
    description: 'Café tranquilo',
    address: 'Rua Padre Chagas, 320',
  },
  myAnswer: 'yes' as const,
};

const INPUT = {
  name: '  Bloom Café  ',
  date: '2026-10-15',
  time: '20:00',
  location: ' Av. João Wallig, 1800 ',
};

const PROPOSAL_INPUT = {
  locationId: '44444444-4444-4444-8444-444444444444',
  name: '  Café de sábado  ',
  date: '2026-10-17',
  time: '15:00',
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

describe('createProposal', () => {
  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  test('posts the trimmed proposal fields as JSON to /api/groups/:groupId/proposals', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(CREATED_PROPOSAL),
    });

    await expect(
      createProposal('group-1', {
        ...PROPOSAL_INPUT,
        budgetStart: '30.00',
        budgetEnd: '60.00',
      })
    ).resolves.toEqual(CREATED_PROPOSAL);

    expect(mockAuthenticatedFetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/api/groups/group-1/proposals`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationId: '44444444-4444-4444-8444-444444444444',
          name: 'Café de sábado',
          date: '2026-10-17',
          time: '15:00',
          budgetStart: '30.00',
          budgetEnd: '60.00',
        }),
      }
    );
  });

  test('throws an ApiError with the backend message when proposal creation fails', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      text: () => Promise.resolve('Localização não encontrada'),
    });

    const request = createProposal('group-1', PROPOSAL_INPUT);

    await expect(request).rejects.toBeInstanceOf(ApiError);
    await expect(request).rejects.toMatchObject({
      message: 'Localização não encontrada',
      status: 404,
    });
  });

  test('falls back to a default message when the proposal error body is empty', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: '',
      text: () => Promise.resolve(''),
    });

    await expect(createProposal('group-1', PROPOSAL_INPUT)).rejects.toMatchObject({
      message: 'Não foi possível criar a sugestão',
      status: 500,
    });
  });
});

describe('updateEvent', () => {
  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  test('patches custom location as JSON when no image is provided', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true });

    await expect(
      updateEvent('event-1', { location: ' Rua João Pessoa, 123 ' })
    ).resolves.toBeUndefined();

    expect(mockAuthenticatedFetch).toHaveBeenCalledWith(`${API_BASE_URL}/api/events/event-1`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location: 'Rua João Pessoa, 123' }),
    });
  });

  test('throws an ApiError when updating the event fails', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      text: () => Promise.resolve('Endereço inválido'),
    });

    await expect(updateEvent('event-1', { location: 'Rua João Pessoa' })).rejects.toMatchObject({
      message: 'Endereço inválido',
      status: 400,
    });
  });
});
