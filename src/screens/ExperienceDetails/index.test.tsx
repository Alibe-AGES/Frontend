import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';

import { useAuthenticatedImageSource } from '@/hooks/use-authenticated-image-source';
import { getPlaceDetails, getStoredLocationDetails, PlaceDetails } from '@/server/places';
import type { ComponentProps } from 'react';
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

  test('starts a location suggestion with the selected Google place', async () => {
    const push = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ back: jest.fn(), push });
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
    await Promise.resolve();
    expect(push).toHaveBeenCalledWith({
      pathname: '/group/[id]/create-event',
      params: {
        id: 'group-1',
        tab: 'suggestion',
        externalId: 'cafe-1',
        phoneNumber: '(51) 3333-4444',
        website: 'https://bloom.example',
        openingHours: 'Monday: 09:00-18:00\nTuesday: 09:00-18:00',
        priceStart: '20',
        priceEnd: '80',
        address: 'Rua Padre Chagas, 320',
        name: 'Bloom Café',
      },
    });
  });

  test('loads a matched saved location by locationId and preserves it when suggesting', async () => {
    const push = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ back: jest.fn(), push });
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
    await Promise.resolve();

    expect(getStoredLocationDetails).toHaveBeenCalledWith('location-1');
    expect(getPlaceDetails).not.toHaveBeenCalled();
    expect(push).toHaveBeenCalledWith({
      pathname: '/group/[id]/create-event',
      params: {
        id: 'group-1',
        tab: 'suggestion',
        locationId: 'location-1',
        address: 'Rua das Flores, 10',
        name: 'Bloom Café',
      },
    });
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
