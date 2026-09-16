import { API_BASE_URL } from '@/constants';
import { Platform } from 'react-native';
import { ApiError } from './api';

export interface Group {
  id: string;
  name: string;
  profilePic: string | null;
  createdAt: string;
}

export interface CreateGroupImage {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
}

export interface CreateGroupInput {
  name: string;
  image?: CreateGroupImage | null;
}

export interface GroupInviteLink {
  token: string;
  expiresAt: string;
}

export interface JoinGroupByInviteResponse {
  token: string;
}

const IMAGE_EXTENSION_BY_MIME_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
};

function imageFileName(image: CreateGroupImage, mimeType: string): string {
  if (image.fileName?.match(/\.(jpe?g|png|webp|svg)$/i)) {
    return image.fileName;
  }

  const extension = IMAGE_EXTENSION_BY_MIME_TYPE[mimeType] ?? 'jpg';
  return 'profile-picture.' + extension;
}

async function appendGroupImage(formData: FormData, image: CreateGroupImage): Promise<void> {
  let mimeType = image.mimeType?.startsWith('image/') ? image.mimeType : 'image/jpeg';

  if (Platform.OS === 'web') {
    const imageResponse = await fetch(image.uri);
    if (!imageResponse.ok) {
      throw new Error('Não foi possível ler a imagem selecionada.');
    }

    const blob = await imageResponse.blob();
    mimeType = blob.type.startsWith('image/') ? blob.type : mimeType;
    formData.append('profile_pic', blob, imageFileName(image, mimeType));
    return;
  }

  formData.append('profile_pic', {
    uri: image.uri,
    name: imageFileName(image, mimeType),
    type: mimeType,
  } as unknown as Blob);
}

function resolveGroupPhotoUrl(profilePic: string | null): string | null {
  if (!profilePic) {
    return null;
  }

  return profilePic.startsWith('http') ? profilePic : `${API_BASE_URL}${profilePic}`;
}

async function throwApiError(response: Response, fallbackMessage: string): Promise<never> {
  const text = await response.text();
  throw new ApiError(text || response.statusText || fallbackMessage, response.status);
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

export async function createGroup(input: CreateGroupInput): Promise<Group> {
  const formData = new FormData();
  formData.append('name', input.name.trim());

  if (input.image) {
    await appendGroupImage(formData, input.image);
  }

  const response = await fetch(API_BASE_URL + '/groups', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new ApiError(
      text || response.statusText || 'Não foi possível criar o grupo',
      response.status
    );
  }

  const group = (await response.json()) as Group;
  return { ...group, profilePic: resolveGroupPhotoUrl(group.profilePic) };
}

export async function getGroupInviteLink(groupId: string): Promise<GroupInviteLink> {
  const response = await fetch(`${API_BASE_URL}/groups/${groupId}/invite-link`);

  if (!response.ok) {
    return throwApiError(response, 'Failed to load invite link');
  }

  return (await response.json()) as GroupInviteLink;
}

export async function joinGroupByInvite(token: string): Promise<JoinGroupByInviteResponse> {
  const response = await fetch(`${API_BASE_URL}/invite-links/${token}/join`, {
    method: 'POST',
  });

  if (!response.ok) {
    return throwApiError(response, 'Failed to join group');
  }

  return (await response.json()) as JoinGroupByInviteResponse;
}
