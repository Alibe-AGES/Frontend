import { fireEvent, render } from '@testing-library/react-native';
import { EventCard, EventCardEvent } from './index';

const fullEvent: EventCardEvent = {
  id: 'event-1',
  name: 'Bloom Café',
  timeslot: new Date(2026, 4, 18, 10, 0).toISOString(),
  budgetStart: '20',
  budgetEnd: '100',
  status: 'confirmed',
  location: { description: 'Bloom Café', address: 'Av. Carlos Gomes, 600' },
  imageUrl: 'https://cdn.alibe.com/bloom.jpg',
  phone: '(00) 00000-0000',
  openingHours: ['Segunda à sábado: 9:00 - 18:00', 'Domingo: Fechado'],
  website: 'www.BloomCafé.com',
};

describe('<EventCard />', () => {
  test('renders every event detail when available', async () => {
    const { getByText, getByTestId } = await render(<EventCard event={fullEvent} />);

    expect(getByTestId('alibe-event-card-title').props.children).toBe('Bloom Café');
    expect(getByText('Av. Carlos Gomes, 600')).toBeTruthy();
    expect(getByText('10:00')).toBeTruthy();
    expect(getByText('R$ 20 - 100')).toBeTruthy();
    expect(getByText('(00) 00000-0000')).toBeTruthy();
    expect(getByText('Segunda à sábado: 9:00 - 18:00\nDomingo: Fechado')).toBeTruthy();
    expect(getByText('www.BloomCafé.com')).toBeTruthy();
    expect(getByTestId('alibe-event-card-image')).toBeTruthy();
  });

  test('shows a location placeholder when there is no image', async () => {
    const { getByTestId, queryByTestId } = await render(
      <EventCard event={{ ...fullEvent, imageUrl: null }} />
    );

    expect(getByTestId('alibe-event-card-image-placeholder')).toBeTruthy();
    expect(queryByTestId('alibe-event-card-image')).toBeNull();
  });

  test('hides optional sections when only the id is provided', async () => {
    const { getByTestId, queryByTestId } = await render(<EventCard event={{ id: 'event-2' }} />);

    expect(getByTestId('alibe-event-card-title').props.children).toBe('Evento');
    for (const part of ['address', 'time', 'budget', 'phone', 'hours', 'website', 'edit']) {
      expect(queryByTestId(`alibe-event-card-${part}`)).toBeNull();
    }
  });

  test('falls back to the location description when the event has no name', async () => {
    const { getByTestId } = await render(
      <EventCard event={{ id: 'event-3', location: { description: 'Parque Farroupilha' } }} />
    );

    expect(getByTestId('alibe-event-card-title').props.children).toBe('Parque Farroupilha');
  });

  test('formats a budget with only one bound', async () => {
    const { getByText } = await render(<EventCard event={{ id: 'event-4', budgetStart: 50 }} />);

    expect(getByText('A partir de R$ 50')).toBeTruthy();
  });

  test('calls onEditPress when the edit button is tapped', async () => {
    const onEditPress = jest.fn();
    const { getByLabelText } = await render(
      <EventCard
        event={fullEvent}
        onEditPress={onEditPress}
      />
    );

    await fireEvent.press(getByLabelText('Editar evento'));

    expect(onEditPress).toHaveBeenCalledTimes(1);
  });
});
