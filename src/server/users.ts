import { API_BASE_URL } from '@/constants';
import { File } from 'expo-file-system';
import { Platform } from 'react-native';
import { ApiError } from './api';
import { authenticatedFetch } from './authenticated-fetch';

export interface UserProfilePictureInput {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
}

export interface UpdateUserProfilePictureResponse {
  profilePic: string;
}

const IMAGE_EXTENSION_BY_MIME_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

function imageFileName(image: UserProfilePictureInput, mimeType: string): string {
  if (image.fileName?.match(/\.(jpe?g|png|webp)$/i)) {
    return image.fileName;
  }

  const extension = IMAGE_EXTENSION_BY_MIME_TYPE[mimeType] ?? 'jpg';
  return 'profile-picture.' + extension;
}

async function appendProfilePicture(
  formData: FormData,
  image: UserProfilePictureInput
): Promise<void> {
  let mimeType = image.mimeType?.startsWith('image/') ? image.mimeType : 'image/jpeg';

  if (Platform.OS === 'web') {
    const imageResponse = await fetch(image.uri);
    if (!imageResponse.ok) {
      throw new Error('Não foi possível ler a imagem selecionada.');
    }

    const blob = await imageResponse.blob();
    mimeType = blob.type.startsWith('image/') ? blob.type : mimeType;
    formData.append('profilePic', blob, imageFileName(image, mimeType));
    return;
  }

  formData.append('profilePic', new File(image.uri));
}

export async function updateUserProfilePicture(
  image: UserProfilePictureInput
): Promise<UpdateUserProfilePictureResponse> {
  const formData = new FormData();
  await appendProfilePicture(formData, image);

  const response = await authenticatedFetch(API_BASE_URL + '/users/me/profile-picture', {
    method: 'PUT',
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new ApiError(
      text || response.statusText || 'Não foi possível salvar a foto de perfil',
      response.status
    );
  }

  return (await response.json()) as UpdateUserProfilePictureResponse;
}
