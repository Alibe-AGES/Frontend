import { fireEvent, render } from '@testing-library/react-native';
import { AuthenticationRequiredScreen } from '.';

describe('<AuthenticationRequiredScreen />', () => {
  test('explains the restriction and offers login', async () => {
    const onLogin = jest.fn();
    const { getByText, getByTestId } = await Promise.resolve(
      render(<AuthenticationRequiredScreen onLogin={onLogin} />)
    );

    expect(getByText('Acesso restrito')).toBeTruthy();
    expect(getByText('Entre na sua conta para acessar esta página.')).toBeTruthy();
    fireEvent.press(getByTestId('authentication-required-login'));
    await Promise.resolve();
    expect(onLogin).toHaveBeenCalledTimes(1);
  });
});
