import { API_BASE_URL } from '@/constants';
import { resolveApiImageUrl } from '@/utils/apiImageUrl';
import { ApiError } from './api';
import { authenticatedFetch } from './auth';
import type { EventStatus } from './events';
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
  const response = await authenticatedFetch(`${API_BASE_URL}/api/users/me`);

  if (!response.ok) {
    const text = await response.text();
    throw new ApiError(
      text || response.statusText || 'Failed to load current user',
      response.status
    );
  }

  return (await response.json()) as CurrentUser;
}

export async function listGroups(): Promise<Group[]> {
  const response = await authenticatedFetch(`${API_BASE_URL}/groups`);

  if (!response.ok) {
    const text = await response.text();
    throw new ApiError(text || response.statusText || 'Failed to load groups', response.status);
  }

  const groups = (await response.json()) as Group[];

  return groups.map((group) => ({ ...group, profilePic: resolveApiImageUrl(group.profilePic) }));
}

export async function createGroup(input: CreateGroupInput): Promise<Group> {
  const formData = new FormData();
  formData.append('name', input.name.trim());

  if (input.image) {
    await appendImage(formData, 'profile_pic', input.image, 'profile-picture');
  }

  const response = await authenticatedFetch(API_BASE_URL + '/groups', {
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
  return { ...group, profilePic: resolveApiImageUrl(group.profilePic) };
}

export interface UpdateGroupInput {
  name?: string;
  image?: UploadImage | null;
  removeProfilePicture?: boolean;
}

// Only the group owner may edit; the backend answers 403 for anyone else.
export async function updateGroup(groupId: string, input: UpdateGroupInput): Promise<Group> {
  const formData = new FormData();

  if (input.name !== undefined) {
    formData.append('name', input.name.trim());
  }

  if (input.image) {
    await appendImage(formData, 'profile_pic', input.image, 'profile-picture');
  } else if (input.removeProfilePicture) {
    formData.append('removeProfilePicture', 'true');
  }

  const response = await authenticatedFetch(`${API_BASE_URL}/groups/${groupId}`, {
    method: 'PATCH',
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new ApiError(
      text || response.statusText || 'Não foi possível atualizar o grupo',
      response.status
    );
  }

  const group = (await response.json()) as Group;
  return { ...group, profilePic: resolveApiImageUrl(group.profilePic) };
}

export interface GroupMember {
  id: string;
  name: string;
  profilePic: string | null;
}

export interface GroupNextEvent {
  id: string;
  name: string;
  timeslot: string;
  status: EventStatus;
}

export interface GroupDetails {
  id: string;
  name: string;
  profilePic: string | null;
  createdAt: string;
  ownerId: string | null;
  participants: GroupMember[];
  nextEvent?: GroupNextEvent | null;
}

export async function getGroup(groupId: string): Promise<GroupDetails> {
  const response = await authenticatedFetch(`${API_BASE_URL}/groups/${groupId}`);

  if (!response.ok) {
    const text = await response.text();
    throw new ApiError(text || response.statusText || 'Failed to load group', response.status);
  }

  const group = (await response.json()) as GroupDetails;

  return {
    ...group,
    profilePic: resolveApiImageUrl(group.profilePic),
    participants: group.participants.map((member) => ({
      ...member,
      profilePic: resolveApiImageUrl(member.profilePic),
    })),
  };
}

export async function getGroupMembers(groupId: string): Promise<GroupMember[]> {
  const group = await getGroup(groupId);

  return group.participants;
}

export async function getGroupInviteLink(groupId: string): Promise<GroupInviteLink> {
  const response = await authenticatedFetch(`${API_BASE_URL}/groups/${groupId}/invite-link`);

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
  const response = await authenticatedFetch(`${API_BASE_URL}/invite-links/${token}/join`, {
    method: 'POST',
  });

  if (!response.ok) {
    const text = await response.text();
    throw new ApiError(text || response.statusText || 'Failed to join group', response.status);
  }

  return (await response.json()) as JoinGroupByInviteResponse;
}

// Removes the authenticated user from the group. The backend answers 201 with an empty body.
export async function leaveGroup(groupId: string): Promise<void> {
  const response = await authenticatedFetch(`${API_BASE_URL}/groups/${groupId}/leave`, {
    method: 'PUT',
  });

  if (!response.ok) {
    const text = await response.text();
    throw new ApiError(
      text || response.statusText || 'Não foi possível sair do grupo',
      response.status
    );
  }
}

// Only the group owner may remove other members; the backend answers 204 with an empty body.
export async function removeGroupMember(groupId: string, memberId: string): Promise<void> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/groups/${groupId}/members/${memberId}`,
    { method: 'DELETE' }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new ApiError(
      text || response.statusText || 'Não foi possível remover o participante',
      response.status
    );
  }
}
