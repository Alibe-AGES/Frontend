import { API_BASE_URL } from '@/constants';

/**
 * The API returns images as paths such as `/users/{id}/profile-picture`; the app needs the full
 * URL to load them. Absolute URLs are kept as they are.
 */
export function resolveApiImageUrl(path: string | null | undefined): string | null {
  if (!path) {
    return null;
  }

  return path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
}
