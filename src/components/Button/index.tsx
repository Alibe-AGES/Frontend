import { useState } from 'react';
import { Pressable, Text } from 'react-native';

type ButtonVariant = 'primary' | 'secondary';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  color?: string;
}

const BUTTON_VARIANTS = {
  primary: {
    background: 'bg-coral',
    text: 'text-white',
  },
  secondary: {
    background: 'bg-lime',
    text: 'text-ink',
  },
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  color,
}: ButtonProps) {
  const [isActivated, setIsActivated] = useState(false);

  const styles = BUTTON_VARIANTS[variant];
  const currentBackground = isActivated ? 'bg-ink' : styles.background;

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
        color && !isActivated ? '' : currentBackground
      } ${disabled ? 'opacity-50' : 'opacity-100'}`}
      style={color && !isActivated ? { backgroundColor: color } : undefined}
    >
      <Text className={`font-poppins-light text-base ${styles.text}`}>{title}</Text>
    </Pressable>
  );
}
