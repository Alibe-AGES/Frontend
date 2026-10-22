import { fireEvent, render } from '@testing-library/react-native';
import { useRouter } from 'expo-router';

import { getPlaceDetails, PlaceDetails } from '@/server/places';
import { ExperienceDetailsScreen } from '.';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/server/places', () => ({
  getPlaceDetails: jest.fn(),
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

describe('<ExperienceDetailsScreen />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ back: jest.fn() });
    jest.mocked(getPlaceDetails).mockResolvedValue(details);
  });

  test('shows the Google photo and defaults for missing location data', async () => {
    const { findByText, getAllByText, getByTestId } = await render(
      <ExperienceDetailsScreen placeId="cafe-1" />
    );

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

  test('returns to the previous screen', async () => {
    const back = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ back });
    const { getByTestId } = await render(<ExperienceDetailsScreen placeId="cafe-1" />);

    await fireEvent.press(getByTestId('experience-details-back'));
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

    const { findByText, getByTestId, queryByTestId } = await render(
      <ExperienceDetailsScreen placeId="cafe-1" />
    );

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

  test('shows a loading state while details are pending', async () => {
    let resolveDetails!: (value: PlaceDetails) => void;
    jest.mocked(getPlaceDetails).mockReturnValueOnce(
      new Promise((resolve) => {
        resolveDetails = resolve;
      })
    );

    const { findByText, getByTestId } = await render(
      <ExperienceDetailsScreen placeId="slow-place" />
    );

    expect(getByTestId('experience-details-loading')).toBeTruthy();
    resolveDetails(details);
    expect(await findByText('Bloom Café')).toBeTruthy();
  });

  test('shows the price placeholder when the API returns an empty range', async () => {
    jest.mocked(getPlaceDetails).mockResolvedValueOnce({
      ...details,
      priceRange: { start: null, end: null, currencyCode: 'BRL' },
    });

    const { findByText, getAllByText } = await render(
      <ExperienceDetailsScreen placeId="empty-price-place" />
    );

    expect(await findByText('Bloom Café')).toBeTruthy();
    expect(getAllByText('--')).toHaveLength(3);
  });

  test('shows the failure state when place details cannot be loaded', async () => {
    jest.mocked(getPlaceDetails).mockRejectedValueOnce(new Error('network error'));
    const back = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ back });

    const { findByText, getByTestId } = await render(
      <ExperienceDetailsScreen placeId="unavailable-place" />
    );

    expect(await findByText('Não foi possível carregar as informações deste local.')).toBeTruthy();
    await fireEvent.press(getByTestId('experience-details-error-back'));
    expect(back).toHaveBeenCalled();
  });
});
