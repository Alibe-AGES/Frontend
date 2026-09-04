import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import tw from 'twrnc';

import backArrowIcon from '@/assets/images/back-arrow.svg';
import { theme } from '@/theme';

export interface BackButtonProps {
  onPress?: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
}

export function BackButton({
  onPress,
  disabled = false,
  accessibilityLabel = 'Voltar',
}: BackButtonProps) {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }

    router.back();
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={handlePress}
      hitSlop={16}
      className={`items-center justify-center ${disabled ? 'opacity-50' : 'opacity-100'}`}
      style={({ pressed }) => tw`${pressed ? 'opacity-60' : ''}`}
      testID="alibe-back-button"
    >
      <Image
        source={backArrowIcon}
        accessible={false}
        contentFit="contain"
        tintColor={theme.colors.ink}
        style={tw`h-6 w-8`}
      />
    </Pressable>
  );
}
