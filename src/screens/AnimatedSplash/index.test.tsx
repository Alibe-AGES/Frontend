import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';

import { AnimatedSplash } from '.';

jest.useFakeTimers();

const finishCycle = async () => {
  await fireEvent(await screen.findByTestId('splash-logo'), 'animationFinish', false);
};

const advance = async (milliseconds: number) => {
  await act(() => jest.advanceTimersByTimeAsync(milliseconds));
};

describe('<AnimatedSplash />', () => {
  beforeEach(() => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('draws the ribbons and the logo with Lottie and leaves after the animation ends', async () => {
    const onFinish = jest.fn();

    await render(
      <AnimatedSplash
        isReady
        onFinish={onFinish}
      />
    );

    expect(screen.getByLabelText('Alibe')).toBeTruthy();
    expect(await screen.findByTestId('splash-ribbon-top')).toBeTruthy();
    expect(screen.getByTestId('splash-ribbon-bottom')).toBeTruthy();

    await advance(1000);
    expect(onFinish).not.toHaveBeenCalled();

    await finishCycle();
    await advance(1000);
    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  test('replays the animation until the app is ready and then finishes the current cycle', async () => {
    const onFinish = jest.fn();

    await render(
      <AnimatedSplash
        isReady={false}
        onFinish={onFinish}
      />
    );
    await finishCycle();
    await advance(1000);
    expect(onFinish).not.toHaveBeenCalled();

    await finishCycle();
    await advance(1000);
    await screen.rerender(
      <AnimatedSplash
        isReady
        onFinish={onFinish}
      />
    );
    await advance(1000);
    expect(onFinish).not.toHaveBeenCalled();

    await finishCycle();
    await advance(1000);
    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  test('ends a cycle on its own if the animation never reports its end', async () => {
    const onFinish = jest.fn();

    await render(
      <AnimatedSplash
        isReady
        onFinish={onFinish}
      />
    );
    await advance(4000);
    expect(onFinish).not.toHaveBeenCalled();

    await advance(1000);
    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  test('shows the still splash until the app is ready when reduce motion is on', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);
    const onFinish = jest.fn();

    await render(
      <AnimatedSplash
        isReady={false}
        onFinish={onFinish}
      />
    );
    await advance(5000);

    expect(screen.queryByTestId('splash-logo')).toBeNull();
    expect(onFinish).not.toHaveBeenCalled();

    await screen.rerender(
      <AnimatedSplash
        isReady
        onFinish={onFinish}
      />
    );
    await advance(1000);
    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  test('falls back to the still splash when an animation fails to load', async () => {
    const onFinish = jest.fn();

    await render(
      <AnimatedSplash
        isReady
        onFinish={onFinish}
      />
    );
    await fireEvent(await screen.findByTestId('splash-ribbon-top'), 'animationFailure', 'error');
    await advance(1000);

    expect(screen.queryByTestId('splash-logo')).toBeNull();
    expect(onFinish).toHaveBeenCalledTimes(1);
  });
});
