import { API_BASE_URL } from '@/constants';
import { File } from 'expo-file-system';
import { Platform } from 'react-native';
import { ApiError } from './api';
import { getMyProfile, updateUserProfilePicture } from './users';

declare const global: { fetch: jest.Mock };

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
  jest.restoreAllMocks();
  jest.clearAllMocks();
});

test('loads the authenticated current-user profile', async () => {
  const profile = {
    name: 'Ana',
    image: '/users/user-1/profile-picture',
    createdAt: '2026-01-01T00:00:00.000Z',
    completedEvents: 4,
    eventsInDecision: 2,
  };
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(profile),
  });

  await expect(getMyProfile()).resolves.toEqual(profile);

  expect(global.fetch).toHaveBeenCalledWith(API_BASE_URL + '/users/me', expect.any(Object));
});

test('uploads the selected profile picture using the authenticated endpoint', async () => {
  const append = jest.spyOn(FormData.prototype, 'append');
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: () =>
      Promise.resolve({
        profilePic: '/users/user-1/profile-picture',
      }),
  });

  await expect(
    updateUserProfilePicture({
      uri: 'file://profile.png',
      fileName: 'profile.png',
      mimeType: 'image/png',
    })
  ).resolves.toEqual({
    profilePic: '/users/user-1/profile-picture',
  });

  expect(global.fetch).toHaveBeenCalledWith(
    API_BASE_URL + '/users/me/profile-picture',
    expect.objectContaining({
      method: 'PUT',
      body: expect.any(FormData) as FormData,
    })
  );
  expect(append).toHaveBeenCalledWith('profilePic', expect.any(File));
});

describe('on web', () => {
  const imageBlob = new Blob(['image'], { type: 'image/webp' });

  beforeEach(() => {
    jest.replaceProperty(Platform, 'OS', 'web');
  });

  function mockImageAndUploadResponses(): void {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({ ok: true, blob: () => Promise.resolve(imageBlob) })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ profilePic: '/users/user-1/profile-picture' }),
      });
  }

  test('reads the selected image as a blob and keeps a valid file name', async () => {
    const append = jest.spyOn(FormData.prototype, 'append');
    mockImageAndUploadResponses();

    await updateUserProfilePicture({ uri: 'blob:profile', fileName: 'profile.webp' });

    expect(global.fetch).toHaveBeenNthCalledWith(1, 'blob:profile');
    expect(append).toHaveBeenCalledWith('profilePic', imageBlob, 'profile.webp');
  });

  test('names the file from the image type when the original name has no image extension', async () => {
    const append = jest.spyOn(FormData.prototype, 'append');
    mockImageAndUploadResponses();

    await updateUserProfilePicture({ uri: 'blob:profile', fileName: null });

    expect(append).toHaveBeenCalledWith('profilePic', imageBlob, 'profile-picture.webp');
  });

  test('throws when the selected image cannot be read', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false });

    await expect(updateUserProfilePicture({ uri: 'blob:missing' })).rejects.toThrow(
      'Não foi possível ler a imagem selecionada.'
    );
  });
});

test('throws an ApiError when the profile picture cannot be saved', async () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: false,
    status: 400,
    statusText: 'Bad Request',
    text: () => Promise.resolve('Imagem inválida'),
  });

  await expect(
    updateUserProfilePicture({
      uri: 'file://invalid.txt',
      fileName: 'invalid.txt',
      mimeType: 'text/plain',
    })
  ).rejects.toBeInstanceOf(ApiError);
});
