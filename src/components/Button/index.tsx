import { useState } from 'react';
import { Pressable, Text } from 'react-native';
import tw from 'twrnc';

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
}

export function Button({ title, onPress, variant = 'primary', disabled = false }: ButtonProps) {
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
      className={`items-center justify-center rounded-full px-6 py-3 ${backgroundStyles} ${disabled ? 'opacity-50' : 'opacity-100'}`}
      disabled={disabled}
      onPress={handlePress}
      style={({ pressed }) => tw`${pressed ? 'opacity-75' : ''}`}
      testID="alibe-button"
    >
      <Text className={`text-base font-bold ${textStyles}`}>{title}</Text>
    </Pressable>
  );
}
