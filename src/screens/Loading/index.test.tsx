import { fireEvent, render } from '@testing-library/react-native';
import { useRouter } from 'expo-router';

import { LoadingScreen } from '.';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

const mockReplace = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (useRouter as jest.Mock).mockReturnValue({ replace: mockReplace });
});

describe('<LoadingScreen />', () => {
  test('renders the loading screen container', async () => {
    const { getByTestId } = await render(<LoadingScreen />);

    expect(getByTestId('alibe-loading-screen')).toBeTruthy();
  });

  test('renders the Alibe logo', async () => {
    const { getByLabelText } = await render(<LoadingScreen />);

    expect(getByLabelText('Alibe')).toBeTruthy();
  });

  test('navigates to the groups screen when pressed', async () => {
    const { getByTestId } = await render(<LoadingScreen />);

    await fireEvent.press(getByTestId('alibe-loading-screen'));

    expect(mockReplace).toHaveBeenCalledWith('/groups');
  });
});
