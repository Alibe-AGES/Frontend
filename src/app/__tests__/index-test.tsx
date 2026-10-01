import HomeScreen from '@/app/index';
import { render } from '@testing-library/react-native';

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('<HomeScreen/>', () => {
  test('shows the auth screen as the first screen', async () => {
    const { getByTestId, getByText } = await render(<HomeScreen />);

    expect(getByTestId('auth-screen')).toBeTruthy();
    expect(getByText('Login')).toBeTruthy();
    expect(getByText('Criar conta')).toBeTruthy();
  });
});
