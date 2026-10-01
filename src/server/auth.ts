import { API_BASE_URL } from '@/constants';
import { expoClient } from '@better-auth/expo/client';
import { createAuthClient } from 'better-auth/react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export const authClient = createAuthClient({
  baseURL: API_BASE_URL,
  plugins: [
    expoClient({
      scheme: 'alibe',
      storage: SecureStore,
    }),
  ],
});

export async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers);
  let credentials: RequestCredentials = 'include';

  if (Platform.OS !== 'web') {
    const cookie = await authClient.getCookie();
    if (cookie) {
      headers.set('Cookie', cookie);
    }
    credentials = 'omit';
  }

  return fetch(url, { ...options, headers, credentials });
}