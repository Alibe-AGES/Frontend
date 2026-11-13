import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';

import { useAuthenticatedImageSource } from '@/hooks/use-authenticated-image-source';
import { createProposal, type CreatedProposal } from '@/server/events';
import { getPlaceDetails, getStoredLocationDetails, PlaceDetails } from '@/server/places';
import type { ComponentProps } from 'react';
import Toast from 'react-native-toast-message';
import { ExperienceDetailsScreen } from '.';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/hooks/use-authenticated-image-source', () => ({
  useAuthenticatedImageSource: jest.fn(),
}));

const { useAuthenticatedImageSource: actualImageSourceHook } = jest.requireActual<
  typeof import('@/hooks/use-authenticated-image-source')
>('@/hooks/use-authenticated-image-source');

jest.mock('@/server/places', () => ({
  getPlaceDetails: jest.fn(),
  getStoredLocationDetails: jest.fn(),
}));

jest.mock('@/server/events', () => ({
  createProposal: jest.fn(),
}));

jest.mock('react-native-toast-message', () => ({
  __esModule: true,
  default: { show: jest.fn() },
}));

const proposal = {
  id: 'proposal-1',
  matched: false,
  name: 'Bloom Café',
  location: {
    id: 'location-1',
    externalId: null,
    name: 'Bloom Café',
    description: null,
    address: 'Rua das Flores, 10',
  },
} as unknown as CreatedProposal;

const details: PlaceDetails = {
  externalId: 'cafe-1',
  name: 'Bloom Café',
  imageUrl: 'https://example.com/cafe.jpg',
  description: null,
  address: null,
  rating: null,
  priceRange: null,
  phoneNumber: null,
  website: null,
  openingHours: [],
};

async function renderDetails(props: ComponentProps<typeof ExperienceDetailsScreen>) {
  const result = render(<ExperienceDetailsScreen {...props} />);
  const request: unknown = props.isStoredLocation
    ? jest.mocked(getStoredLocationDetails).mock.results.at(-1)?.value
    : jest.mocked(getPlaceDetails).mock.results.at(-1)?.value;
  await waitFor(() => {
    expect(request).toBeDefined();
  });
  await act(async () => {
    await Promise.resolve(request).catch(() => undefined);
    await Promise.resolve();
    await Promise.resolve();
  });
  return result;
}

