import type { ImageProps } from 'expo-image';
import { PressableProps } from 'react-native';

export interface PhotoPickerStrategy {
  photoUri: string | null;
  isLoading: boolean;
  error?: string | null;
  success?: boolean;
  pickImage: () => void | Promise<void>;
}

export interface SelectedPhoto {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
}

export interface UsePhotoPickerParams {
  onUploadSuccess?: (photo: SelectedPhoto) => void;
  onUploadError?: (error: unknown) => void;
}

export type UsePhotoPickerHook = (params?: UsePhotoPickerParams) => PhotoPickerStrategy;

export type PhotoPickerPlaceholder = 'group' | 'camera';

export interface PhotoPickerProps extends Omit<PressableProps, 'children'> {
  useController?: UsePhotoPickerHook;
  label?: string;
  labelClassName?: string;
  placeholder?: PhotoPickerPlaceholder;
  uploadUrl?: string;
  initialPhotoUri?: string | null;
  /** Use "none" when the photo can change behind the same URL, such as a profile picture. */
  cachePolicy?: ImageProps['cachePolicy'];
  onUploadSuccess?: (photo: SelectedPhoto) => void;
  onUploadError?: (error: unknown) => void;
  className?: string;
  testID?: string;
}
