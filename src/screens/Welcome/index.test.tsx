import { MemoriesScreen } from '@/screens/Memories';
import { render } from '@testing-library/react-native';
import { WelcomeScreen } from './index';

describe('welcome-based screens', () => {
  test.each([['Memories', MemoriesScreen]])('renders the %s screen label', async (name, Screen) => {
    const { getByText } = await Promise.resolve(render(<Screen />));

    expect(getByText(`Welcome to screen ${name}`)).toBeTruthy();
  });

  test('renders a custom screen name', async () => {
    const { getByText } = await Promise.resolve(render(<WelcomeScreen name="Custom" />));

    expect(getByText('Welcome to screen Custom')).toBeTruthy();
  });
});
