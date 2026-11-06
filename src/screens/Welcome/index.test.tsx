import { NewMemoryScreen } from '@/screens/NewMemory';
import { render } from '@testing-library/react-native';
import { WelcomeScreen } from './index';

describe('welcome-based screens', () => {
  test('renders the New memory screen label', async () => {
    const { getByText } = await Promise.resolve(render(<NewMemoryScreen />));

    expect(getByText('Welcome to screen New memory')).toBeTruthy();
  });

  test('renders a custom screen name', async () => {
    const { getByText } = await Promise.resolve(render(<WelcomeScreen name="Custom" />));

    expect(getByText('Welcome to screen Custom')).toBeTruthy();
  });
});
