import { fireEvent, render } from '@testing-library/react-native';
import { ContinueButton } from './index';

describe('<ContinueButton />', () => {
  test('renders the "Continuar" title', async () => {
    const { getByText } = await render(<ContinueButton />);

    expect(getByText('Continuar')).toBeTruthy();
  });

  test('renders with the tertiary (ink) variant', async () => {
    const { getByTestId } = await render(<ContinueButton />);

    expect(getByTestId('continue-button').props.className).toContain('bg-ink');
  });

  test('calls onPress when pressed', async () => {
    const onPress = jest.fn();
    const { getByText } = await render(<ContinueButton onPress={onPress} />);

    await fireEvent.press(getByText('Continuar'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test('forwards disabled state', async () => {
    const onPress = jest.fn();
    const { getByText } = await render(
      <ContinueButton
        onPress={onPress}
        disabled
      />
    );

    await fireEvent.press(getByText('Continuar'));

    expect(onPress).not.toHaveBeenCalled();
  });

  test('forwards loading state', async () => {
    const { getByTestId, queryByText } = await render(<ContinueButton isLoading />);

    expect(getByTestId('continue-button-loading')).toBeTruthy();
    expect(queryByText('Continuar')).toBeNull();
  });

  test('uses "continue-button" as the default testID', async () => {
    const { getByTestId } = await render(<ContinueButton />);

    expect(getByTestId('continue-button')).toBeTruthy();
  });

  test('forwards a custom testID', async () => {
    const { getByTestId, queryByTestId } = await render(
      <ContinueButton testID="custom-continue" />
    );

    expect(getByTestId('custom-continue')).toBeTruthy();
    expect(queryByTestId('continue-button')).toBeNull();
  });
});
