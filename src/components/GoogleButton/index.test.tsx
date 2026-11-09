import { fireEvent, render } from '@testing-library/react-native';
import { GoogleButton } from './index';

describe('<GoogleButton />', () => {
  test('exposes an accessible label', () => {
    const { getByLabelText } = render(<GoogleButton />);

    expect(getByLabelText('Continuar com Google')).toBeTruthy();
  });

  test('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByLabelText } = render(<GoogleButton onPress={onPress} />);

    fireEvent.press(getByLabelText('Continuar com Google'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    const { getByLabelText } = render(
      <GoogleButton
        onPress={onPress}
        disabled
      />
    );

    fireEvent.press(getByLabelText('Continuar com Google'));

    expect(onPress).not.toHaveBeenCalled();
  });

  test('shows a spinner and blocks presses while loading', () => {
    const onPress = jest.fn();
    const { getByTestId, getByLabelText } = render(
      <GoogleButton
        onPress={onPress}
        isLoading
      />
    );

    fireEvent.press(getByLabelText('Continuar com Google'));

    expect(getByTestId('google-button-loading')).toBeTruthy();
    expect(getByTestId('google-button').props.accessibilityState).toMatchObject({
      disabled: true,
      busy: true,
    });
    expect(onPress).not.toHaveBeenCalled();
  });

  test('forwards a custom testID', () => {
    const { getByTestId, queryByTestId } = render(<GoogleButton testID="login-google" />);

    expect(getByTestId('login-google')).toBeTruthy();
    expect(queryByTestId('google-button')).toBeNull();
  });
});
