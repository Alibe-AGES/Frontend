import { useState } from 'react';
import { View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import tw from 'twrnc';

import type {
  ScreenFrameBackground,
  ScreenFrameGap,
  ScreenFramePadding,
  ScreenFrameProps,
} from './ScreenFrame.types';

export type {
  ScreenFrameBackground,
  ScreenFrameGap,
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
  testID,
}: ScreenFrameProps) {
  const [footerHeight, setFooterHeight] = useState(0);
  const hasHeader = header !== undefined && header !== null;
  const hasFooter = footer !== undefined && footer !== null;

  // The footer floats over the content, so the content reserves its measured height.
  let paddingBottom = 0;
  if (hasFooter) {
    paddingBottom = scrollable ? footerHeight + FOOTER_SPACING : footerHeight;
  }
  const contentStyle = [tw`${getContentPadding(padding, hasHeader)}`, { paddingBottom }];

  return (
    <View className={`flex-1 ${BACKGROUND_CLASSES[background]}`}>
      {hasHeader ? <View className={HEADER_PADDING_CLASSES[padding]}>{header}</View> : null}

      {scrollable ? (
        <KeyboardAwareScrollView
          style={tw`flex-1`}
          contentContainerStyle={[tw`flex-grow`, contentStyle]}
          bottomOffset={KEYBOARD_BOTTOM_OFFSET}
          keyboardShouldPersistTaps="handled"
          testID={testID}
        >
          <View className={`flex-grow ${GAP_CLASSES[gap]}`}>{children}</View>
        </KeyboardAwareScrollView>
      ) : (
        <View
          className={`flex-1 ${GAP_CLASSES[gap]}`}
          style={contentStyle}
          testID={testID}
        >
          {children}
        </View>
      )}

      {hasFooter ? (
        <View
          className="absolute inset-x-0 bottom-0"
          onLayout={(event) => {
            setFooterHeight(event.nativeEvent.layout.height);
          }}
          testID="screen-frame-footer"
        >
          {footer}
        </View>
      ) : null}
    </View>
  );
}
