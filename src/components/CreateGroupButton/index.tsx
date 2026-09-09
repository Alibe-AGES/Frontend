import { Pressable, View } from 'react-native';
import tw from 'twrnc';

interface CreateGroupButtonProps {
  onPress?: () => void;
  disabled?: boolean;
}

export function CreateGroupButton({ onPress, disabled = false }: CreateGroupButtonProps) {
  return (
    <Pressable
      accessibilityLabel="Criar novo grupo"
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      className={`h-14 w-14 items-center justify-center rounded-full bg-ink ${
        disabled ? 'opacity-50' : 'opacity-100'
      }`}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => tw`${pressed ? 'opacity-75' : ''}`}
      testID="create-group-button"
    >
      <View className="absolute h-1 w-6 rounded-full bg-lime" />
      <View className="absolute h-6 w-1 rounded-full bg-lime" />
    </Pressable>
  );
}
