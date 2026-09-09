import { theme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { FC } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import tw from 'twrnc';
import { PhotoPickerProps } from './PhotoPicker.types';
import { useDefaultPhotoPickerController } from './controllers/useDefaultPhotoPickerController';

export const PhotoPicker: FC<PhotoPickerProps> = ({
  useController,
  label = 'Adicionar foto (opcional)',
  uploadUrl,
  onUploadSuccess,
  onUploadError,
  imageClassName = '',
  disabled,
  testID = 'alibe-photo-picker',
  ...pressableProps
}) => {
  const defaultController = useDefaultPhotoPickerController({
    uploadUrl,
    onUploadSuccess,
    onUploadError,
  });
  const customStrategy = useController ? useController({ onUploadSuccess, onUploadError }) : null;
  const { photoUri, isLoading, pickImage } = customStrategy ?? defaultController;

  const isDisabled = disabled ? true : isLoading;

  return (
    <View
      className="items-center"
      testID={`${testID}-container`}
    >
      <Text className="mb-4 text-center text-base font-semibold text-black">{label}</Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: isDisabled }}
        disabled={isDisabled}
        onPress={() => {
          void pickImage();
        }}
        hitSlop={16}
        style={({ pressed }) => tw`${pressed ? 'opacity-60' : 'opacity-100'}`}
        className={`h-36 w-36 items-center justify-center rounded-full bg-white ${imageClassName}`}
        testID={testID}
        {...pressableProps}
      >
        {isLoading ? (
          <ActivityIndicator
            color={theme.colors.ink}
            testID={`${testID}-loading`}
          />
        ) : photoUri ? (
          <Image
            source={{ uri: photoUri }}
            accessible
            accessibilityLabel="Foto selecionada"
            contentFit="cover"
            className="h-36 w-36 rounded-full"
            testID={`${testID}-photo`}
          />
        ) : (
          <Ionicons
            name="people-outline"
            size={80}
            color={theme.colors.coral}
            testID={`${testID}-placeholder`}
          />
        )}
      </Pressable>
    </View>
  );
};
