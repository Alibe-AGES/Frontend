import { render } from '@testing-library/react-native';

import { LoadingScreen } from '.';

describe('<LoadingScreen />', () => {
  test('renders the loading screen container', async () => {
    const { getByTestId } = await render(<LoadingScreen />);

    expect(getByTestId('alibe-loading-screen')).toBeTruthy();
  });

  test('renders the Alibe logo', async () => {
    const { getByLabelText } = await render(<LoadingScreen />);

    expect(getByLabelText('Alibe')).toBeTruthy();
  });
});
