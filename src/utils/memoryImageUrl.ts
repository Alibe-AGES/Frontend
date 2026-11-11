import { API_BASE_URL } from '@/constants';

export interface MemoryImageIdentity {
  id: string;
  eventId: string;
}

export function getMemoryImageUrl({ eventId, id }: MemoryImageIdentity): string {
  return `${API_BASE_URL}/api/events/${eventId}/memories/${id}/image`;
}
