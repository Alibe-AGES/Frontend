import { API_BASE_URL } from '@/constants';
import { ApiError } from './api';
import { authenticatedFetch } from './authenticated-fetch';

export async function updateCurrentDevicePushToken(token: string): Promise<void> {
  const response = await authenticatedFetch(`${API_BASE_URL}/api/users/me/push-token`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new ApiError(
      text || response.statusText || 'Não foi possível registrar as notificações',
      response.status
    );
  }
}
