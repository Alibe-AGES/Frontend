import { Pressable, Text } from 'react-native';
import tw from 'twrnc';

export type ButtonVariant = 'primary' | 'secondary';

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
  const variantStyles = variant === 'primary' ? 'bg-coral' : 'bg-lime';
  const textStyles = variant === 'primary' ? 'text-white' : 'text-ink';
  const isDisabled = disabled || isLoading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: isDisabled }}
      className={`items-center justify-center rounded-full px-6 py-3 ${variantStyles} ${
        isDisabled ? 'opacity-50' : 'opacity-100'
      }`}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => tw`${pressed ? 'opacity-75' : ''}`}
      testID={testID}
    >
      <Text className={`text-base font-normal ${textStyles}`}>
        {isLoading ? 'Carregando...' : title}
      </Text>
    </Pressable>
  );
}
