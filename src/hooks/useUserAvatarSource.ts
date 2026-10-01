/* eslint-disable @typescript-eslint/restrict-template-expressions */

import { ImageSource } from 'expo-image';
import { useLocalSearchParams } from 'expo-router/build/hooks';
import { useMemo } from 'react';

export const useUserAvatarSource = (userId?: string): ImageSource | undefined => {
  const { token } = useLocalSearchParams<{ token?: string }>();
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  return useMemo(() => {
    if (!userId || !token) return undefined;
    return {
      uri: `${apiUrl}/users/${userId}/profile-picture`,
      headers: { Authorization: `Bearer ${token}` },
    };
  }, [userId, token, apiUrl]);
};
