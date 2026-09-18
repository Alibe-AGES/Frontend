import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

import GreenSpin from '@/assets/images/green-spin.svg';
import GroupSpin from '@/assets/images/group-spin-2.svg';
import Logo from '@/assets/images/Logo.svg';

export function LoadingScreen() {
  const router = useRouter();

  const handlePress = () => {
    router.replace('/groups');
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Continuar para meus grupos"
      className="flex-1"
      onPress={handlePress}
      testID="alibe-loading-screen"
    >
      <View
        className="relative flex-1 items-center justify-center overflow-hidden bg-canvas"
        pointerEvents="none"
      >
        <View
          accessible={false}
          className="absolute -right-[8%] -top-[8%] h-[38%] w-[38%]"
        >
          <GreenSpin
            width="100%"
            height="100%"
          />
        </View>

        <View
          accessible={false}
          className="absolute -bottom-[8%] -left-[8%] h-[38%] w-[38%] rotate-180"
        >
          <GreenSpin
            width="100%"
            height="100%"
          />
        </View>

        <View className="w-full items-center gap-[4%] px-[8%]">
          <View
            accessible={false}
            className="aspect-square w-[14%] max-w-24"
          >
            <GroupSpin
              width="100%"
              height="100%"
            />
          </View>

          <View
            accessibilityLabel="Alibe"
            className="aspect-[269/133] w-[40%] max-w-64"
          >
            <Logo
              width="100%"
              height="100%"
            />
          </View>
        </View>
      </View>
    </Pressable>
  );
}
