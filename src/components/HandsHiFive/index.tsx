import { useFocusEffect } from 'expo-router';
import LottieView from 'lottie-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import tw from 'twrnc';

import loginAnimation from '@/assets/animations/login-hands-hi-five.json';
import SignUpHands from '@/assets/images/auth-hands-decoration.svg';
import EventCreatedHands from '@/assets/images/hands-green.svg';
import LoginHands from '@/assets/images/login-hands-decoration.svg';
import { theme } from '@/theme';
import { recolorLottie } from '@/utils/lottie';

export type HandsHiFiveVariant = 'login' | 'sign-up' | 'event-created';

export interface HandsHiFiveProps {
  readonly variant: HandsHiFiveVariant;
  /**
   * Plays on demand instead of on focus: the resting artwork shows while it is 0, and every new
   * value (e.g. a counter bumped on each copy) plays the animation once more.
   */
  readonly playKey?: number;
}

// Every screen uses the same animation, but with a different color palette.
// The keys are the colors stored in the animation file, so they stay literal on purpose.
const SIGN_UP_COLORS = {
  '#FA8456': theme.colors.lime,
  '#DCF290': theme.colors.pink,
  '#036147': theme.colors.pinkDeep,
  '#FFFBF6': theme.colors.ink,
};

const EVENT_CREATED_COLORS = {
  '#FA8456': theme.colors.lime,
  '#DCF290': theme.colors.ink,
  '#036147': theme.colors.lime,
  '#FFFBF6': theme.colors.ink,
  '#FFC9EB': theme.colors.ink,
};

const ANIMATIONS = {
  login: loginAnimation,
  'sign-up': recolorLottie(loginAnimation, SIGN_UP_COLORS),
  'event-created': recolorLottie(loginAnimation, EVENT_CREATED_COLORS),
};

const STATIC_ARTWORK = {
  login: { Artwork: LoginHands, viewBox: '0 0 390 280' },
  'sign-up': { Artwork: SignUpHands, viewBox: '0 0 390 280' },
  // Its canvas is taller and starts higher, so it is cropped to the animation's frame.
  'event-created': { Artwork: EventCreatedHands, viewBox: '0 0 390 280' },
};

/**
 * Plays once each time the screen gains focus, or on each new `playKey`, and rests on the same
 * drawing as the artwork.
 */
export function HandsHiFive({ variant, playKey }: HandsHiFiveProps) {
  const playsOnDemand = playKey !== undefined;
  const [reduceMotion, setReduceMotion] = useState<boolean | null>(null);
  const [hasFailed, setHasFailed] = useState(false);
  // Remounting replays it when the user comes back to a screen that stayed mounted.
  const [playCount, setPlayCount] = useState(0);
  const isFirstFocus = useRef(true);

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

  useFocusEffect(
    useCallback(() => {
      if (playsOnDemand) {
        return;
      }
      if (isFirstFocus.current) {
        isFirstFocus.current = false;
        return;
      }
      setPlayCount((current) => current + 1);
    }, [playsOnDemand])
  );

  // Before the first play, the artwork is the drawing the animation comes to rest on.
  const isWaitingToPlay = playsOnDemand && playKey === 0;

  if (reduceMotion !== false || hasFailed || isWaitingToPlay) {
    const { Artwork, viewBox } = STATIC_ARTWORK[variant];
    return (
      <Artwork
        width="100%"
        height="100%"
        viewBox={viewBox}
        testID="hands-hi-five-artwork"
      />
    );
  }

  const fillStyle = tw`h-full w-full`;

  return (
    <LottieView
      key={playsOnDemand ? playKey : playCount}
      autoPlay
      loop={false}
      onAnimationFailure={() => {
        setHasFailed(true);
      }}
      source={ANIMATIONS[variant]}
      style={fillStyle}
      testID="hands-hi-five-animation"
      webStyle={fillStyle}
    />
  );
}
