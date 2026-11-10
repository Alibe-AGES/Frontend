import { fireEvent, render } from '@testing-library/react-native';
import { ContinueButton } from './index';

describe('<ContinueButton />', () => {
  test('renders the "Continuar" title', async () => {
    const { getByText } = await Promise.resolve(render(<ContinueButton />));

    expect(getByText('Continuar')).toBeTruthy();
  });

  test('renders with the tertiary (ink) variant', async () => {
    const { getByTestId } = await Promise.resolve(render(<ContinueButton />));

    expect(getByTestId('continue-button').props.className).toContain('bg-ink');
  });

  test('calls onPress when pressed', async () => {
    const onPress = jest.fn();
    const { getByText } = await Promise.resolve(render(<ContinueButton onPress={onPress} />));

    fireEvent.press(getByText('Continuar'));
    await Promise.resolve();

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test('forwards disabled state', async () => {
    const onPress = jest.fn();
    const { getByText } = await Promise.resolve(
      render(
        <ContinueButton
          onPress={onPress}
          disabled
        />
      )
    );

    fireEvent.press(getByText('Continuar'));
    await Promise.resolve();

    expect(onPress).not.toHaveBeenCalled();
  });

  test('forwards loading state', async () => {
    const { getByTestId, queryByText } = await Promise.resolve(
      render(<ContinueButton isLoading />)
    );

    expect(getByTestId('continue-button-loading')).toBeTruthy();
    expect(queryByText('Continuar')).toBeNull();
  });

  test('uses "continue-button" as the default testID', async () => {
    const { getByTestId } = await Promise.resolve(render(<ContinueButton />));

    expect(getByTestId('continue-button')).toBeTruthy();
  });

  test('forwards a custom testID', async () => {
    const { getByTestId, queryByTestId } = await Promise.resolve(
      render(<ContinueButton testID="custom-continue" />)
    );

    expect(getByTestId('custom-continue')).toBeTruthy();
    expect(queryByTestId('continue-button')).toBeNull();
  });
});
