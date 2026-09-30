import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { buildTimeslot, EventCard, EventCardDraft, EventCardEvent } from './index';

const mockRequestPermissions = jest.fn();
const mockLaunchImageLibrary = jest.fn();

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: (): Promise<unknown> =>
    mockRequestPermissions() as Promise<unknown>,
  launchImageLibraryAsync: (): Promise<unknown> => mockLaunchImageLibrary() as Promise<unknown>,
}));

jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
}));

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

describe('<EventCard mode="create" />', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const emptyDraft: EventCardDraft = { name: '', imageUri: null, address: '', date: '', time: '' };

  test('shows the placeholders of an empty draft', async () => {
    const { getByPlaceholderText, getByText, getByTestId } = await render(
      <EventCard
        mode="create"
        draft={emptyDraft}
        onChangeDraft={jest.fn()}
      />
    );

    expect(getByPlaceholderText('Definir nome do evento')).toBeTruthy();
    expect(getByPlaceholderText('Adicionar endereço')).toBeTruthy();
    expect(getByPlaceholderText('Adicionar data')).toBeTruthy();
    expect(getByPlaceholderText('Adicionar horário')).toBeTruthy();
    expect(getByText('Adicione uma imagem que representa seu evento')).toBeTruthy();
    expect(getByTestId('alibe-event-card-confirm')).toBeTruthy();
  });

  test('reports each edited field merged into the draft', async () => {
    const onChangeDraft = jest.fn();
    const draft = { ...emptyDraft, name: 'Bloom' };
    const { getByTestId } = await render(
      <EventCard
        mode="create"
        draft={draft}
        onChangeDraft={onChangeDraft}
      />
    );

    await fireEvent.changeText(getByTestId('alibe-event-card-name-input'), 'Bloom Café');
    await fireEvent.changeText(getByTestId('alibe-event-card-address-input'), 'Av. João Wallig');
    await fireEvent.changeText(getByTestId('alibe-event-card-date-input'), '18052026');
    await fireEvent.changeText(getByTestId('alibe-event-card-time-input'), '1000');

    expect(onChangeDraft).toHaveBeenNthCalledWith(1, { ...draft, name: 'Bloom Café' });
    expect(onChangeDraft).toHaveBeenNthCalledWith(2, { ...draft, address: 'Av. João Wallig' });
    expect(onChangeDraft).toHaveBeenNthCalledWith(3, { ...draft, date: '18/05/2026' });
    expect(onChangeDraft).toHaveBeenNthCalledWith(4, { ...draft, time: '10:00' });
  });

  test('picks an image from the gallery and stores it in the draft', async () => {
    const photo = { uri: 'file:///bloom.jpg', fileName: 'bloom.jpg', mimeType: 'image/jpeg' };
    mockRequestPermissions.mockResolvedValue({ granted: true });
    mockLaunchImageLibrary.mockResolvedValue({ canceled: false, assets: [photo] });
    const onChangeDraft = jest.fn();
    const onImageSelected = jest.fn();
    const { getByLabelText } = await render(
      <EventCard
        mode="create"
        draft={emptyDraft}
        onChangeDraft={onChangeDraft}
        onImageSelected={onImageSelected}
      />
    );

    await fireEvent.press(getByLabelText('Adicionar imagem do evento'));

    await waitFor(() => {
      expect(onChangeDraft).toHaveBeenCalledWith({ ...emptyDraft, imageUri: photo.uri });
    });
    expect(onImageSelected).toHaveBeenCalledWith(photo);
  });

  test('keeps the draft untouched when the gallery permission is denied', async () => {
    mockRequestPermissions.mockResolvedValue({ granted: false });
    const onChangeDraft = jest.fn();
    const { getByLabelText } = await render(
      <EventCard
        mode="create"
        draft={emptyDraft}
        onChangeDraft={onChangeDraft}
      />
    );

    await fireEvent.press(getByLabelText('Adicionar imagem do evento'));

    await waitFor(() => {
      expect(mockRequestPermissions).toHaveBeenCalled();
    });
    expect(mockLaunchImageLibrary).not.toHaveBeenCalled();
    expect(onChangeDraft).not.toHaveBeenCalled();
  });

  test('shows the selected image from the draft', async () => {
    const { getByLabelText, getByTestId } = await render(
      <EventCard
        mode="create"
        draft={{ ...emptyDraft, imageUri: 'file:///bloom.jpg' }}
        onChangeDraft={jest.fn()}
      />
    );

    expect(getByTestId('alibe-event-card-image')).toBeTruthy();
    expect(getByLabelText('Trocar imagem do evento')).toBeTruthy();
  });

  test('calls onConfirm unless confirmation is disabled', async () => {
    const onConfirm = jest.fn();
    const { getByTestId, rerender } = await render(
      <EventCard
        mode="create"
        draft={emptyDraft}
        onChangeDraft={jest.fn()}
        onConfirm={onConfirm}
        isConfirmDisabled
      />
    );

    await fireEvent.press(getByTestId('alibe-event-card-confirm'));
    expect(onConfirm).not.toHaveBeenCalled();

    await rerender(
      <EventCard
        mode="create"
        draft={emptyDraft}
        onChangeDraft={jest.fn()}
        onConfirm={onConfirm}
      />
    );
    await fireEvent.press(getByTestId('alibe-event-card-confirm'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});

describe('buildTimeslot', () => {
  test('combines a valid date and time', () => {
    expect(buildTimeslot('18/05/2026', '10:30')).toEqual(new Date(2026, 4, 18, 10, 30));
  });

  test('returns null for incomplete values', () => {
    expect(buildTimeslot('18/05', '10:30')).toBeNull();
    expect(buildTimeslot('18/05/2026', '25:00')).toBeNull();
  });
});
