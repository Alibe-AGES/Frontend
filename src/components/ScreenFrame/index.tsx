import { theme } from '@/theme';
import { useState } from 'react';
import { Animated, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import tw from 'twrnc';

import { TOP_FADE_TAIL, TopFade } from './TopFade';
import type {
  ScreenFrameBackground,
  ScreenFrameGap,
  ScreenFramePadding,
  ScreenFrameProps,
} from './ScreenFrame.types';

export type {
  ScreenFrameBackground,
  ScreenFrameGap,
  ScreenFrameLayout,
  ScreenFramePadding,
  ScreenFrameProps,
} from './ScreenFrame.types';

const BACKGROUND_CLASSES: Record<ScreenFrameBackground, string> = {
  canvas: 'bg-canvas',
  surface: 'bg-surface',
};

const HEADER_PADDING_CLASSES: Record<ScreenFramePadding, string> = {
  default: 'px-6 pb-3 pt-16',
  horizontal: 'px-6 pb-3',
  none: '',
};

// A floating header sets its own position, because the content may start at the top of the screen.
const FLOATING_HEADER_PADDING = 'px-6 pb-3 pt-20';

const GAP_CLASSES: Record<ScreenFrameGap, string> = {
  none: '',
  md: 'gap-4',
  lg: 'gap-6',
};

// Distance kept between the focused input and the top of the keyboard.
const KEYBOARD_BOTTOM_OFFSET = Number(tw`pb-8`.paddingBottom);
// Breathing room between the last scrollable item and a pinned footer.
const FOOTER_SPACING = Number(tw`pb-8`.paddingBottom);

function getContentPadding(padding: ScreenFramePadding, hasHeader: boolean) {
  if (padding === 'default') {
    return hasHeader ? 'px-6 pt-2' : 'px-6 pt-16';
  }

  return padding === 'horizontal' ? 'px-6' : '';
}

export function ScreenFrame({
  children,
  scrollable = true,
  background = 'canvas',
  padding = 'default',
  gap = 'none',
  header,
  footer,
  floatingChrome = false,
  topFade = false,
  testID,
}: ScreenFrameProps) {
  const [headerHeight, setHeaderHeight] = useState(0);
  const [footerHeight, setFooterHeight] = useState(0);
  const [scrollOffset] = useState(() => new Animated.Value(0));
  const hasHeader = header !== undefined && header !== null;
  const hasFooter = footer !== undefined && footer !== null;
  const isFadeAlwaysOn = topFade === 'always' || topFade === 'header';
  const topInset = floatingChrome && hasHeader ? headerHeight + TOP_FADE_TAIL : 0;
  const bottomInset = hasFooter ? footerHeight + FOOTER_SPACING : 0;
  // A virtualized list scrolls behind the chrome, so it applies the insets to its own content.
  const insetsBelongToList = floatingChrome && !scrollable;

  // The footer floats over the content, so the content reserves its measured height.
  let paddingBottom = 0;
  if (hasFooter && !insetsBelongToList) {
    paddingBottom = scrollable ? bottomInset : footerHeight;
  }
  const contentStyle = [
    tw`${getContentPadding(padding, hasHeader && !floatingChrome)}`,
    { paddingBottom },
  ];
  const content = typeof children === 'function' ? children({ topInset, bottomInset }) : children;

  const floatingHeaderClasses = `absolute inset-x-0 top-0 ${
    padding === 'none' ? '' : FLOATING_HEADER_PADDING
  }`;

  const headerElement = hasHeader ? (
    <View
      className={floatingChrome ? floatingHeaderClasses : HEADER_PADDING_CLASSES[padding]}
      pointerEvents="box-none"
      onLayout={(event) => {
        setHeaderHeight(event.nativeEvent.layout.height);
      }}
      testID="screen-frame-header"
    >
      {header}
    </View>
  ) : null;

  return (
    <View className={`flex-1 ${BACKGROUND_CLASSES[background]}`}>
      {floatingChrome ? null : headerElement}

      {scrollable ? (
        <KeyboardAwareScrollView
          style={tw`flex-1`}
          contentContainerStyle={[tw`flex-grow`, contentStyle]}
          bottomOffset={KEYBOARD_BOTTOM_OFFSET}
          keyboardShouldPersistTaps="handled"
          onScroll={
            topFade
              ? (event) => {
                  scrollOffset.setValue(event.nativeEvent.contentOffset.y);
                }
              : undefined
          }
          testID={testID}
        >
          <View className={`flex-grow ${GAP_CLASSES[gap]}`}>{content}</View>
        </KeyboardAwareScrollView>
      ) : (
        <View
          className={`flex-1 ${GAP_CLASSES[gap]}`}
          style={contentStyle}
          testID={testID}
        >
          {content}
        </View>
      )}

      {hasFooter ? (
        <View
          className="absolute inset-x-0 bottom-0"
          pointerEvents="box-none"
          onLayout={(event) => {
            setFooterHeight(event.nativeEvent.layout.height);
          }}
          testID="screen-frame-footer"
        >
          {footer}
        </View>
      ) : null}

      {isFadeAlwaysOn || (topFade && scrollable) ? (
        <TopFade
          alwaysVisible={isFadeAlwaysOn}
          color={theme.colors[background]}
          scrollOffset={scrollOffset}
          solidHeight={topFade === 'header' ? headerHeight : undefined}
        />
      ) : null}

      {floatingChrome ? headerElement : null}
    </View>
  );
}
