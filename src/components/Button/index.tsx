import { theme } from '@/theme';
import { ActivityIndicator, Pressable, Text } from 'react-native';
import tw from 'twrnc';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary';

const BACKGROUND_STYLES: Record<ButtonVariant, string> = {
  primary: 'bg-coral',
  secondary: 'bg-lime',
  tertiary: 'bg-ink',
};

const TEXT_STYLES: Record<ButtonVariant, string> = {
  primary: 'text-white',
  secondary: 'text-ink',
  tertiary: 'text-white',
};

const SPINNER_COLORS: Record<ButtonVariant, string> = {
  primary: theme.colors.white,
  secondary: theme.colors.ink,
  tertiary: theme.colors.white,
};

export interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  isLoading?: boolean;
  testID?: string;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  isLoading = false,
  testID = 'alibe-button',
}: ButtonProps) {
  const backgroundStyles = BACKGROUND_STYLES[variant];
  const textStyles = TEXT_STYLES[variant];
  const isDisabled = disabled || isLoading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: isDisabled, busy: isLoading }}
      className={`items-center justify-center rounded-full px-6 py-3 ${backgroundStyles} ${
        isDisabled ? 'opacity-50' : 'opacity-100'
      }`}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => tw`${pressed ? 'opacity-75' : ''}`}
      testID={testID}
    >
      {isLoading ? (
        <ActivityIndicator
          color={SPINNER_COLORS[variant]}
          testID={`${testID}-loading`}
        />
      ) : (
        <Text className={`font-poppins text-base ${textStyles}`}>{title}</Text>
      )}
    </Pressable>
  );
}
