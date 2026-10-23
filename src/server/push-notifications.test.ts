import { authenticatedFetch } from './authenticated-fetch';
import { updateCurrentDevicePushToken } from './push-notifications';
import { ApiError } from './api';

jest.mock('./authenticated-fetch', () => ({
  authenticatedFetch: jest.fn(),
}));

const mockAuthenticatedFetch = authenticatedFetch as jest.MockedFunction<typeof authenticatedFetch>;

describe('updateCurrentDevicePushToken', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('sends the token to the authenticated user endpoint', async () => {
    mockAuthenticatedFetch.mockResolvedValue(new Response(null, { status: 204 }));

    await updateCurrentDevicePushToken('ExpoPushToken[test-token]');

    expect(mockAuthenticatedFetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/users\/me\/push-token$/),
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: 'ExpoPushToken[test-token]' }),
      }
    );
  });

  test('throws ApiError when the backend rejects the token', async () => {
    mockAuthenticatedFetch.mockResolvedValue(
      new Response('Invalid token', { status: 400, statusText: 'Bad Request' })
    );

    await expect(updateCurrentDevicePushToken('invalid')).rejects.toBeInstanceOf(ApiError);
  });
});
