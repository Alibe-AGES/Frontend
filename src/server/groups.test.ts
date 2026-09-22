import { API_BASE_URL } from '@/constants';
import { File } from 'expo-file-system';
import { ApiError } from './api';
import {
  createGroup,
  getGroup,
  getGroupInviteLink,
  getGroupMembers,
  getMe,
  joinGroupByInvite,
  listGroups,
} from './groups';

declare const global: { fetch: jest.Mock };

const originalFetch = global.fetch;

const BASE_GROUP = { id: '1', name: 'Hermanas', createdAt: '2026-01-01T00:00:00.000Z' };

function mockFetchResolvedWith(groups: unknown[]): void {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(groups),
  });
}

describe('listGroups', () => {
  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  test('fetches the groups from the backend', async () => {
    mockFetchResolvedWith([]);

    await listGroups();

    expect(global.fetch).toHaveBeenCalledWith(API_BASE_URL + '/groups');
  });

  test('resolves a relative profilePic into a full URL', async () => {
    mockFetchResolvedWith([{ ...BASE_GROUP, profilePic: '/groups/1/profile-picture' }]);

    const groups = await listGroups();

    expect(groups[0].profilePic).toBe(API_BASE_URL + '/groups/1/profile-picture');
  });

  test('keeps an absolute profilePic untouched', async () => {
    mockFetchResolvedWith([{ ...BASE_GROUP, profilePic: 'https://cdn.alibe.com/hermanas.jpg' }]);

    const groups = await listGroups();

    expect(groups[0].profilePic).toBe('https://cdn.alibe.com/hermanas.jpg');
  });

  test('keeps a null profilePic as null', async () => {
    mockFetchResolvedWith([{ ...BASE_GROUP, profilePic: null }]);

    const groups = await listGroups();

    expect(groups[0].profilePic).toBeNull();
  });

  test('throws an ApiError when the response is not ok', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      text: () => Promise.resolve(''),
    });

    await expect(listGroups()).rejects.toBeInstanceOf(ApiError);
  });
});

describe('group details', () => {
  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  test('gets the current user', async () => {
    const user = { id: 'user-1', name: 'Ana', profilePic: '/users/1.jpg' };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(user),
    });

    await expect(getMe()).resolves.toEqual(user);
    expect(global.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/auth/me`);
  });

  test('gets group details and resolves participant photo URLs', async () => {
    const group = {
      ...BASE_GROUP,
      profilePic: '/groups/1/profile-picture',
      participants: [
        { id: 'user-1', name: 'Ana', profilePic: '/users/1.jpg' },
        { id: 'user-2', name: 'Bia', profilePic: null },
      ],
    };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(group),
    });

    await expect(getGroup('1')).resolves.toEqual({
      ...group,
      profilePic: `${API_BASE_URL}/groups/1/profile-picture`,
      participants: [
        { id: 'user-1', name: 'Ana', profilePic: `${API_BASE_URL}/users/1.jpg` },
        { id: 'user-2', name: 'Bia', profilePic: null },
      ],
    });
    expect(global.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/groups/1`);
  });

  test('returns group participants from getGroupMembers', async () => {
    const participants = [{ id: 'user-1', name: 'Ana', profilePic: null }];
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ...BASE_GROUP, profilePic: null, participants }),
    });

    await expect(getGroupMembers('1')).resolves.toEqual(participants);
  });
});

describe('createGroup', () => {
  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  test('sends the group name using multipart form data', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          ...BASE_GROUP,
          name: 'Amigos da faculdade',
          profilePic: null,
        }),
    });

    await createGroup({ name: '  Amigos da faculdade  ' });

    expect(global.fetch).toHaveBeenCalledWith(
      API_BASE_URL + '/groups',
      expect.objectContaining({
        method: 'POST',
        body: expect.any(FormData) as FormData,
      })
    );
  });

  test('adds the selected image to the multipart request', async () => {
    const append = jest.spyOn(FormData.prototype, 'append');
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          ...BASE_GROUP,
          profilePic: '/groups/1/profile-picture',
        }),
    });

    await createGroup({
      name: 'Hermanas',
      image: {
        uri: 'file://photo.png',
        fileName: 'photo.png',
        mimeType: 'image/png',
      },
    });

    expect(global.fetch).toHaveBeenCalledWith(
      API_BASE_URL + '/groups',
      expect.objectContaining({
        method: 'POST',
        body: expect.any(FormData) as FormData,
      })
    );

    expect(append).toHaveBeenCalledWith('profile_pic', expect.any(File));
  });

  test('throws an ApiError when group creation fails', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      text: () => Promise.resolve('Nome inválido'),
    });

    await expect(createGroup({ name: 'Grupo' })).rejects.toBeInstanceOf(ApiError);
  });
});

describe('group invites', () => {
  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  test('gets the current invite link for a group', async () => {
    const invite = {
      token: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      expiresAt: '2026-12-31T23:59:59.000Z',
    };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(invite),
    });

    await expect(getGroupInviteLink('group-id')).resolves.toEqual(invite);
    expect(global.fetch).toHaveBeenCalledWith(API_BASE_URL + '/groups/group-id/invite-link');
  });

  test('joins a group using the invite token', async () => {
    const token = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ token }),
    });

    await expect(joinGroupByInvite(token)).resolves.toEqual({ token });
    expect(global.fetch).toHaveBeenCalledWith(API_BASE_URL + `/invite-links/${token}/join`, {
      method: 'POST',
    });
  });

  test('throws an ApiError when the invite cannot be loaded', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
      text: () => Promise.resolve(''),
    });

    await expect(getGroupInviteLink('group-id')).rejects.toBeInstanceOf(ApiError);
  });

  test('throws an ApiError when joining the group fails', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 410,
      statusText: 'Gone',
      text: () => Promise.resolve('Invite expired'),
    });

    await expect(joinGroupByInvite('expired-token')).rejects.toBeInstanceOf(ApiError);
  });
});
