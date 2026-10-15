import { fireEvent, render } from '@testing-library/react-native';
import { AuthenticationRequiredScreen } from '.';

describe('<AuthenticationRequiredScreen />', () => {
  test('explains the restriction and offers login', async () => {
    const onLogin = jest.fn();
    const { getByText, getByTestId } = await render(
      <AuthenticationRequiredScreen onLogin={onLogin} />
    );

    expect(getByText('Acesso restrito')).toBeTruthy();
    expect(getByText('Entre na sua conta para acessar esta página.')).toBeTruthy();
    await fireEvent.press(getByTestId('authentication-required-login'));
    expect(onLogin).toHaveBeenCalledTimes(1);
  });
});
