import { Image } from 'expo-image';
import LottieView from 'lottie-react-native';
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, View } from 'react-native';
import tw from 'twrnc';

import ribbonBottomAnimation from '@/assets/animations/splash-ribbon-bottom.json';
import ribbonTopAnimation from '@/assets/animations/splash-ribbon-top.json';
import RibbonBottom from '@/assets/images/splash-detail-bottom.svg';
import RibbonTop from '@/assets/images/splash-detail-top.svg';
import splashLogo from '@/assets/images/splash-logo.png';

const HOLD_DURATION_MS = 250;
const FADE_DURATION_MS = 350;
// Never keep the app behind the splash if the animation fails to report its end.
const MAX_DURATION_MS = 4000;

export interface AnimatedSplashProps {
  onFinish: () => void;
}

export function AnimatedSplash({ onFinish }: AnimatedSplashProps) {
  const opacity = useRef(new Animated.Value(1)).current;
  const isLeaving = useRef(false);
  const [reduceMotion, setReduceMotion] = useState<boolean | null>(null);

  const leave = () => {
    if (isLeaving.current) return;
    isLeaving.current = true;
    Animated.timing(opacity, {
      toValue: 0,
      duration: FADE_DURATION_MS,
      delay: HOLD_DURATION_MS,
      useNativeDriver: true,
    }).start(() => {
      onFinish();
    });
  };

  useEffect(() => {
    let isMounted = true;
    void AccessibilityInfo.isReduceMotionEnabled()
      .catch(() => false)
      .then((enabled) => {
        if (isMounted) setReduceMotion(enabled);
      });
    const fallback = setTimeout(leave, MAX_DURATION_MS);
    return () => {
      isMounted = false;
      clearTimeout(fallback);
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) leave();
  }, [reduceMotion]);

  const ribbonStyle = tw`h-full w-full`;

  return (
    <Animated.View
      accessibilityLabel="Alibe"
      accessibilityRole="image"
      style={[tw`absolute inset-0`, { opacity }]}
      testID="splash-screen"
    >
      <View className="flex-1 items-center justify-center overflow-hidden bg-canvas">
        {reduceMotion === null ? null : (
          <>
            <View
              accessible={false}
              className="absolute right-0 top-0 aspect-[344/312] w-[88%] max-w-md"
            >
              {reduceMotion ? (
                <RibbonTop
                  width="100%"
                  height="100%"
                />
              ) : (
                <LottieView
                  autoPlay
                  loop={false}
                  source={ribbonTopAnimation}
                  style={ribbonStyle}
                  testID="splash-ribbon-top"
                  webStyle={ribbonStyle}
                />
              )}
            </View>

            <View
              accessible={false}
              className="absolute bottom-0 left-0 aspect-[304/320] w-[78%] max-w-md"
            >
              {reduceMotion ? (
                <RibbonBottom
                  width="100%"
                  height="100%"
                />
              ) : (
                <LottieView
                  autoPlay
                  loop={false}
                  onAnimationFailure={leave}
                  onAnimationFinish={leave}
                  source={ribbonBottomAnimation}
                  style={ribbonStyle}
                  testID="splash-ribbon-bottom"
                  webStyle={ribbonStyle}
                />
              )}
            </View>
          </>
        )}

        {/* Same image and width as the native splash in app.config.ts, so the handoff is seamless. */}
        <Image
          accessible={false}
          contentFit="contain"
          source={splashLogo}
          style={tw`h-42 w-42`}
        />
      </View>
    </Animated.View>
  );
}
