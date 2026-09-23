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

export interface PhotoPickerProps extends Omit<PressableProps, 'children'> {
  useController?: UsePhotoPickerHook;
  label?: string;
  uploadUrl?: string;
  onUploadSuccess?: (photo: SelectedPhoto) => void;
  onUploadError?: (error: unknown) => void;
  className?: string;
  imageClassName?: string;
  testID?: string;
}
