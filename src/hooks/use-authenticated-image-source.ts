import type { ImageSource } from 'expo-image';
import { useEffect, useState } from 'react';

import { API_BASE_URL } from '@/constants';
import { getAuthenticationHeaders } from '@/server/authenticated-fetch';

export function useAuthenticatedImageSource(uri: string | null | undefined): ImageSource | null {
  const [source, setSource] = useState<ImageSource | null>(uri ? { uri } : null);

  useEffect(() => {
    let isActive = true;

    if (!uri) {
      setSource(null);
      return () => {
        isActive = false;
      };
    }

    setSource({ uri });

    if (!uri.startsWith(API_BASE_URL)) {
      return () => {
        isActive = false;
      };
    }

    void getAuthenticationHeaders().then((headers) => {
      if (!isActive) {
        return;
      }

      setSource(Object.keys(headers).length > 0 ? { uri, headers } : { uri });
    });

    return () => {
      isActive = false;
    };
  }, [uri]);

  return source;
}
