import { theme } from '@/theme';
import { type ReactNode, useState } from 'react';
import {
  Animated,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type StyleProp,
  View,
  type ViewStyle,
} from 'react-native';
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

type ScreenFrameTopFade = NonNullable<ScreenFrameProps['topFade']>;

function getContentPadding(padding: ScreenFramePadding, hasHeader: boolean) {
  if (padding === 'default') {
    return hasHeader ? 'px-6 pt-2' : 'px-6 pt-16';
  }

  return padding === 'horizontal' ? 'px-6' : '';
}

function isPresent(node: ReactNode) {
  return node !== undefined && node !== null;
}

function getHeaderClasses(padding: ScreenFramePadding, floatingChrome: boolean) {
  if (!floatingChrome) {
    return HEADER_PADDING_CLASSES[padding];
  }

  return `absolute inset-x-0 top-0 ${padding === 'none' ? '' : FLOATING_HEADER_PADDING}`;
}

interface ContentPaddingBottomOptions {
  readonly hasFooter: boolean;
  readonly insetsBelongToList: boolean;
  readonly scrollable: boolean;
  readonly bottomInset: number;
  readonly footerHeight: number;
}

// The footer floats over the content, so the content reserves its measured height.
function getContentPaddingBottom({
  hasFooter,
  insetsBelongToList,
  scrollable,
  bottomInset,
  footerHeight,
}: ContentPaddingBottomOptions) {
  if (!hasFooter || insetsBelongToList) {
    return 0;
  }

  return scrollable ? bottomInset : footerHeight;
}

function shouldShowTopFade(topFade: ScreenFrameTopFade, scrollable: boolean) {
  if (topFade === 'always' || topFade === 'header') {
    return true;
  }

  return topFade && scrollable;
}

interface MeasuredSlotProps {
  readonly children: ReactNode;
  readonly className: string;
  readonly onHeightChange: (height: number) => void;
  readonly testID: string;
}

function MeasuredSlot({ children, className, onHeightChange, testID }: MeasuredSlotProps) {
  return (
    <View
      className={className}
      pointerEvents="box-none"
      onLayout={(event) => {
        onHeightChange(event.nativeEvent.layout.height);
      }}
      testID={testID}
    >
      {children}
    </View>
  );
}

interface ScreenFrameBodyProps {
  readonly children: ReactNode;
  readonly scrollable: boolean;
  readonly gap: ScreenFrameGap;
  readonly contentStyle: StyleProp<ViewStyle>;
  readonly scrollOffset: Animated.Value;
  readonly tracksScroll: boolean;
  readonly testID?: string;
}

function ScreenFrameBody({
  children,
  scrollable,
  gap,
  contentStyle,
  scrollOffset,
  tracksScroll,
  testID,
}: ScreenFrameBodyProps) {
  if (!scrollable) {
    return (
      <View
        className={`flex-1 ${GAP_CLASSES[gap]}`}
        style={contentStyle}
        testID={testID}
      >
        {children}
      </View>
    );
  }

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollOffset.setValue(event.nativeEvent.contentOffset.y);
  };

  return (
    <KeyboardAwareScrollView
      style={tw`flex-1`}
      contentContainerStyle={[tw`flex-grow`, contentStyle]}
      bottomOffset={KEYBOARD_BOTTOM_OFFSET}
      keyboardShouldPersistTaps="handled"
      onScroll={tracksScroll ? handleScroll : undefined}
      testID={testID}
    >
      <View className={`flex-grow ${GAP_CLASSES[gap]}`}>{children}</View>
    </KeyboardAwareScrollView>
  );
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
  const hasHeader = isPresent(header);
  const hasFooter = isPresent(footer);
  const isFadeAlwaysOn = topFade === 'always' || topFade === 'header';
  const topInset = floatingChrome && hasHeader ? headerHeight + TOP_FADE_TAIL : 0;
  const bottomInset = hasFooter ? footerHeight + FOOTER_SPACING : 0;
  // A virtualized list scrolls behind the chrome, so it applies the insets to its own content.
  const insetsBelongToList = floatingChrome && !scrollable;

  const paddingBottom = getContentPaddingBottom({
    hasFooter,
    insetsBelongToList,
    scrollable,
    bottomInset,
    footerHeight,
  });
  const contentStyle = [
    tw`${getContentPadding(padding, hasHeader && !floatingChrome)}`,
    { paddingBottom },
  ];
  const content = typeof children === 'function' ? children({ topInset, bottomInset }) : children;

  const headerElement = hasHeader ? (
    <MeasuredSlot
      className={getHeaderClasses(padding, floatingChrome)}
      onHeightChange={setHeaderHeight}
      testID="screen-frame-header"
    >
      {header}
    </MeasuredSlot>
  ) : null;

  return (
    <View className={`flex-1 ${BACKGROUND_CLASSES[background]}`}>
      {floatingChrome ? null : headerElement}

      <ScreenFrameBody
        scrollable={scrollable}
        gap={gap}
        contentStyle={contentStyle}
        scrollOffset={scrollOffset}
        tracksScroll={topFade !== false}
        testID={testID}
      >
        {content}
      </ScreenFrameBody>

      {hasFooter ? (
        <MeasuredSlot
          className="absolute inset-x-0 bottom-0"
          onHeightChange={setFooterHeight}
          testID="screen-frame-footer"
        >
          {footer}
        </MeasuredSlot>
      ) : null}

      {shouldShowTopFade(topFade, scrollable) ? (
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
