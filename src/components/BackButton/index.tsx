import { Pressable, Text } from 'react-native';

interface BackButtonProps {
  onPress: () => void;
}

export function BackButton({ onPress }: BackButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
    >
      <Text className="mt-8 text-3xl font-black text-ink">
        ←
      </Text>
    </Pressable>
  );
}