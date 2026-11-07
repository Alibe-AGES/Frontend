import { Platform } from 'react-native';

import { authClient } from '@/server/auth-client';

export async function getAuthenticationHeaders(): Promise<Record<string, string>> {
  if (Platform.OS === 'web') {
    return {};
  }

  const cookie = await authClient.getCookie();
  return cookie ? { Cookie: cookie } : {};
}

export async function authenticatedFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(init.headers);
  const authenticationHeaders = await getAuthenticationHeaders();

  for (const [name, value] of Object.entries(authenticationHeaders)) {
    headers.set(name, value);
  }

  return fetch(input, {
    ...init,
    headers,
    credentials: Platform.OS === 'web' ? 'include' : 'omit',
  });
}
