import { fireEvent, render } from '@testing-library/react-native';
import { MatchScreen } from './index';

jest.mock('@/components/DatePickerSheet', () => ({
  DatePickerSheet: ({ onSelectDate }: { onSelectDate: (date: string) => void }) => {
    const { Pressable, Text } = jest.requireActual<typeof import('react-native')>('react-native');
    return (
      <Pressable
        testID="test-date-choice"
        onPress={() => {
          onSelectDate('2026-10-25');
        }}
      >
        <Text>Select day</Text>
      </Pressable>
    );
  },
}));

jest.mock('@/hooks/use-authenticated-image-source', () => ({
  useAuthenticatedImageSource: jest.fn(() => null),
}));

jest.mock('@/components/ParticipantAvatars', () => ({
  ParticipantAvatars: ({
    participants,
    testID,
  }: {
    participants: { id: string }[];
    testID: string;
  }) => {
    const { Text } = jest.requireActual<typeof import('react-native')>('react-native');
    return <Text testID={testID}>{participants.map(({ id }) => id).join(',')}</Text>;
  },
}));

const proposal = {
  id: 'proposal-1',
  type: 'suggestion' as const,
  groupId: 'group-1',
  eventId: null,
  name: 'Bloom Café',
  date: '2026-10-23',
  createdAt: '2026-10-22T12:00:00.000Z',
  matchedAt: '2026-10-23T12:00:00.000Z',
  matched: true,
  owner: { id: 'user-1', name: 'Ana', image: null },
  location: {
    id: 'location-1',
    externalId: null,
    name: 'Bloom Café',
    description: null,
    address: 'Rua Padre Chagas, 320',
    openingHours: [],
    rating: null,
    phoneNumber: null,
    website: null,
    priceRange: { start: null, end: null, currencyCode: null },
    imageUrl: null,
    manuallyCreated: true,
  },
  myAnswer: 'yes' as const,
};

describe('<MatchScreen />', () => {
  test('shows the group members and requires a date and time before scheduling', async () => {
    const onSchedule = jest.fn();
    const { getByTestId, getByText } = await render(
      <MatchScreen
        proposal={proposal}
        participants={[
          { id: 'user-1', name: 'Ana', profilePic: null },
          { id: 'user-2', name: 'Kata', profilePic: null },
        ]}
        currentUserId="user-1"
        isSubmitting={false}
        onSchedule={onSchedule}
      />
    );

    expect(getByText('Vocês têm um match!')).toBeTruthy();
    expect(getByTestId('match-participants').props.children).toBe('user-1,user-2');
    expect(getByTestId('match-create-event').props.accessibilityState).toMatchObject({
      disabled: true,
    });

    await fireEvent.press(getByTestId('match-date-button'));
    await fireEvent.press(getByTestId('test-date-choice'));
    await fireEvent.changeText(getByTestId('match-time-input'), '1930');
    expect(getByTestId('match-create-event').props.accessibilityState).toMatchObject({
      disabled: false,
    });

    await fireEvent.press(getByTestId('match-create-event'));
    expect(onSchedule).toHaveBeenCalledWith('2026-10-25', '19:30');
  });
});
