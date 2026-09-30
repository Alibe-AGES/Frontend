import { theme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { ComponentProps, FC } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import tw from 'twrnc';
import { PhotoPickerPlaceholder, PhotoPickerProps } from './PhotoPicker.types';
import { useDefaultPhotoPickerController } from './controllers/useDefaultPhotoPickerController';

const PLACEHOLDER_ICONS: Record<
  PhotoPickerPlaceholder,
  { name: ComponentProps<typeof Ionicons>['name']; color: string }
> = {
  group: { name: 'people-outline', color: theme.colors.coral },
  camera: { name: 'camera-outline', color: theme.colors.ink },
};

export const PhotoPicker: FC<PhotoPickerProps> = ({
  useController,
  label = 'Adicionar foto (opcional)',
  placeholder = 'group',
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

  const renderPhotoContent = () => {
    if (isLoading) {
      return (
        <ActivityIndicator
          color={theme.colors.ink}
          testID={`${testID}-loading`}
        />
      );
    }
    if (photoUri) {
      return (
        <Image
          source={{ uri: photoUri }}
          accessible
          accessibilityLabel="Foto selecionada"
          contentFit="cover"
          style={tw`h-36 w-36 rounded-full`}
          testID={`${testID}-photo`}
        />
      );
    }
    return (
      <Ionicons
        name={PLACEHOLDER_ICONS[placeholder].name}
        size={80}
        color={PLACEHOLDER_ICONS[placeholder].color}
        testID={`${testID}-placeholder`}
      />
    );
  };

  return (
    <View
      className="items-center"
      testID={`${testID}-container`}
    >
      <Text className="mb-4 text-center font-poppins text-lg text-black">{label}</Text>

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
        {renderPhotoContent()}
      </Pressable>
    </View>
  );
};
