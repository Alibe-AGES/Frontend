import { theme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { ComponentProps, FC } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import tw from 'twrnc';
import { Avatar } from '../Avatar';
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
  initialPhotoUri,
  onUploadSuccess,
  onUploadError,
  imageClassName = '',
  disabled,
  testID = 'alibe-photo-picker',
  ...pressableProps
}) => {
  const resolvedUseController = useController ?? useDefaultPhotoPickerController;
  const { photoUri, isLoading, pickImage } = resolvedUseController({
    uploadUrl,
    initialPhotoUri,
    onUploadSuccess,
    onUploadError,
  });

  const isDisabled = disabled ? true : isLoading;
  const currentPlaceholder = PLACEHOLDER_ICONS[placeholder];

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
        className="h-36 w-36 items-center justify-center rounded-full bg-white"
        testID={testID}
        {...pressableProps}
      >
        {isLoading ? (
          <ActivityIndicator
            color={theme.colors.ink}
            testID={`${testID}-loading`}
          />
        ) : (
          <Avatar
            photoUri={photoUri}
            accessibilityLabel="Foto selecionada"
            imageClassName={`h-36 w-36 rounded-full ${imageClassName}`}
            iconSize={80}
            fallbackIconName={currentPlaceholder.name}
            fallbackIconColor={currentPlaceholder.color}
            testID={testID}
          />
        )}
      </Pressable>
    </View>
  );
};
