import { useId } from 'react';
import { Animated, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import tw from 'twrnc';

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
const TAIL_STOPS = [
  { offset: 0, opacity: 1 },
  { offset: 1, opacity: 0 },
];
/** How far the fade reaches below a floating header. */
export const TOP_FADE_TAIL = Number(tw`pb-6`.paddingBottom);

interface FadeStop {
  readonly offset: number;
  readonly opacity: number;
}

interface GradientProps {
  readonly color: string;
  readonly stops: readonly FadeStop[];
  readonly height: number | `${number}%`;
}

// The stops never change after mount: react-native-svg can stop painting a gradient whose stops
// are replaced, which left the content visible behind the header.
function Gradient({ color, stops, height }: GradientProps) {
  // Ids are scoped per screen, so stacked screens never resolve each other's gradient.
  const gradientId = `screen-frame-top-fade-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;

  return (
    <Svg
      width="100%"
      height={height}
    >
      <Defs>
        <LinearGradient
          id={gradientId}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          {stops.map((stop) => (
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
        fill={`url(#${gradientId})`}
      />
    </Svg>
  );
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
      {solidHeight === undefined ? (
        <Gradient
          color={color}
          stops={FADE_STOPS}
          height="100%"
        />
      ) : (
        <>
          {/* A plain view follows the measured header height without touching the gradient. */}
          <View
            style={{ height: solidHeight, backgroundColor: color }}
            testID="screen-frame-top-fade-solid"
          />
          <Gradient
            color={color}
            stops={TAIL_STOPS}
            height={TOP_FADE_TAIL}
          />
        </>
      )}
    </Animated.View>
  );
}
