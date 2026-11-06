import { API_BASE_URL } from '@/constants';
import { ApiError } from './api';
import { authenticatedFetch } from './auth';
import { appendImage, type UploadImage } from './images';

export async function createMemory(eventId: string, image: UploadImage): Promise<void> {
  const formData = new FormData();
  await appendImage(formData, 'image', image, 'memory-image');

  const response = await authenticatedFetch(`${API_BASE_URL}/api/events/${eventId}/memories`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new ApiError(
      text || response.statusText || 'Não foi possível criar a memória',
      response.status
    );
  }
}
