import LottieView from 'lottie-react-native';
import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import tw from 'twrnc';

import matchAnimation from '@/assets/animations/match-hi-five-hands.json';
import MatchHands from '@/assets/images/match-hi-five-hands.svg';

/**
 * Two arms giving each other a high five, on loop. One cycle of the animation lasts 1.5 s: the
 * slap takes the first part and the rest holds the drawing, so the high five replays every 1.5 s.
 * The animation is generated from the SVG (scripts/generate-match-hi-five-animation.js), so it
 * rests on the same drawing that is shown when motion is reduced or the animation fails.
 */
export function MatchHiFive() {
  const [reduceMotion, setReduceMotion] = useState<boolean | null>(null);
  const [hasFailed, setHasFailed] = useState(false);

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

  if (reduceMotion !== false || hasFailed) {
    return (
      <MatchHands
        width="100%"
        height="100%"
        testID="match-hi-five-artwork"
      />
    );
  }

  const fillStyle = tw`h-full w-full`;

  return (
    <LottieView
      autoPlay
      loop
      onAnimationFailure={() => {
        setHasFailed(true);
      }}
      source={matchAnimation}
      style={fillStyle}
      testID="match-hi-five-animation"
      webStyle={fillStyle}
    />
  );
}
