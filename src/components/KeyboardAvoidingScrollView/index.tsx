import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { KeyboardEvent, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { Dimensions, Keyboard, Platform, ScrollView, TextInput, View } from 'react-native';

import type { KeyboardAvoidingScrollViewProps } from './KeyboardAvoidingScrollView.types';

export type { KeyboardAvoidingScrollViewProps } from './KeyboardAvoidingScrollView.types';

export const KeyboardScrollContext = createContext<((input: unknown) => void) | null>(null);

export function useKeyboardScrollContext() {
  return useContext(KeyboardScrollContext);
}

const SHOW_EVENT = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
const HIDE_EVENT = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
const SCROLL_DELAY_MS = 100;

export function KeyboardAvoidingScrollView({
  children,
  contentContainerStyle,
  topOffset = 100,
  onScroll,
  ...props
}: KeyboardAvoidingScrollViewProps) {
  const scrollRef = useRef<ScrollView>(null);
  const contentRef = useRef<View>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const keyboardHeightRef = useRef(0);
  const scrollYRef = useRef(0);

  const measureWithWindow = (focusedInput: unknown) => {
    const input = focusedInput as {
      measureInWindow?: (cb: (x: number, y: number, w: number, h: number) => void) => void;
    };
    if (typeof input?.measureInWindow === 'function') {
      input.measureInWindow((_x: number, y: number, _width: number, height: number) => {
        const windowHeight = Dimensions.get('window').height;
        const currentKbHeight = keyboardHeightRef.current;
        const keyboardTop = windowHeight - currentKbHeight;
        const inputBottom = y + height;

        if (inputBottom > keyboardTop - 30) {
          const overlap = inputBottom - (keyboardTop - 30);
          scrollRef.current?.scrollTo({
            y: scrollYRef.current + overlap,
            animated: true,
          });
        }
      });
    }
  };

  const scrollToInput = (input: unknown) => {
    if (!input) {
      return;
    }

    const nativeInput = input as {
      measureLayout?: (
        relativeTo: unknown,
        onSuccess: (left: number, top: number, width: number, height: number) => void,
        onFail: () => void
      ) => void;
    };

    if (contentRef.current && typeof nativeInput.measureLayout === 'function') {
      try {
        nativeInput.measureLayout(
          contentRef.current,
          (_left: number, top: number) => {
            scrollRef.current?.scrollTo({
              y: Math.max(0, top - topOffset),
              animated: true,
            });
          },
          () => {
            measureWithWindow(input);
          }
        );
        return;
      } catch {
        measureWithWindow(input);
        return;
      }
    }

    measureWithWindow(input);
  };

  const scrollToFocusedInput = () => {
    const focusedInput = TextInput.State?.currentlyFocusedInput?.();
    if (focusedInput) {
      scrollToInput(focusedInput);
    }
  };

  const handleInputFocus = (input: unknown) => {
    if (keyboardHeightRef.current > 0) {
      setTimeout(() => {
        scrollToInput(input);
      }, 50);
    }
  };

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined;

    const showSubscription = Keyboard.addListener(SHOW_EVENT, (event: KeyboardEvent) => {
      const height = event.endCoordinates.height;
      keyboardHeightRef.current = height;
      setKeyboardHeight(height);
      clearTimeout(timeout);
      timeout = setTimeout(scrollToFocusedInput, SCROLL_DELAY_MS);
    });

    const hideSubscription = Keyboard.addListener(HIDE_EVENT, () => {
      keyboardHeightRef.current = 0;
      clearTimeout(timeout);
      setKeyboardHeight(0);
    });

    return () => {
      clearTimeout(timeout);
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [topOffset]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollYRef.current = event.nativeEvent.contentOffset.y;
    onScroll?.(event);
  };

  return (
    <KeyboardScrollContext.Provider value={handleInputFocus}>
      <ScrollView
        ref={scrollRef}
        keyboardShouldPersistTaps="handled"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        {...props}
        contentContainerStyle={[contentContainerStyle, { paddingBottom: keyboardHeight }]}
      >
        <View
          ref={contentRef}
          collapsable={false}
          style={{ flexGrow: 1 }}
        >
          {children}
        </View>
      </ScrollView>
    </KeyboardScrollContext.Provider>
  );
}
