import { Pressable, Text } from 'react-native';
import tw from 'twrnc';

type ButtonVariant = 'primary' | 'secondary';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
}

export function Button({ title, onPress, variant = 'primary', disabled = false }: ButtonProps) {
  const variantStyles = variant === 'primary' ? 'bg-coral' : 'bg-lime';
  const textStyles = variant === 'primary' ? 'text-white' : 'text-ink';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      className={`items-center justify-center rounded-full px-6 py-3 ${variantStyles} ${disabled ? 'opacity-50' : 'opacity-100'}`}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => tw`${pressed ? 'opacity-75' : ''}`}
    >
      <Text className={`text-base font-bold ${textStyles}`}>{title}</Text>
    </Pressable>
  );
}
