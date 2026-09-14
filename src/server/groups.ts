import { API_BASE_URL } from '@/constants';
import { ApiError } from './api';

export interface Group {
  id: string;
  name: string;
  profilePic: string | null;
  createdAt: string;
}

function resolveGroupPhotoUrl(profilePic: string | null): string | null {
  if (!profilePic) {
    return null;
  }

  return profilePic.startsWith('http') ? profilePic : `${API_BASE_URL}${profilePic}`;
}

export async function listGroups(): Promise<Group[]> {
  const response = await fetch(`${API_BASE_URL}/groups`);

  if (!response.ok) {
    const text = await response.text();
    throw new ApiError(text || response.statusText || 'Failed to load groups', response.status);
  }

  const groups = (await response.json()) as Group[];

  return groups.map((group) => ({ ...group, profilePic: resolveGroupPhotoUrl(group.profilePic) }));
}
