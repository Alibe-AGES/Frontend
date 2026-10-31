import { fireEvent, render } from '@testing-library/react-native';
import { GoogleButton } from './index';

describe('<GoogleButton />', () => {
  test('exposes an accessible label', async () => {
    const { getByLabelText } = await render(<GoogleButton />);

    expect(getByLabelText('Continuar com Google')).toBeTruthy();
  });

  test('calls onPress when pressed', async () => {
    const onPress = jest.fn();
    const { getByLabelText } = await render(<GoogleButton onPress={onPress} />);

    await fireEvent.press(getByLabelText('Continuar com Google'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test('does not call onPress when disabled', async () => {
    const onPress = jest.fn();
    const { getByLabelText } = await render(
      <GoogleButton
        onPress={onPress}
        disabled
      />
    );

    await fireEvent.press(getByLabelText('Continuar com Google'));

    expect(onPress).not.toHaveBeenCalled();
  });

  test('shows a spinner and blocks presses while loading', async () => {
    const onPress = jest.fn();
    const { getByTestId, getByLabelText } = await render(
      <GoogleButton
        onPress={onPress}
        isLoading
      />
    );

    await fireEvent.press(getByLabelText('Continuar com Google'));

    expect(getByTestId('google-button-loading')).toBeTruthy();
    expect(getByTestId('google-button').props.accessibilityState).toMatchObject({
      disabled: true,
      busy: true,
    });
    expect(onPress).not.toHaveBeenCalled();
  });

  test('forwards a custom testID', async () => {
    const { getByTestId, queryByTestId } = await render(<GoogleButton testID="login-google" />);

    expect(getByTestId('login-google')).toBeTruthy();
    expect(queryByTestId('google-button')).toBeNull();
  });
});
