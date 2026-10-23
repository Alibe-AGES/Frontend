import { fireEvent, render } from '@testing-library/react-native';
import { NewExperienceScreen } from './index';

jest.mock('@/components/NavigationBar', () => ({ NavigationBar: () => null }));
jest.mock('@/components/EventCard', () => ({
  EventCard: ({
    event,
    testID,
    variant,
  }: {
    event: Record<string, unknown> & { name?: string };
    testID: string;
    variant?: string;
  }) => {
    const { Text } = jest.requireActual<typeof import('react-native')>('react-native');
    return (
      <>
        <Text
          testID={testID}
          accessibilityLabel={variant}
        >
          {event.name}
        </Text>
        <Text testID={`${testID}-event-data`}>{JSON.stringify(event)}</Text>
      </>
    );
  },
}));

const proposal = {
  id: 'proposal-1',
  type: 'suggestion' as const,
  groupId: 'group-1',
  name: 'Bloom Café',
  createdAt: '2026-10-22T12:00:00.000Z',
  myAnswer: null,
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
    const { getByText, getByTestId, queryByTestId } = await render(
      <NewExperienceScreen {...buildProps()} />
    );

    expect(getByText('Match de rolês')).toBeTruthy();
    expect(queryByTestId('new-experience-back')).toBeNull();
    expect(getByText('1 curtiram este local')).toBeTruthy();
    expect(getByTestId('new-experience-proposal-proposal-1').props.children).toBe('Bloom Café');
    expect(getByTestId('new-experience-proposal-proposal-1').props.accessibilityLabel).toBe(
      'proposal'
    );
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

  test('shows the creator vote and disables duplicate decisions', async () => {
    const onAnswer = jest.fn();
    const { getByText, getByTestId } = await render(
      <NewExperienceScreen
        {...buildProps({ proposal: { ...proposal, myAnswer: 'yes' }, onAnswer })}
      />
    );

    expect(getByText('Você já sugeriu este local')).toBeTruthy();
    await fireEvent.press(getByTestId('new-experience-like'));
    await fireEvent.press(getByTestId('new-experience-dislike'));
    expect(onAnswer).not.toHaveBeenCalled();
  });

  test('keeps decisions enabled when myAnswer is pending', async () => {
    const onAnswer = jest.fn();
    const { getByTestId } = await render(
      <NewExperienceScreen
        {...buildProps({ proposal: { ...proposal, myAnswer: 'pending' }, onAnswer })}
      />
    );

    await fireEvent.press(getByTestId('new-experience-like'));

    expect(onAnswer).toHaveBeenCalledWith('yes');
  });

  test('parses JSON description details returned by the Backend for the proposal card', async () => {
    const proposalWithDetails = {
      ...proposal,
      location: {
        ...proposal.location,
        description: JSON.stringify({
          phoneNumber: '(51) 3333-3333',
          website: 'https://cafe.example',
          openingHours: ['Sexta: 18:00-00:00'],
          priceStart: 30,
          priceEnd: 60,
        }),
      },
    };
    const { getByTestId } = await render(
      <NewExperienceScreen {...buildProps({ proposal: proposalWithDetails })} />
    );

    const cardEvent = JSON.parse(
      getByTestId('new-experience-proposal-proposal-1-event-data').props.children as string
    ) as Record<string, unknown>;
    expect(cardEvent.phone).toBe('(51) 3333-3333');
    expect(cardEvent.website).toBe('https://cafe.example');
    expect(cardEvent.openingHours).toEqual(['Sexta: 18:00-00:00']);
    expect(cardEvent.budgetStart).toBe(30);
    expect(cardEvent.budgetEnd).toBe(60);
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
