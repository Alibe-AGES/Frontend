import { File } from 'expo-file-system';
import { Platform } from 'react-native';

export interface UploadImage {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
}

const IMAGE_EXTENSION_BY_MIME_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
};

function imageFileName(image: UploadImage, mimeType: string, baseName: string): string {
  if (image.fileName?.match(/\.(jpe?g|png|webp|svg)$/i)) {
    return image.fileName;
  }

  const extension = IMAGE_EXTENSION_BY_MIME_TYPE[mimeType] ?? 'jpg';
  return `${baseName}.${extension}`;
}

// On web the picked uri is a blob URL that must be read into a Blob; on native the file is sent as-is.
export async function appendImage(
  formData: FormData,
  field: string,
  image: UploadImage,
  baseName: string
): Promise<void> {
  let mimeType = image.mimeType?.startsWith('image/') ? image.mimeType : 'image/jpeg';

  if (Platform.OS === 'web') {
    const imageResponse = await fetch(image.uri);
    if (!imageResponse.ok) {
      throw new Error('Não foi possível ler a imagem selecionada.');
    }

    const blob = await imageResponse.blob();
    mimeType = blob.type.startsWith('image/') ? blob.type : mimeType;
    formData.append(field, blob, imageFileName(image, mimeType, baseName));
    return;
  }

  formData.append(field, new File(image.uri));
}
