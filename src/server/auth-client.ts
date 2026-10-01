import { API_BASE_URL } from '@/constants';
import { expoClient } from '@better-auth/expo/client';
import { createAuthClient } from 'better-auth/react';
import * as SecureStore from 'expo-secure-store';

export const authClient = createAuthClient({
  baseURL: API_BASE_URL,
  plugins: [
    expoClient({
      scheme: 'alibe',
      storagePrefix: 'alibe',
      storage: SecureStore,
    }),
  ],
});
