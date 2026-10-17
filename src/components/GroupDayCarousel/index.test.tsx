import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { GroupDayCarousel, type GroupDayCarouselItem } from './index';

const mockItems: GroupDayCarouselItem[] = [
  {
    kind: 'proposal',
    event: {
      id: 'event-1',
      name: 'Bloom Café',
      timeslot: '2026-10-12T10:00:00',
      budgetStart: 20,
      budgetEnd: 100,
      status: 'pending',
      location: { address: 'Av. Carlos Gomes, 600' },
      imageUrl: null,
    },
    proposal: {
      ownerName: 'Ana',
      currentUserAnswer: 'yes',
      responses: [
        { userId: 'user-1', name: 'Eu', answer: 'yes', profilePic: null },
        {
          userId: 'user-2',
          name: 'Kata',
          answer: 'yes',
          profilePic: 'https://cdn.alibe.com/kata.jpg',
        },
        { userId: 'user-3', name: 'Manu', answer: 'no', profilePic: null },
        { userId: 'user-4', name: 'May', answer: 'pending', profilePic: null },
      ],
    },
  },
];

describe('<GroupDayCarousel />', () => {
  const onAvailabilityPress = jest.fn();
  const onPresenceResponse = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders participant status section and buttons', async () => {
    const { getByText, getByTestId } = await render(
      <GroupDayCarousel
        date="2026-10-12"
        items={mockItems}
        isLoading={false}
        error={null}
        onAvailabilityPress={onAvailabilityPress}
        onPresenceResponse={onPresenceResponse}
        currentUserId="user-1"
      />
    );

    expect(getByText('Status dos participantes')).toBeTruthy();
    expect(getByText('Confirmar!')).toBeTruthy();
    expect(getByText('Não estarei disponível neste dia')).toBeTruthy();
    expect(getByTestId('group-day-carousel-participants-event-1-user-1-badge-yes')).toBeTruthy();
    expect(getByTestId('group-day-carousel-participants-event-1-user-3-badge-no')).toBeTruthy();
  });

  test('calls onPresenceResponse with yes and no', async () => {
    const { getByTestId } = await render(
      <GroupDayCarousel
        date="2026-10-12"
        items={mockItems}
        isLoading={false}
        error={null}
        onAvailabilityPress={onAvailabilityPress}
        onPresenceResponse={onPresenceResponse}
      />
    );

    await fireEvent.press(getByTestId('group-day-carousel-presence-yes-event-1'));
    await waitFor(() => {
      expect(onPresenceResponse).toHaveBeenCalledWith('event-1', 'yes');
    });

    await fireEvent.press(getByTestId('group-day-carousel-presence-no-event-1'));
    await waitFor(() => {
      expect(onPresenceResponse).toHaveBeenCalledWith('event-1', 'no');
    });
  });

  test('calls onAvailabilityPress when availability button is pressed', async () => {
    const { getByTestId } = await render(
      <GroupDayCarousel
        date="2026-10-12"
        items={mockItems}
        isLoading={false}
        error={null}
        onAvailabilityPress={onAvailabilityPress}
        onPresenceResponse={onPresenceResponse}
      />
    );

    await fireEvent.press(getByTestId('group-day-carousel-availability'));
    expect(onAvailabilityPress).toHaveBeenCalledTimes(1);
  });

  test('renders loading state', async () => {
    const { getByTestId } = await render(
      <GroupDayCarousel
        date="2026-10-12"
        items={[]}
        isLoading={true}
        error={null}
        onAvailabilityPress={onAvailabilityPress}
        onPresenceResponse={onPresenceResponse}
      />
    );
    expect(getByTestId('group-day-carousel-loading')).toBeTruthy();
  });

  test('renders error state', async () => {
    const { getByTestId } = await render(
      <GroupDayCarousel
        date="2026-10-12"
        items={[]}
        isLoading={false}
        error="Erro ao carregar detalhes"
        onAvailabilityPress={onAvailabilityPress}
        onPresenceResponse={onPresenceResponse}
      />
    );
    expect(getByTestId('group-day-carousel-error')).toBeTruthy();
  });
});
