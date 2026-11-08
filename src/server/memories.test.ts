import { API_BASE_URL } from '@/constants';
import { ApiError } from './api';
import { authenticatedFetch } from './auth';
import { appendImage } from './images';
import { createMemory } from './memories';

jest.mock('./auth', () => ({ authenticatedFetch: jest.fn() }));
jest.mock('./images', () => ({ appendImage: jest.fn() }));

const mockedFetch = jest.mocked(authenticatedFetch);
const IMAGE = { uri: 'file:///memory.jpg', fileName: 'memory.jpg', mimeType: 'image/jpeg' };

describe('createMemory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('posts the image to the event memories endpoint', async () => {
    mockedFetch.mockResolvedValue(new Response(null, { status: 201 }));

    await createMemory('event-1', IMAGE);

    expect(appendImage).toHaveBeenCalledWith(expect.any(FormData), 'image', IMAGE, 'memory-image');
    expect(mockedFetch).toHaveBeenCalledWith(`${API_BASE_URL}/api/events/event-1/memories`, {
      method: 'POST',
      body: expect.any(FormData) as FormData,
    });
  });

  test('throws an ApiError when the request fails', async () => {
    mockedFetch.mockResolvedValue(new Response('Evento não encontrado.', { status: 404 }));

    await expect(createMemory('event-1', IMAGE)).rejects.toBeInstanceOf(ApiError);
  });
});
