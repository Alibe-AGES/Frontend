import { fireEvent, render, waitFor } from '@testing-library/react-native';
import type { ComponentProps } from 'react';
import { GroupDayCarousel, type GroupDayCarouselItem } from './index';

const mockItems: GroupDayCarouselItem[] = [
  {
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
    owner: { id: 'user-2', name: 'Katarina Souza', photoUri: 'https://cdn.alibe.com/kata.jpg' },
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
];

describe('<GroupDayCarousel />', () => {
  const onAvailabilityPress = jest.fn();
  const onPresenceResponse = jest.fn().mockResolvedValue(undefined);

  function renderCarousel(props: Partial<ComponentProps<typeof GroupDayCarousel>> = {}) {
    return Promise.resolve(
      render(
        <GroupDayCarousel
          items={mockItems}
          error={null}
          onAvailabilityPress={onAvailabilityPress}
          onPresenceResponse={onPresenceResponse}
          {...props}
        />
      )
    );
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('highlights who proposed the event with their photo', async () => {
    const { getByTestId, getByText, getByLabelText, queryByText } = await renderCarousel({
      currentUserId: 'user-1',
    });

    expect(getByTestId('group-day-carousel-owner-event-1')).toBeTruthy();
    expect(getByText('Proposto por')).toBeTruthy();
    expect(getByText('Katarina Souza')).toBeTruthy();
    expect(getByLabelText('Foto de Katarina Souza')).toBeTruthy();
    expect(queryByText('Proposta')).toBeNull();
    expect(queryByText('Encontro')).toBeNull();
  });

  test('calls the owner "Você" when the current user proposed the event', async () => {
    const { getByText } = await renderCarousel({ currentUserId: 'user-2' });

    expect(getByText('Você')).toBeTruthy();
  });

  test('shows a placeholder when the owner has no photo', async () => {
    const item = mockItems[0];
    const { getByTestId } = await renderCarousel({
      items: [{ ...item, owner: { ...item.owner, photoUri: null } }],
    });

    expect(getByTestId('group-day-carousel-owner-event-1-avatar-placeholder')).toBeTruthy();
  });

  function withAnswer(currentUserAnswer?: string): GroupDayCarouselItem[] {
    return mockItems.map((item) => ({ ...item, currentUserAnswer }));
  }

  test('renders the participant status section', async () => {
    const { getByText, getByTestId } = await renderCarousel({ currentUserId: 'user-1' });

    expect(getByText('Status dos participantes')).toBeTruthy();
    expect(getByTestId('group-day-carousel-participants-event-1-user-1-badge-yes')).toBeTruthy();
    expect(getByTestId('group-day-carousel-participants-event-1-user-3-badge-no')).toBeTruthy();
  });

  test('only offers to cancel when the user already confirmed, as the owner does', async () => {
    const { getByText, queryByText } = await renderCarousel({ items: withAnswer('yes') });

    expect(getByText('Cancelar presença')).toBeTruthy();
    expect(queryByText('Confirmar presença')).toBeNull();
  });

  test('only offers to confirm again after the user cancelled', async () => {
    const { getByText, queryByText } = await renderCarousel({ items: withAnswer('no') });

    expect(getByText('Confirmar presença')).toBeTruthy();
    expect(queryByText('Cancelar presença')).toBeNull();
  });

  test('offers both answers while the user has not answered yet', async () => {
    const { getByText } = await renderCarousel({ items: withAnswer(undefined) });

    expect(getByText('Confirmar presença')).toBeTruthy();
    expect(getByText('Cancelar presença')).toBeTruthy();
  });

  test('calls onPresenceResponse with the pressed answer', async () => {
    const { getByTestId, rerender } = await renderCarousel({ items: withAnswer(undefined) });

    fireEvent.press(getByTestId('group-day-carousel-presence-yes-event-1'));
    await waitFor(() => {
      expect(onPresenceResponse).toHaveBeenCalledWith('event-1', 'yes');
    });

    rerender(
      <GroupDayCarousel
        items={withAnswer('yes')}
        error={null}
        onAvailabilityPress={onAvailabilityPress}
        onPresenceResponse={onPresenceResponse}
      />
    );
    fireEvent.press(getByTestId('group-day-carousel-presence-no-event-1'));
    await waitFor(() => {
      expect(onPresenceResponse).toHaveBeenCalledWith('event-1', 'no');
    });
  });

  test('shows "Salvando..." only on the button that was pressed', async () => {
    const { getByTestId, getByText, queryByText, rerender } = await renderCarousel({
      items: withAnswer(undefined),
    });

    fireEvent.press(getByTestId('group-day-carousel-presence-no-event-1'));
    rerender(
      <GroupDayCarousel
        items={withAnswer(undefined)}
        error={null}
        onAvailabilityPress={onAvailabilityPress}
        onPresenceResponse={onPresenceResponse}
        pendingEventId="event-1"
      />
    );

    expect(getByText('Salvando...')).toBeTruthy();
    expect(getByText('Confirmar presença')).toBeTruthy();
    expect(queryByText('Cancelar presença')).toBeNull();
    expect(getByTestId('group-day-carousel-presence-yes-event-1')).toBeDisabled();
  });

  test('calls onAvailabilityPress when availability button is pressed', async () => {
    const { getByTestId } = await renderCarousel();

    fireEvent.press(getByTestId('group-day-carousel-availability'));
    expect(onAvailabilityPress).toHaveBeenCalledTimes(1);
  });

  test('renders error state', async () => {
    const { getByTestId } = await renderCarousel({
      items: [],
      error: 'Erro ao carregar detalhes',
    });

    expect(getByTestId('group-day-carousel-error')).toBeTruthy();
  });
});
