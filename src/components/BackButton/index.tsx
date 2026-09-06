import backArrowIcon from '@/assets/images/back-arrow.svg';
import { theme } from '@/theme';
import { Image } from 'expo-image';
import { Pressable } from 'react-native';
import tw from 'twrnc';
import { BackButtonProps } from './BackButton.types';
import { useDefaultBackController } from './controllers/useDefaultBackController';

export const BackButton: React.FC<BackButtonProps> = ({
  useController,
  fallbackHref,
  accessibilityLabel = 'Voltar',
  className = '',
  disabled,
  ...pressableProps
}) => {
  const defaultController = useDefaultBackController({ fallbackHref });
  const customStrategy = useController ? useController() : null;
  const { handleBack, isLoading } = customStrategy ?? defaultController;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: disabled ?? false }}
      disabled={disabled ? true : isLoading}
      onPress={() => {
        void handleBack();
      }}
      hitSlop={16}
      className={`items-center justify-center ${disabled ? 'opacity-50' : 'opacity-100'} ${className}`}
      style={({ pressed }) => tw`${pressed ? 'opacity-60' : ''}`}
      testID="alibe-back-button"
      {...pressableProps}
    >
      <Image
        source={backArrowIcon}
        accessible={false}
        contentFit="contain"
        tintColor={theme.colors.ink}
        style={tw`h-6 w-8`}
      />
    </Pressable>
  );
};
