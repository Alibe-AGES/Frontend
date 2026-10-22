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
});
