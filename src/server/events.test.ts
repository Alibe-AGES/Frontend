import { API_BASE_URL } from '@/constants';
import { File } from 'expo-file-system';
import { ApiError } from './api';
import { createEvent } from './events';

declare const global: { fetch: jest.Mock };

const originalFetch = global.fetch;

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
