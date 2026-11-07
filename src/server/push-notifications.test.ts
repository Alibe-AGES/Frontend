import { API_BASE_URL } from '@/constants';
import { ApiError } from './api';
import { authenticatedFetch } from './authenticated-fetch';
import { updateCurrentDevicePushToken } from './push-notifications';

jest.mock('./authenticated-fetch', () => ({
  authenticatedFetch: jest.fn(),
}));

const mockAuthenticatedFetch = authenticatedFetch as jest.MockedFunction<typeof authenticatedFetch>;

describe('push notifications client', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('registers the current device token with the existing endpoint', async () => {
    mockAuthenticatedFetch.mockResolvedValue(new Response(null, { status: 204 }));

    await updateCurrentDevicePushToken('ExpoPushToken[test-token]');

    expect(mockAuthenticatedFetch).toHaveBeenCalledWith(`${API_BASE_URL}/api/users/me/push-token`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'ExpoPushToken[test-token]' }),
    });
  });

  test('throws ApiError when token registration fails', async () => {
    mockAuthenticatedFetch.mockResolvedValue(
      new Response('Invalid token', { status: 400, statusText: 'Bad Request' })
    );

    await expect(updateCurrentDevicePushToken('invalid')).rejects.toBeInstanceOf(ApiError);
  });
});
