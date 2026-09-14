import { Image } from 'expo-image';
import { View } from 'react-native';

import greenSpin from '@/assets/images/green-spin.svg';
import groupSpin from '@/assets/images/group-spin-2.svg';
import logo from '@/assets/images/Logo.svg';

export function LoadingScreen() {
  return (
    <View
      className="relative flex-1 items-center justify-center overflow-hidden bg-canvas"
      testID="alibe-loading-screen"
    >
      <Image
        source={greenSpin}
        accessible={false}
        contentFit="contain"
        className="absolute -right-[8%] -top-[8%] h-[38%] w-[38%]"
      />

      <Image
        source={greenSpin}
        accessible={false}
        contentFit="contain"
        className="absolute -bottom-[8%] -left-[8%] h-[38%] w-[38%] rotate-180"
      />

      <View className="w-full items-center gap-[4%] px-[8%]">
        <Image
          source={groupSpin}
          accessible={false}
          contentFit="contain"
          className="aspect-square w-[14%] max-w-24"
        />

        <Image
          source={logo}
          accessible
          accessibilityLabel="Alibe"
          contentFit="contain"
          className="aspect-[269/133] w-[40%] max-w-64"
        />
      </View>
    </View>
  );
}
