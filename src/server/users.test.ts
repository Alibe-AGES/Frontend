import { API_BASE_URL } from '@/constants';
import { File } from 'expo-file-system';
import { ApiError } from './api';
import { updateUserProfilePicture } from './users';

declare const global: { fetch: jest.Mock };

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
  jest.restoreAllMocks();
  jest.clearAllMocks();
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
