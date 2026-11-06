import { Animated } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import tw from 'twrnc';

const GRADIENT_ID = 'screen-frame-top-fade';
const HEIGHT_CLASS = 'h-40';
// Short on purpose: screens that barely scroll must still reach full strength.
const REVEAL_DISTANCE = Number(tw`pb-12`.paddingBottom);
// Opaque above the back button so content there is illegible, about 60% at its lower edge,
// then dissolving into the content below it.
const FADE_STOPS = [
  { offset: 0.45, opacity: 1 },
  { offset: 0.6, opacity: 0.6 },
  { offset: 1, opacity: 0 },
];
/** How far the fade reaches below a floating header. */
export const TOP_FADE_TAIL = Number(tw`pb-6`.paddingBottom);

function getStops(solidHeight?: number) {
  if (solidHeight === undefined) return FADE_STOPS;
  return [
    { offset: solidHeight / (solidHeight + TOP_FADE_TAIL), opacity: 1 },
    { offset: 1, opacity: 0 },
  ];
}

export interface TopFadeProps {
  readonly color: string;
  readonly scrollOffset: Animated.Value;
  /** Keeps the fade on at rest, for screens whose content fits without scrolling. */
  readonly alwaysVisible?: boolean;
  /** Height kept fully opaque behind a floating header; the fade ends just below it. */
  readonly solidHeight?: number;
}

export function TopFade({ color, scrollOffset, alwaysVisible = false, solidHeight }: TopFadeProps) {
  // Otherwise hidden at rest so it never covers artwork at the top of the screen.
  const opacity = alwaysVisible
    ? 1
    : scrollOffset.interpolate({
        inputRange: [0, REVEAL_DISTANCE],
        outputRange: [0, 1],
        extrapolate: 'clamp',
      });

  return (
    <Animated.View
      style={[
        tw`absolute inset-x-0 top-0 ${HEIGHT_CLASS}`,
        solidHeight === undefined ? null : { height: solidHeight + TOP_FADE_TAIL },
        { opacity, pointerEvents: 'none' },
      ]}
      testID="screen-frame-top-fade"
    >
      <Svg
        width="100%"
        height="100%"
      >
        <Defs>
          <LinearGradient
            id={GRADIENT_ID}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            {getStops(solidHeight).map((stop) => (
              <Stop
                key={stop.offset}
                offset={stop.offset}
                stopColor={color}
                stopOpacity={stop.opacity}
              />
            ))}
          </LinearGradient>
        </Defs>
        <Rect
          width="100%"
          height="100%"
          fill={`url(#${GRADIENT_ID})`}
        />
      </Svg>
    </Animated.View>
  );
}
