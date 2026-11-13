import { Pressable } from 'react-native';
import tw from 'twrnc';

import BackArrowIcon from '@/assets/images/back-arrow.svg';
import { BackButtonProps } from '@/components/BackButton/BackButton.types';
import { useDefaultBackController } from '@/components/BackButton/controllers/useDefaultBackController';
import { theme } from '@/theme';

export const BackButton: React.FC<BackButtonProps> = ({
  useController,
  fallbackHref,
  accessibilityLabel = 'Voltar',
  className = '',
  disabled,
  color,
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
      className={`items-start justify-items-start ${disabled ? 'opacity-50' : 'opacity-100'} ${className}`}
      style={({ pressed }) => tw`${pressed ? 'opacity-60' : ''}`}
      testID="alibe-back-button"
      {...pressableProps}
    >
      <BackArrowIcon
        width={24}
        height={16}
        color={color ?? theme.colors.ink}
      />
    </Pressable>
  );
};
