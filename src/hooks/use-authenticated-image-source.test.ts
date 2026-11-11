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
  const { result } = await Promise.resolve(renderHook(() => useAuthenticatedImageSource(uri)));

  await waitFor(() => {
    expect(result.current).toEqual({
      uri,
      headers: { Cookie: 'better-auth.session_token=session-token' },
    });
  });
});

test('does not send the session cookie to external image hosts', async () => {
  const uri = 'https://images.example.com/avatar.png';
  const { result } = await Promise.resolve(renderHook(() => useAuthenticatedImageSource(uri)));

  expect(result.current).toEqual({ uri });
  expect(mockGetCookie).not.toHaveBeenCalled();
});

test('does not hand out an API image before the session headers are ready', async () => {
  let resolveCookie: (cookie: string) => void = () => undefined;
  mockGetCookie.mockReturnValue(
    new Promise<string>((resolve) => {
      resolveCookie = resolve;
    })
  );
  const uri = `${API_BASE_URL}/users/user-1/profile-picture`;
  const { result } = await Promise.resolve(renderHook(() => useAuthenticatedImageSource(uri)));

  expect(result.current).toBeNull();

  resolveCookie('better-auth.session_token=session-token');

  await waitFor(() => {
    expect(result.current).toEqual({
      uri,
      headers: { Cookie: 'better-auth.session_token=session-token' },
    });
  });
});

test('still tries the API image when the session cannot be read', async () => {
  mockGetCookie.mockRejectedValue(new Error('No session'));
  const uri = `${API_BASE_URL}/users/user-1/profile-picture`;
  const { result } = await Promise.resolve(renderHook(() => useAuthenticatedImageSource(uri)));

  await waitFor(() => {
    expect(result.current).toEqual({ uri });
  });
});
