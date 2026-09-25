import { View } from 'react-native';

import GreenSpin from '@/assets/images/green-spin.svg';
import GroupSpin from '@/assets/images/group-spin-2.svg';
import Logo from '@/assets/images/Logo.svg';

export function LoadingScreen() {
  return (
    <View
      className="relative flex-1 items-center justify-center overflow-hidden bg-canvas"
      testID="alibe-loading-screen"
    >
      <View
        accessible={false}
        className="absolute -right-[8%] -top-[8%] h-[38%] w-[38%]"
      >
        <GreenSpin
          width="100%"
          height="100%"
          testID="alibe-loading-top-decoration"
        />
      </View>

      <View
        accessible={false}
        className="absolute -bottom-[8%] -left-[8%] h-[38%] w-[38%] rotate-180"
      >
        <GreenSpin
          width="100%"
          height="100%"
          testID="alibe-loading-bottom-decoration"
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
            testID="alibe-loading-logo-symbol"
          />
        </View>

        <View
          accessibilityLabel="Alibe"
          className="aspect-[269/133] w-[40%] max-w-64"
        >
          <Logo
            width="100%"
            height="100%"
            testID="alibe-loading-logo-text"
          />
        </View>
      </View>
    </View>
  );
}
