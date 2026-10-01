import { ImageSource } from 'expo-image';
import { useLocalSearchParams } from 'expo-router/build/hooks';
import { useMemo } from 'react';
import { API_BASE_URL } from '../constants';

export const useUserAvatarSource = (userId?: string): ImageSource | undefined => {
  const { token } = useLocalSearchParams<{ token?: string }>();
  const apiUrl = API_BASE_URL;

  return useMemo(() => {
    if (!userId || !token) return undefined;
    return {
      uri: `${apiUrl}/users/${userId}/profile-picture`,
      headers: { Authorization: `Bearer ${token}` },
    };
  }, [userId, token, apiUrl]);
};
