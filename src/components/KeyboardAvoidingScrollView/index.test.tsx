import { act, render } from '@testing-library/react-native';
import type { KeyboardEvent } from 'react-native';
import { Keyboard, Platform, Text, TextInput } from 'react-native';

import { KeyboardAvoidingScrollView, useKeyboardScrollContext } from './index';

type KeyboardListener = (event: KeyboardEvent) => void;

describe('<KeyboardAvoidingScrollView />', () => {
  const listeners = new Map<string, KeyboardListener>();

  beforeEach(() => {
    listeners.clear();
    jest.spyOn(Keyboard, 'addListener').mockImplementation((eventName, listener) => {
      listeners.set(eventName, listener);
      return { remove: jest.fn() } as unknown as ReturnType<typeof Keyboard.addListener>;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const emit = async (suffix: 'Show' | 'Hide', height: number) => {
    const listener = [...listeners.entries()].find(([name]) => name.endsWith(suffix))?.[1];
    await act(() => {
      listener?.({ endCoordinates: { height } } as KeyboardEvent);
    });
  };

  const bottomPadding = (style: unknown) => JSON.stringify(style);

  test('renders its children', async () => {
    const { getByText } = await render(
      <KeyboardAvoidingScrollView>
        <Text>Conteúdo</Text>
      </KeyboardAvoidingScrollView>
    );

    expect(getByText('Conteúdo')).toBeTruthy();
  });

  test('reserves space for the keyboard only while it is visible', async () => {
    const { getByTestId } = await render(
      <KeyboardAvoidingScrollView testID="keyboard-scroll">
        <Text>Conteúdo</Text>
      </KeyboardAvoidingScrollView>
    );
    const getStyle = (): unknown =>
      (getByTestId('keyboard-scroll').props as { contentContainerStyle?: unknown })
        .contentContainerStyle;

    expect(bottomPadding(getStyle())).toContain('"paddingBottom":0');

    await emit('Show', 300);
    expect(bottomPadding(getStyle())).toContain('"paddingBottom":300');

    await emit('Hide', 0);
    expect(bottomPadding(getStyle())).toContain('"paddingBottom":0');
  });

  test('calls measure on focused input when keyboard appears', async () => {
    jest.useFakeTimers();
    const mockMeasureLayout = jest.fn(
      (
        _ref: unknown,
        onSuccess: (left: number, top: number, width: number, height: number) => void
      ) => {
        onSuccess(0, 300, 100, 40);
      }
    );

    jest.spyOn(TextInput.State, 'currentlyFocusedInput').mockReturnValue({
      measureLayout: mockMeasureLayout,
    } as unknown as ReturnType<typeof TextInput.State.currentlyFocusedInput>);

    await render(
      <KeyboardAvoidingScrollView
        testID="keyboard-scroll"
        topOffset={80}
      >
        <Text>Conteúdo</Text>
      </KeyboardAvoidingScrollView>
    );

    await emit('Show', 300);

    await act(() => {
      jest.advanceTimersByTime(150);
    });

    expect(mockMeasureLayout).toHaveBeenCalled();
    jest.useRealTimers();
  });

  test('does not add redundant keyboard padding on android', async () => {
    Object.defineProperty(Platform, 'OS', { get: () => 'android', configurable: true });

    const { getByTestId } = await render(
      <KeyboardAvoidingScrollView testID="keyboard-scroll-android">
        <Text>Conteúdo Android</Text>
      </KeyboardAvoidingScrollView>
    );

    const getStyle = (): unknown =>
      (getByTestId('keyboard-scroll-android').props as { contentContainerStyle?: unknown })
        .contentContainerStyle;

    expect(bottomPadding(getStyle())).toContain('"paddingBottom":0');

    await emit('Show', 300);
    expect(bottomPadding(getStyle())).toContain('"paddingBottom":0');

    Object.defineProperty(Platform, 'OS', { get: () => 'ios', configurable: true });
  });

  test('falls back to measureInWindow when measureLayout calls onFail', async () => {
    jest.useFakeTimers();
    const mockMeasureInWindow = jest.fn(
      (cb: (x: number, y: number, w: number, h: number) => void) => {
        cb(0, 1100, 100, 50);
      }
    );
    const mockMeasureLayout = jest.fn((_ref: unknown, _onSuccess: unknown, onFail: () => void) => {
      onFail();
    });

    jest.spyOn(TextInput.State, 'currentlyFocusedInput').mockReturnValue({
      measureLayout: mockMeasureLayout,
      measureInWindow: mockMeasureInWindow,
    } as unknown as ReturnType<typeof TextInput.State.currentlyFocusedInput>);

    await render(
      <KeyboardAvoidingScrollView testID="keyboard-scroll">
        <Text>Conteúdo</Text>
      </KeyboardAvoidingScrollView>
    );

    await emit('Show', 300);

    await act(() => {
      jest.advanceTimersByTime(150);
    });

    expect(mockMeasureLayout).toHaveBeenCalled();
    expect(mockMeasureInWindow).toHaveBeenCalled();
    jest.useRealTimers();
  });

  test('falls back to measureInWindow when measureLayout throws an error', async () => {
    jest.useFakeTimers();
    const mockMeasureInWindow = jest.fn(
      (cb: (x: number, y: number, w: number, h: number) => void) => {
        cb(0, 200, 100, 50);
      }
    );
    const mockMeasureLayout = jest.fn(() => {
      throw new Error('measurement error');
    });

    jest.spyOn(TextInput.State, 'currentlyFocusedInput').mockReturnValue({
      measureLayout: mockMeasureLayout,
      measureInWindow: mockMeasureInWindow,
    } as unknown as ReturnType<typeof TextInput.State.currentlyFocusedInput>);

    await render(
      <KeyboardAvoidingScrollView testID="keyboard-scroll">
        <Text>Conteúdo</Text>
      </KeyboardAvoidingScrollView>
    );

    await emit('Show', 300);

    await act(() => {
      jest.advanceTimersByTime(150);
    });

    expect(mockMeasureInWindow).toHaveBeenCalled();
    jest.useRealTimers();
  });

  test('measures directly with measureInWindow when measureLayout is not provided', async () => {
    jest.useFakeTimers();
    const mockMeasureInWindow = jest.fn(
      (cb: (x: number, y: number, w: number, h: number) => void) => {
        cb(0, 700, 100, 50);
      }
    );

    jest.spyOn(TextInput.State, 'currentlyFocusedInput').mockReturnValue({
      measureInWindow: mockMeasureInWindow,
    } as unknown as ReturnType<typeof TextInput.State.currentlyFocusedInput>);

    await render(
      <KeyboardAvoidingScrollView testID="keyboard-scroll">
        <Text>Conteúdo</Text>
      </KeyboardAvoidingScrollView>
    );

    await emit('Show', 300);

    await act(() => {
      jest.advanceTimersByTime(150);
    });

    expect(mockMeasureInWindow).toHaveBeenCalled();
    jest.useRealTimers();
  });

  test('notifies scrollToInput via context when focused input triggers focus while keyboard is active', async () => {
    jest.useFakeTimers();
    const mockMeasureInWindow = jest.fn(
      (cb: (x: number, y: number, w: number, h: number) => void) => {
        cb(0, 500, 100, 50);
      }
    );
    const mockInput = { measureInWindow: mockMeasureInWindow };

    function FocusableChild() {
      const notifyFocus = useKeyboardScrollContext();
      return (
        <Text
          testID="trigger-focus-child"
          onPress={() => {
            notifyFocus?.(mockInput);
            notifyFocus?.(null);
          }}
        >
          Foco
        </Text>
      );
    }

    const { getByTestId } = await render(
      <KeyboardAvoidingScrollView testID="keyboard-scroll">
        <FocusableChild />
      </KeyboardAvoidingScrollView>
    );

    await emit('Show', 300);

    await act(() => {
      (getByTestId('trigger-focus-child').props as { onPress: () => void }).onPress();
      jest.advanceTimersByTime(100);
    });

    expect(mockMeasureInWindow).toHaveBeenCalled();
    jest.useRealTimers();
  });

  test('forwards scroll events and records offset', async () => {
    const onScrollMock = jest.fn();
    const { getByTestId } = await render(
      <KeyboardAvoidingScrollView
        testID="keyboard-scroll"
        onScroll={onScrollMock}
      >
        <Text>Conteúdo</Text>
      </KeyboardAvoidingScrollView>
    );

    await act(() => {
      (
        getByTestId('keyboard-scroll').props as {
          onScroll: (e: { nativeEvent: { contentOffset: { y: number } } }) => void;
        }
      ).onScroll({ nativeEvent: { contentOffset: { y: 120 } } });
    });

    expect(onScrollMock).toHaveBeenCalled();
  });
});
