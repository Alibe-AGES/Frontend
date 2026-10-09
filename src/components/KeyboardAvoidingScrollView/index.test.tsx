import { act, render } from '@testing-library/react-native';
import type { KeyboardEvent } from 'react-native';
import { Keyboard, Text, TextInput } from 'react-native';

import { KeyboardAvoidingScrollView } from './index';

type KeyboardListener = (event: KeyboardEvent) => void;

describe('<KeyboardAvoidingScrollView />', () => {
  const listeners = new Map<string, KeyboardListener>();

  beforeEach(() => {
    listeners.clear();
    jest.spyOn(Keyboard, 'addListener').mockImplementation((eventName, listener) => {
      listeners.set(eventName, listener as KeyboardListener);
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
    const getStyle = () => getByTestId('keyboard-scroll').props.contentContainerStyle;

    expect(bottomPadding(getStyle())).toContain('"paddingBottom":0');

    await emit('Show', 300);
    expect(bottomPadding(getStyle())).toContain('"paddingBottom":300');

    await emit('Hide', 0);
    expect(bottomPadding(getStyle())).toContain('"paddingBottom":0');
  });

  test('calls measure on focused input when keyboard appears', async () => {
    jest.useFakeTimers();
    const mockMeasureLayout = jest.fn((_ref, onSuccess) => {
      onSuccess(0, 300, 100, 40);
    });

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

    act(() => {
      jest.advanceTimersByTime(150);
    });

    expect(mockMeasureLayout).toHaveBeenCalled();
    jest.useRealTimers();
  });
});
