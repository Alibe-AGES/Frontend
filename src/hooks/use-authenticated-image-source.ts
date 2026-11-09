import type { ImageSource } from 'expo-image';
import { useEffect, useState } from 'react';

import { API_BASE_URL } from '@/constants';
import { getAuthenticationHeaders } from '@/server/authenticated-fetch';

function isApiImage(uri: string | null | undefined): uri is string {
  return Boolean(uri?.startsWith(API_BASE_URL));
}

export function useAuthenticatedImageSource(uri: string | null | undefined): ImageSource | null {
  // API images are held back until the session headers are ready: requested without them, the
  // backend answers 401 and the image library does not retry the same URL when headers arrive.
  const [source, setSource] = useState<ImageSource | null>(() =>
    uri && !isApiImage(uri) ? { uri } : null
  );

  useEffect(() => {
    let isActive = true;

    if (!uri) {
      setSource(null);
    } else if (!isApiImage(uri)) {
      setSource({ uri });
    } else {
      setSource(null);

      getAuthenticationHeaders()
        .then((headers) => {
          if (isActive) {
            setSource(Object.keys(headers).length > 0 ? { uri, headers } : { uri });
          }
        })
        .catch(() => {
          if (isActive) {
            setSource({ uri });
          }
        });
    }

    return () => {
      isActive = false;
    };
  }, [uri]);

  return source;
}
