import { act, fireEvent, render } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';

import loginAnimation from '@/assets/animations/login-hi-five-hands.json';

import { HandsHiFive } from './index';

const mockFocus: { current: () => void } = { current: () => undefined };
const mockMount = jest.fn();

jest.mock('expo-router', () => {
  const { useEffect } = jest.requireActual<typeof import('react')>('react');
  return {
    useFocusEffect: (effect: () => void) => {
      mockFocus.current = effect;
      useEffect(effect, [effect]);
    },
  };
});

jest.mock('lottie-react-native', () => {
  const { useEffect } = jest.requireActual<typeof import('react')>('react');
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');
  return function MockLottie(props: Record<string, unknown>) {
    useEffect(() => {
      mockMount();
    }, []);
    return <View {...props} />;
  };
});

const paintsOf = (animation: unknown) =>
  [...JSON.stringify(animation).matchAll(/"c":\{"a":0,"k":\[[^\]]+\]/g)].map(String);

describe('<HandsHiFive />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
  });

  test('plays the animation once', async () => {
    const { findByTestId } = render(<HandsHiFive variant="login" />);
    const animation = await findByTestId('hands-hi-five-animation');

    expect(animation.props.autoPlay).toBe(true);
    expect(animation.props.loop).toBe(false);
    expect(animation.props.source).toBe(loginAnimation);
  });

  test('reuses the same animation with another palette on sign up', async () => {
    const { findByTestId } = render(<HandsHiFive variant="sign-up" />);
    const { source } = (await findByTestId('hands-hi-five-animation')).props as {
      source: typeof loginAnimation;
    };

    expect(source).not.toBe(loginAnimation);
    expect(paintsOf(source)).toHaveLength(paintsOf(loginAnimation).length);
    expect(paintsOf(source)).not.toEqual(paintsOf(loginAnimation));
  });

  test('paints every hand and arm with two colors on event created', async () => {
    const { findByTestId } = render(<HandsHiFive variant="event-created" />);
    const { source } = (await findByTestId('hands-hi-five-animation')).props as {
      source: typeof loginAnimation;
    };

    expect(new Set(paintsOf(source)).size).toBe(2);
  });

  test('replays when the screen gains focus again', async () => {
    const { findByTestId } = render(<HandsHiFive variant="login" />);
    await findByTestId('hands-hi-five-animation');
    expect(mockMount).toHaveBeenCalledTimes(1);

    act(() => {
      mockFocus.current();
    });

    expect(mockMount).toHaveBeenCalledTimes(2);
  });

  test('with a playKey, waits on the artwork and plays on every new key instead of on focus', async () => {
    const { findByTestId, getByTestId, queryByTestId, rerender } = render(
      <HandsHiFive
        variant="sign-up"
        playKey={0}
      />
    );
    await act(async () => {
      await Promise.resolve();
    });

    expect(queryByTestId('hands-hi-five-animation')).toBeNull();
    expect(getByTestId('hands-hi-five-artwork', { includeHiddenElements: true })).toBeTruthy();

    act(() => {
      mockFocus.current();
    });
    expect(queryByTestId('hands-hi-five-animation')).toBeNull();

    rerender(
      <HandsHiFive
        variant="sign-up"
        playKey={1}
      />
    );
    expect((await findByTestId('hands-hi-five-animation')).props.autoPlay).toBe(true);
    expect(mockMount).toHaveBeenCalledTimes(1);

    rerender(
      <HandsHiFive
        variant="sign-up"
        playKey={2}
      />
    );
    expect(mockMount).toHaveBeenCalledTimes(2);
  });

  test('shows the static artwork when the user prefers reduced motion', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);

    const { queryByTestId } = render(<HandsHiFive variant="login" />);
    await act(async () => {
      await Promise.resolve();
    });

    expect(queryByTestId('hands-hi-five-animation')).toBeNull();
  });

  test('falls back to the static artwork when the animation fails', async () => {
    const { findByTestId, queryByTestId } = render(<HandsHiFive variant="sign-up" />);

    fireEvent(await findByTestId('hands-hi-five-animation'), 'animationFailure');

    expect(queryByTestId('hands-hi-five-animation')).toBeNull();
  });
});