describe('<ExperienceDetailsScreen />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useAuthenticatedImageSource).mockImplementation(actualImageSourceHook);
    (useRouter as jest.Mock).mockReturnValue({ back: jest.fn(), push: jest.fn() });
    jest.mocked(createProposal).mockResolvedValue(proposal);
    jest.mocked(getPlaceDetails).mockResolvedValue(details);
    jest.mocked(getStoredLocationDetails).mockResolvedValue(details);
  });

  test('shows the Google photo and defaults for missing location data', async () => {
    const { findByText, getAllByText, getByTestId } = await renderDetails({
      groupId: 'group-1',
      placeId: 'cafe-1',
    });

    expect(await findByText('Bloom Café')).toBeTruthy();
    expect(getByTestId('experience-details-image').props.accessibilityLabel).toBe(
      'Foto de Bloom Café'
    );
    expect(getByTestId('experience-details-website').props.children).toBe('');
    expect(getByTestId('experience-details-screen')).toBeTruthy();
    expect(await findByText('(00) 00000-0000')).toBeTruthy();
    expect(getAllByText('--')).toHaveLength(3);
    expect(getByTestId('experience-details-name')).toBeTruthy();
    expect(getPlaceDetails).toHaveBeenCalledWith('cafe-1');
  });

  test('never flashes the placeholder while the photo source is pending', async () => {
    jest.mocked(useAuthenticatedImageSource).mockImplementation(() => null);

    const { findByText, getByTestId, queryByText } = await renderDetails({
      groupId: 'group-1',
      placeId: 'cafe-1',
    });

    await findByText('Bloom Café');
    expect(getByTestId('experience-details-image')).toBeTruthy();
    expect(queryByText('location-outline')).toBeNull();
  });

  test('returns to the previous screen', async () => {
    const back = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ back, push: jest.fn() });
    const { getByTestId } = await renderDetails({ groupId: 'group-1', placeId: 'cafe-1' });

    fireEvent.press(getByTestId('experience-details-back'));
    await Promise.resolve();
    expect(back).toHaveBeenCalled();
  });

  test('renders populated details, rating, price range and a missing-photo placeholder', async () => {
    jest.mocked(getPlaceDetails).mockResolvedValueOnce({
      ...details,
      imageUrl: null,
      address: 'Rua das Flores, 10',
      rating: 4.6,
      priceRange: { start: null, end: 80, currencyCode: 'BRL' },
      phoneNumber: '(51) 3333-4444',
      website: 'https://bloom.example',
      openingHours: ['segunda-feira: 09:00–18:00'],
    });

    const { findByText, getByTestId, queryByTestId } = await renderDetails({
      groupId: 'group-1',
      placeId: 'cafe-1',
    });

    expect(await findByText('Rua das Flores, 10')).toBeTruthy();
    expect(await findByText('(51) 3333-4444')).toBeTruthy();
    expect(await findByText('segunda-feira: 09:00–18:00')).toBeTruthy();
    expect(await findByText('https://bloom.example')).toBeTruthy();
    expect(await findByText('-- - R$ 80')).toBeTruthy();
    expect(getByTestId('experience-details-rating')).toBeTruthy();
    expect(getByTestId('experience-details-website')).toBeTruthy();
    expect(getByTestId('experience-details-screen')).toBeTruthy();
    expect(queryByTestId('experience-details-image')).toBeNull();
  });

  test('suggests the Google place right away and returns to the experiences list', async () => {
    const dismissTo = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ back: jest.fn(), dismissTo, replace: jest.fn() });
    jest.mocked(getPlaceDetails).mockResolvedValueOnce({
      ...details,
      address: 'Rua Padre Chagas, 320',
      phoneNumber: '(51) 3333-4444',
      website: 'https://bloom.example',
      openingHours: ['Monday: 09:00-18:00', 'Tuesday: 09:00-18:00'],
      priceRange: { start: 20, end: 80, currencyCode: 'BRL' },
    });
    const { findByTestId } = await renderDetails({ groupId: 'group-1', placeId: 'cafe-1' });

    fireEvent.press(await findByTestId('experience-suggest-location'));

    await waitFor(() => {
      expect(dismissTo).toHaveBeenCalledWith({
        pathname: '/group/[id]/experiences',
        params: { id: 'group-1' },
      });
    });
    expect(createProposal).toHaveBeenCalledWith('group-1', {
      externalId: 'cafe-1',
      imageUrl: details.imageUrl,
    });
    expect(Toast.show).toHaveBeenCalledWith({
      type: 'success',
      text1: 'Sugestão enviada!',
      text2: 'Bloom Café foi sugerido para o grupo.',
    });
  });

  test('suggests a saved location by locationId', async () => {
    const dismissTo = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ back: jest.fn(), dismissTo, replace: jest.fn() });
    jest.mocked(getStoredLocationDetails).mockResolvedValueOnce({
      ...details,
      externalId: null,
      address: 'Rua das Flores, 10',
    });

    const { findByTestId } = await renderDetails({
      groupId: 'group-1',
      placeId: 'location-1',
      isStoredLocation: true,
    });

    fireEvent.press(await findByTestId('experience-suggest-location'));

    await waitFor(() => {
      expect(dismissTo).toHaveBeenCalledTimes(1);
    });
    expect(getStoredLocationDetails).toHaveBeenCalledWith('location-1');
    expect(getPlaceDetails).not.toHaveBeenCalled();
    expect(createProposal).toHaveBeenCalledWith('group-1', { locationId: 'location-1' });
  });

  test('opens the match screen when the suggestion matches right away', async () => {
    const replace = jest.fn();
    const dismissTo = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ back: jest.fn(), dismissTo, replace });
    jest.mocked(createProposal).mockResolvedValueOnce({ ...proposal, matched: true });
    const { findByTestId } = await renderDetails({ groupId: 'group-1', placeId: 'cafe-1' });

    fireEvent.press(await findByTestId('experience-suggest-location'));

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith({
        pathname: '/group/[id]/match',
        params: {
          id: 'group-1',
          matchedSuggestionId: 'proposal-1',
          locationId: 'location-1',
          name: 'Bloom Café',
          address: 'Rua das Flores, 10',
        },
      });
    });
    expect(dismissTo).not.toHaveBeenCalled();
  });

  test('stays on the details and shows an error when the suggestion fails', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const dismissTo = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ back: jest.fn(), dismissTo, replace: jest.fn() });
    jest.mocked(createProposal).mockRejectedValueOnce(new Error('network error'));
    const { findByTestId, findByText } = await renderDetails({
      groupId: 'group-1',
      placeId: 'cafe-1',
    });

    fireEvent.press(await findByTestId('experience-suggest-location'));

    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível sugerir este local. Tente novamente.',
      });
    });
    expect(dismissTo).not.toHaveBeenCalled();
    expect(await findByText('Sugerir este local')).toBeTruthy();
    consoleError.mockRestore();
  });

  test('shows a loading state while details are pending', async () => {
    let resolveDetails!: (value: PlaceDetails) => void;
    jest.mocked(getPlaceDetails).mockReturnValueOnce(
      new Promise((resolve) => {
        resolveDetails = resolve;
      })
    );

    const { findByText, getByTestId, queryByTestId } = await Promise.resolve(
      render(
        <ExperienceDetailsScreen
          groupId="group-1"
          placeId="slow-place"
        />
      )
    );

    expect(getByTestId('experience-details-loading')).toBeTruthy();
    expect(queryByTestId('experience-details-back')).toBeNull();
    await act(async () => {
      resolveDetails(details);
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(await findByText('Bloom Café')).toBeTruthy();
  });

  test('shows the price placeholder when the API returns an empty range', async () => {
    jest.mocked(getPlaceDetails).mockResolvedValueOnce({
      ...details,
      priceRange: { start: null, end: null, currencyCode: 'BRL' },
    });

    const { findByText, getAllByText } = await renderDetails({
      groupId: 'group-1',
      placeId: 'empty-price-place',
    });

    expect(await findByText('Bloom Café')).toBeTruthy();
    expect(getAllByText('--')).toHaveLength(3);
  });

  test('shows the failure state when place details cannot be loaded', async () => {
    jest.mocked(getPlaceDetails).mockRejectedValueOnce(new Error('network error'));
    const back = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ back, push: jest.fn() });

    const { findByText, getByTestId } = await renderDetails({
      groupId: 'group-1',
      placeId: 'unavailable-place',
    });

    expect(await findByText('Não foi possível carregar as informações deste local.')).toBeTruthy();
    fireEvent.press(getByTestId('experience-details-back'));
    await Promise.resolve();
    expect(back).toHaveBeenCalled();
  });

  test('loads the details again when the user retries after a failure', async () => {
    jest.mocked(getPlaceDetails).mockRejectedValueOnce(new Error('network error'));

    const { findByText, getByLabelText, queryByText } = await renderDetails({
      groupId: 'group-1',
      placeId: 'flaky-place',
    });

    await findByText('Não foi possível carregar as informações deste local.');

    fireEvent.press(getByLabelText('Tentar novamente'));

    expect(await findByText('Bloom Café')).toBeTruthy();
    expect(getPlaceDetails).toHaveBeenCalledTimes(2);
    expect(queryByText('Não foi possível carregar as informações deste local.')).toBeNull();
  });
});
