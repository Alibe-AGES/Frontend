import { fireEvent, render } from '@testing-library/react-native';
import { NewExperienceScreen } from './index';

jest.mock('@/components/NavigationBar', () => ({ NavigationBar: () => null }));
jest.mock('@/components/EventCard', () => ({
  EventCard: ({ event, testID }: { event: { name?: string }; testID: string }) => {
    const { Text } = jest.requireActual<typeof import('react-native')>('react-native');
    return <Text testID={testID}>{event.name}</Text>;
  },
}));

const proposal = {
  id: 'proposal-1',
  type: 'suggestion' as const,
  groupId: 'group-1',
  name: 'Bloom Café',
  createdAt: '2026-10-22T12:00:00.000Z',
  owner: { id: 'user-1', name: 'Ana', image: null },
  location: {
    id: 'location-1',
    externalId: 'google-place-1',
    name: 'Bloom Café',
    description: null,
    address: 'Rua Padre Chagas, 320',
    openingHours: [],
    rating: null,
    phoneNumber: null,
    website: null,
    priceRange: { start: null, end: null, currencyCode: null },
    imageUrl: null,
    manuallyCreated: false,
  },
  responses: { yes: 1, no: 0, pending: 2 },
};

const buildProps = (overrides: Partial<React.ComponentProps<typeof NewExperienceScreen>> = {}) => ({
  groupId: 'group-1',
  proposal,
  isLoading: false,
  isSubmitting: false,
  error: null,
  onRetry: jest.fn(),
  onAnswer: jest.fn(),
  ...overrides,
});

describe('<NewExperienceScreen />', () => {
  test('shows the current location proposal and yes/no decisions', async () => {
    const { getByText, getByTestId } = await render(<NewExperienceScreen {...buildProps()} />);

    expect(getByText('Match de rolês')).toBeTruthy();
    expect(getByText('1 curtiram este local')).toBeTruthy();
    expect(getByTestId('new-experience-proposal-proposal-1').props.children).toBe('Bloom Café');
    expect(getByTestId('new-experience-like').props.accessibilityLabel).toBe('Quero este local');
    expect(getByTestId('new-experience-dislike').props.accessibilityLabel).toBe(
      'Não quero este local'
    );
  });

  test('sends yes and no decisions to the controller', async () => {
    const onAnswer = jest.fn();
    const { getByTestId } = await render(<NewExperienceScreen {...buildProps({ onAnswer })} />);

    await fireEvent.press(getByTestId('new-experience-dislike'));
    await fireEvent.press(getByTestId('new-experience-like'));

    expect(onAnswer).toHaveBeenNthCalledWith(1, 'no');
    expect(onAnswer).toHaveBeenNthCalledWith(2, 'yes');
  });

  test('renders loading state', async () => {
    const loading = await render(
      <NewExperienceScreen {...buildProps({ proposal: null, isLoading: true })} />
    );
    expect(loading.getByTestId('new-experience-loading')).toBeTruthy();
  });

  test('allows retrying after loading proposals fails', async () => {
    const onRetry = jest.fn();
    const failed = await render(
      <NewExperienceScreen {...buildProps({ proposal: null, error: 'offline', onRetry })} />
    );
    await fireEvent.press(failed.getByTestId('new-experience-retry'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  test('renders an empty state when there are no active proposals', async () => {
    const empty = await render(<NewExperienceScreen {...buildProps({ proposal: null })} />);
    expect(empty.getByTestId('new-experience-empty')).toBeTruthy();
  });
});
