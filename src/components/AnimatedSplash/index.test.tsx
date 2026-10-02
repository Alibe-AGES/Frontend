import { act, fireEvent, render } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';

import { AnimatedSplash } from '.';

jest.useFakeTimers();

describe('<AnimatedSplash />', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('draws both ribbons with Lottie and finishes after the bottom one ends', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
    const onFinish = jest.fn();

    const { getByLabelText, findByTestId } = await render(<AnimatedSplash onFinish={onFinish} />);

    expect(getByLabelText('Alibe')).toBeTruthy();
    expect(await findByTestId('splash-ribbon-top')).toBeTruthy();

    await fireEvent(await findByTestId('splash-ribbon-bottom'), 'animationFinish', false);
    expect(onFinish).not.toHaveBeenCalled();

    await act(() => jest.advanceTimersByTimeAsync(5000));
    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  test('shows the still ribbons and finishes without animating when reduce motion is on', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);
    const onFinish = jest.fn();

    const { queryByTestId } = await render(<AnimatedSplash onFinish={onFinish} />);
    await act(() => jest.advanceTimersByTimeAsync(5000));

    expect(queryByTestId('splash-ribbon-top')).toBeNull();
    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  test('finishes on its own if the animation never reports its end', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
    const onFinish = jest.fn();

    await render(<AnimatedSplash onFinish={onFinish} />);
    await act(() => jest.advanceTimersByTimeAsync(5000));

    expect(onFinish).toHaveBeenCalledTimes(1);
  });
});
