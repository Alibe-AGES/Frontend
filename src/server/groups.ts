import { API_BASE_URL } from '@/constants';
import { ApiError } from './api';
import { appendImage, UploadImage } from './images';

export interface Group {
  id: string;
  name: string;
  profilePic: string | null;
  createdAt: string;
}

export type CreateGroupImage = UploadImage;

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

export interface CurrentUser {
  id: string;
  name: string;
  profilePic: string | null;
}

export async function getMe(): Promise<CurrentUser> {
  const response = await fetch(`${API_BASE_URL}/auth/me`);

  if (!response.ok) {
    const text = await response.text();
    throw new ApiError(
      text || response.statusText || 'Failed to load current user',
      response.status
    );
  }

  return (await response.json()) as CurrentUser;
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

export async function createGroup(input: CreateGroupInput): Promise<Group> {
  const formData = new FormData();
  formData.append('name', input.name.trim());

  if (input.image) {
    await appendImage(formData, 'profile_pic', input.image, 'profile-picture');
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

export interface GroupMember {
  id: string;
  name: string;
  profilePic: string | null;
}

export interface GroupDetails {
  id: string;
  name: string;
  profilePic: string | null;
  createdAt: string;
  participants: GroupMember[];
}

export async function getGroup(groupId: string): Promise<GroupDetails> {
  const response = await fetch(`${API_BASE_URL}/groups/${groupId}`);

  if (!response.ok) {
    const text = await response.text();
    throw new ApiError(text || response.statusText || 'Failed to load group', response.status);
  }

  const group = (await response.json()) as GroupDetails;

  return {
    ...group,
    profilePic: resolveGroupPhotoUrl(group.profilePic),
    participants: group.participants.map((member) => ({
      ...member,
      profilePic: resolveGroupPhotoUrl(member.profilePic),
    })),
  };
}

export async function getGroupMembers(groupId: string): Promise<GroupMember[]> {
  const group = await getGroup(groupId);

  return group.participants;
}

export async function getGroupInviteLink(groupId: string): Promise<GroupInviteLink> {
  const response = await fetch(`${API_BASE_URL}/groups/${groupId}/invite-link`);

  if (!response.ok) {
    const text = await response.text();
    throw new ApiError(
      text || response.statusText || 'Failed to load invite link',
      response.status
    );
  }

  return (await response.json()) as GroupInviteLink;
}

export async function joinGroupByInvite(token: string): Promise<JoinGroupByInviteResponse> {
  const response = await fetch(`${API_BASE_URL}/invite-links/${token}/join`, {
    method: 'POST',
  });

  if (!response.ok) {
    const text = await response.text();
    throw new ApiError(text || response.statusText || 'Failed to join group', response.status);
  }

  return (await response.json()) as JoinGroupByInviteResponse;
}
