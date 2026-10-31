import { renderHook, waitFor } from '@testing-library/react-native';

import { API_BASE_URL } from '@/constants';
import { authClient } from '@/server/auth-client';
import { useAuthenticatedImageSource } from './use-authenticated-image-source';

const mockGetCookie = authClient.getCookie as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

test('adds session headers to images served by the backend', async () => {
  mockGetCookie.mockResolvedValue('better-auth.session_token=session-token');
  const uri = `${API_BASE_URL}/groups/group-id/profile-picture`;
  const { result } = await renderHook(() => useAuthenticatedImageSource(uri));

  await waitFor(() => {
    expect(result.current).toEqual({
      uri,
      headers: { Cookie: 'better-auth.session_token=session-token' },
    });
  });
});

test('does not send the session cookie to external image hosts', async () => {
  const uri = 'https://images.example.com/avatar.png';
  const { result } = await renderHook(() => useAuthenticatedImageSource(uri));

  expect(result.current).toEqual({ uri });
  expect(mockGetCookie).not.toHaveBeenCalled();
});
