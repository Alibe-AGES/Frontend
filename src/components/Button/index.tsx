import { useState } from 'react';
import { Pressable, Text } from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary';

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

interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  color?: string;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  color,
}: ButtonProps) {
  const [isActivated, setIsActivated] = useState(false);
  const textStyles = TEXT_STYLES[variant];
  const backgroundStyles = isActivated ? 'bg-ink' : BACKGROUND_STYLES[variant];

  const handlePress = () => {
    setIsActivated(true);
    onPress?.();
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={handlePress}
      testID="alibe-button"
      className={`items-center justify-center rounded-full px-6 py-3 active:opacity-75 ${
        color && !isActivated ? '' : backgroundStyles
      } ${disabled ? 'opacity-50' : 'opacity-100'}`}
      style={color && !isActivated ? { backgroundColor: color } : undefined}
    >
      <Text className={`font-poppins text-base ${textStyles}`}>{title}</Text>
    </Pressable>
  );
}
