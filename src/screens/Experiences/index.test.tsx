import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ExperiencesScreen } from '.';

jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(),
}));

jest.mock('@/components/NavigationBar', () => ({
  NavigationBar: () => null,
}));

const SAFE_AREA_METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const renderScreen = () =>
  render(
    <SafeAreaProvider initialMetrics={SAFE_AREA_METRICS}>
      <ExperiencesScreen />
    </SafeAreaProvider>
  );

describe('<ExperiencesScreen />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'group-1' });
  });

  test('filters places by search text', async () => {
    const { findByText, getByTestId, queryByText } = await renderScreen();

    expect(await findByText('Bloom Café')).toBeTruthy();
    await fireEvent.changeText(getByTestId('experiences-search'), 'arena');

    await waitFor(() => {
      expect(queryByText('Bloom Café')).toBeNull();
    });
    expect(queryByText('Arena Kart')).toBeTruthy();
  });

  test('filters places by carousel tag', async () => {
    const { findByText, getByTestId, queryByText } = await renderScreen();

    await findByText('Bloom Café');
    await fireEvent.press(getByTestId('experiences-filters-tag-restaurant'));

    await waitFor(() => {
      expect(queryByText('Arena Kart')).toBeNull();
    });
    expect(queryByText('Bloom Café')).toBeTruthy();
  });

  test('applies sheet filters on confirm', async () => {
    const { findByText, getByTestId, queryByText } = await renderScreen();

    await findByText('Bloom Café');
    await fireEvent.press(getByTestId('experiences-filters-open-filters'));
    await fireEvent.press(getByTestId('experiences-filter-sheet-environment-outdoor'));
    await fireEvent.press(getByTestId('experiences-filter-sheet-confirm'));

    await waitFor(() => {
      expect(queryByText('Bloom Café')).toBeNull();
    });
    expect(queryByText('Estúdio de Yoga')).toBeTruthy();
  });
});
