import type { Place } from '@/components/PlaceList/PlaceList.types';
import type { PlacesSearchInput } from '@/server/places';
import { searchPlaces } from '@/server/places';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ExperiencesScreen } from '.';

jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock('@/components/NavigationBar', () => ({
  NavigationBar: () => null,
}));

jest.mock('@/components/BackButton', () => ({
  BackButton: ({ accessibilityLabel }: { accessibilityLabel: string }) => {
    const { Pressable, Text } = jest.requireActual<typeof import('react-native')>('react-native');
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        testID="experiences-back"
      >
        <Text>{accessibilityLabel}</Text>
      </Pressable>
    );
  },
}));

jest.mock('@/server/places', () => ({
  searchPlaces: jest.fn(),
}));

jest.mock('expo-location', () => ({
  Accuracy: { Balanced: 3 },
  requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
  getCurrentPositionAsync: jest.fn().mockResolvedValue({
    coords: { latitude: -30, longitude: -51 },
  }),
}));

const places: Place[] = [
  { id: 'bloom', name: 'Bloom Café', address: 'Rua A', category: 'restaurant' },
  { id: 'arena', name: 'Arena Kart', address: 'Rua B', category: 'recommended' },
  { id: 'yoga', name: 'Estúdio de Yoga', address: 'Rua C', category: 'class' },
];

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
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'group-1' });
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ granted: true });
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({
      coords: { latitude: -30, longitude: -51 },
    });
    jest
      .mocked(searchPlaces)
      .mockImplementation(({ query, tagIds, filters }: PlacesSearchInput) => {
        let results = places;
        if (query) {
          results = results.filter((place) =>
            place.name.toLowerCase().includes(query.toLowerCase())
          );
        }
        if (tagIds.length > 0 && !tagIds.includes('recommended')) {
          results = results.filter((place) => tagIds.includes(place.category ?? ''));
        }
        const environments = Object.hasOwn(filters.selections, 'environment')
          ? filters.selections.environment
          : [];
        if (environments.includes('outdoor')) {
          results = results.filter((place) => place.id === 'yoga');
        }
        return Promise.resolve(results);
      });
  });

  test('opens the selected place details', async () => {
    const { findByText, getByTestId } = await Promise.resolve(renderScreen());

    expect(getByTestId('experiences-back').props.accessibilityLabel).toBe('Voltar para o grupo');
    await findByText('Bloom Café');
    fireEvent.press(getByTestId('experiences-places-item-bloom'));
    await Promise.resolve();

    expect(mockPush).toHaveBeenCalledWith('/group/group-1/experiences/bloom');
  });

  test('filters places by search text', async () => {
    const { findByText, getByTestId, queryByText } = await Promise.resolve(renderScreen());

    expect(await findByText('Bloom Café')).toBeTruthy();
    fireEvent.changeText(getByTestId('experiences-search'), 'arena');
    await waitFor(() => {
      expect(searchPlaces).toHaveBeenLastCalledWith(expect.objectContaining({ query: 'arena' }));
    });
    expect(await findByText('Arena Kart')).toBeTruthy();
    expect(queryByText('Bloom Café')).toBeNull();
  });

  test('filters places by carousel tag', async () => {
    const { findByText, getByTestId, queryByText } = await Promise.resolve(renderScreen());

    await findByText('Bloom Café');
    fireEvent.press(getByTestId('experiences-filters-tag-restaurant'));
    await waitFor(() => {
      expect(searchPlaces).toHaveBeenLastCalledWith(
        expect.objectContaining({ tagIds: ['restaurant'] })
      );
    });
    expect(queryByText('Arena Kart')).toBeNull();
    expect(queryByText('Bloom Café')).toBeTruthy();
  });

  test('applies sheet filters on confirm', async () => {
    const { findByText, getByTestId, queryByText } = await Promise.resolve(renderScreen());

    await findByText('Bloom Café');
    fireEvent.press(getByTestId('experiences-filters-open-filters'));
    await Promise.resolve();
    fireEvent.press(getByTestId('experiences-filter-sheet-environment-outdoor'));
    await Promise.resolve();
    fireEvent.press(getByTestId('experiences-filter-sheet-confirm'));
    await waitFor(() => {
      expect(searchPlaces).toHaveBeenLastCalledWith(
        expect.objectContaining({
          filters: { minBudget: '', maxBudget: '', selections: { environment: ['outdoor'] } },
        })
      );
    });
    expect(await findByText('Estúdio de Yoga')).toBeTruthy();
    expect(queryByText('Bloom Café')).toBeNull();
  });
});
