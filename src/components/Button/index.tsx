import { useState } from 'react';
import { Pressable, Text } from 'react-native';
import tw from 'twrnc';

export type ButtonVariant = 'primary' | 'secondary';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
}: ButtonProps) {
  const [isActivated, setIsActivated] = useState(false);

  const variantStyles = variant === 'primary' ? 'bg-coral' : 'bg-lime';
  const backgroundStyles = isActivated ? 'bg-ink' : variantStyles;
  const textStyles = variant === 'primary' ? 'text-white' : 'text-ink';
  const isDisabled = disabled;

  const handlePress = () => {
    setIsActivated(true);
    onPress?.();
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      className={`items-center justify-center rounded-full px-6 py-3 ${backgroundStyles} ${
        isDisabled ? 'opacity-50' : 'opacity-100'
      }`}
      disabled={isDisabled}
      testID="alibe-button"
      onPress={handlePress}
      style={({ pressed }) => tw`${pressed ? 'opacity-75' : ''}`}
    >
      <Text className={`text-base font-normal ${textStyles}`}>
        {title}
      </Text>
    </Pressable>
  );
}
