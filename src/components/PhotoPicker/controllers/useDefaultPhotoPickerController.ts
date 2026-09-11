import {
  PhotoPickerStrategy,
  UsePhotoPickerParams,
} from '@/components/PhotoPicker/PhotoPicker.types';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useEffect, useRef, useState } from 'react';
import Toast from 'react-native-toast-message';

interface UseDefaultPhotoPickerControllerParams extends UsePhotoPickerParams {
  uploadUrl?: string;
  successMessageDurationMs?: number;
}

export const useDefaultPhotoPickerController = ({
  uploadUrl,
  onUploadSuccess,
  onUploadError,
  successMessageDurationMs = 3000,
}: UseDefaultPhotoPickerControllerParams = {}): PhotoPickerStrategy => {
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  const showSuccess = useCallback(() => {
    setSuccess(true);
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
    }
    successTimeoutRef.current = setTimeout(() => {
      setSuccess(false);
    }, successMessageDurationMs);
  }, [successMessageDurationMs]);

  const uploadPhoto = useCallback(
    async (uri: string) => {
      if (!uploadUrl) {
        setPhotoUri(uri);
        Toast.show({ type: 'success', text1: 'Sucesso!', text2: 'Foto enviada com sucesso!' });
        onUploadSuccess?.(uri);
        return;
      }

      setIsLoading(true);
      setError(null);
      setSuccess(false);

      try {
        const formData = new FormData();
        formData.append('photo', {
          uri,
          name: 'photo.jpg',
          type: 'image/jpeg',
        } as unknown as Blob);

        const response = await fetch(uploadUrl, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('upload-failed');
        }

        setPhotoUri(uri);
        Toast.show({ type: 'success', text1: 'Sucesso!', text2: 'Foto enviada com sucesso!' });
        onUploadSuccess?.(uri);
      } catch (err) {
        Toast.show({
          type: 'error',
          text1: 'Erro!',
          text2: 'Não foi possível enviar a foto. Tente novamente.',
        });
        onUploadError?.(err);
      } finally {
        setIsLoading(false);
      }
    },
    [uploadUrl, onUploadSuccess, onUploadError, showSuccess]
  );

  const pickImage = useCallback(async () => {
    setError(null);
    setSuccess(false);

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Toast.show({ type: 'error', text1: 'Erro!', text2: 'Permissão de acesso à galeria negada.' });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      await uploadPhoto(result.assets[0].uri);
    }
  }, [uploadPhoto]);

  return { photoUri, isLoading, error, success, pickImage };
};
