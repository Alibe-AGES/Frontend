import LottieView from 'lottie-react-native';
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, useWindowDimensions, View } from 'react-native';
import tw from 'twrnc';

import logoAnimation from '@/assets/animations/splash-logo.json';
import ribbonBottomAnimation from '@/assets/animations/splash-ribbon-bottom.json';
import ribbonTopAnimation from '@/assets/animations/splash-ribbon-top.json';
import RibbonBottom from '@/assets/images/splash-detail-bottom.svg';
import RibbonTop from '@/assets/images/splash-detail-top.svg';
import SplashLogo from '@/assets/images/splash-logo.svg';

const HOLD_DURATION_MS = 250;
const FADE_DURATION_MS = 350;
const REPLAY_FADE_IN_MS = 200;
// Never keep the splash waiting on an animation that fails to report its end.
const MAX_CYCLE_DURATION_MS = 4000;
// The splash layout was drawn on a 390 x 844 screen; the ribbons and the logo scale with
// it so they keep clear of each other on short screens too.
const DESIGN_WIDTH = 390;
const DESIGN_HEIGHT = 844;
const RIBBON_TOP_WIDTH = 344;
const RIBBON_BOTTOM_WIDTH = 304;
const LOGO_WIDTH = 268;

export interface AnimatedSplashProps {
  /** Whether the app finished loading. The splash only leaves at the end of an animation cycle. */
  isReady: boolean;
  onFinish: () => void;
}

export function AnimatedSplash({ isReady, onFinish }: AnimatedSplashProps) {
  const opacity = useRef(new Animated.Value(1)).current;
  const contentOpacity = useRef(new Animated.Value(1)).current;
  const isLeaving = useRef(false);
  const [reduceMotion, setReduceMotion] = useState<boolean | null>(null);
  const [hasAnimationFailed, setHasAnimationFailed] = useState(false);
  // Each replay remounts the animations, so events from an older cycle never count.
  const [cycle, setCycle] = useState(0);
  const [finishedCycle, setFinishedCycle] = useState(-1);
  const isStatic = reduceMotion === true || hasAnimationFailed;
  const isCycleFinished = finishedCycle === cycle;

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
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (isStatic) return;
    const watchdog = setTimeout(() => {
      setFinishedCycle(cycle);
    }, MAX_CYCLE_DURATION_MS);
    return () => {
      clearTimeout(watchdog);
    };
  }, [cycle, isStatic]);

  useEffect(() => {
    if (isStatic) {
      contentOpacity.setValue(1);
      if (isReady) leave();
      return;
    }
    if (!isCycleFinished) return;
    if (isReady) {
      leave();
      return;
    }
    // Still loading: fade the finished drawing away and play it again from the start.
    Animated.timing(contentOpacity, {
      toValue: 0,
      duration: FADE_DURATION_MS,
      delay: HOLD_DURATION_MS,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setCycle((current) => current + 1);
    });
    return () => {
      contentOpacity.stopAnimation();
    };
  }, [isCycleFinished, isReady, isStatic]);

  useEffect(() => {
    if (cycle === 0) return;
    Animated.timing(contentOpacity, {
      toValue: 1,
      duration: REPLAY_FADE_IN_MS,
      useNativeDriver: true,
    }).start();
  }, [cycle]);

  const screen = useWindowDimensions();
  const designScale = Math.min(screen.width / DESIGN_WIDTH, screen.height / DESIGN_HEIGHT);
  const fillStyle = tw`h-full w-full`;
  const failAnimation = () => {
    setHasAnimationFailed(true);
  };

  return (
    <Animated.View
      accessibilityLabel="Alibe"
      accessibilityRole="image"
      style={[tw`absolute inset-0`, { opacity }]}
      testID="splash-screen"
    >
      <View className="flex-1 overflow-hidden bg-canvas">
        {reduceMotion === null ? null : (
          <Animated.View
            style={[tw`flex-1 items-center justify-center`, { opacity: contentOpacity }]}
          >
            <View
              accessible={false}
              className="absolute right-0 top-0 aspect-[344/312]"
              style={{ width: RIBBON_TOP_WIDTH * designScale }}
            >
              {isStatic ? (
                <RibbonTop
                  width="100%"
                  height="100%"
                />
              ) : (
                <LottieView
                  key={cycle}
                  autoPlay
                  loop={false}
                  onAnimationFailure={failAnimation}
                  source={ribbonTopAnimation}
                  style={fillStyle}
                  testID="splash-ribbon-top"
                  webStyle={fillStyle}
                />
              )}
            </View>

            <View
              accessible={false}
              className="absolute bottom-0 left-0 aspect-[304/320]"
              style={{ width: RIBBON_BOTTOM_WIDTH * designScale }}
            >
              {isStatic ? (
                <RibbonBottom
                  width="100%"
                  height="100%"
                />
              ) : (
                <LottieView
                  key={cycle}
                  autoPlay
                  loop={false}
                  onAnimationFailure={failAnimation}
                  source={ribbonBottomAnimation}
                  style={fillStyle}
                  testID="splash-ribbon-bottom"
                  webStyle={fillStyle}
                />
              )}
            </View>

            <View
              accessible={false}
              className="aspect-[268/273]"
              style={{ width: LOGO_WIDTH * designScale }}
            >
              {isStatic ? (
                <SplashLogo
                  width="100%"
                  height="100%"
                />
              ) : (
                <LottieView
                  key={cycle}
                  autoPlay
                  loop={false}
                  onAnimationFailure={failAnimation}
                  onAnimationFinish={(isCancelled) => {
                    if (!isCancelled) setFinishedCycle(cycle);
                  }}
                  source={logoAnimation}
                  style={fillStyle}
                  testID="splash-logo"
                  webStyle={fillStyle}
                />
              )}
            </View>
          </Animated.View>
        )}
      </View>
    </Animated.View>
  );
}
