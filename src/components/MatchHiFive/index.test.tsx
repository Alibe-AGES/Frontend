import { act, render } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';

import matchAnimation from '@/assets/animations/match-hi-five-hands.json';

import { MatchHiFive } from './index';

jest.mock('lottie-react-native', () => {
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');
  return function MockLottie(props: Record<string, unknown>) {
    return <View {...props} />;
  };
});

describe('<MatchHiFive />', () => {
  beforeEach(() => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('loops the high five', async () => {
    const { findByTestId } = render(<MatchHiFive />);
    const animation = await findByTestId('match-hi-five-animation');

    expect(animation.props.autoPlay).toBe(true);
    expect(animation.props.loop).toBe(true);
    expect(animation.props.source).toBe(matchAnimation);
  });

  test('replays every 1.5 seconds', () => {
    expect((matchAnimation.op - matchAnimation.ip) / matchAnimation.fr).toBe(1.5);
  });

  test('shows the static drawing when motion is reduced', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);
    const { findByTestId, queryByTestId } = render(<MatchHiFive />);

    expect(
      await findByTestId('match-hi-five-artwork', { includeHiddenElements: true })
    ).toBeTruthy();
    expect(queryByTestId('match-hi-five-animation')).toBeNull();
  });

  test('falls back to the static drawing when the animation fails', async () => {
    const { findByTestId } = render(<MatchHiFive />);
    const animation = await findByTestId('match-hi-five-animation');

    act(() => {
      (animation.props as { onAnimationFailure: () => void }).onAnimationFailure();
    });

    expect(
      await findByTestId('match-hi-five-artwork', { includeHiddenElements: true })
    ).toBeTruthy();
  });
});
