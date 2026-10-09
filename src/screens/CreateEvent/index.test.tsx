import type { EventCardDraft } from '@/components/EventCard';
import { fireEvent, render } from '@testing-library/react-native';
import { CreateEventScreen, CreateEventScreenProps } from './index';

jest.mock('@/components/BackButton', () => ({
  BackButton: () => null,
}));

jest.mock('@/components/NavigationBar', () => ({
  NavigationBar: ({ groupId }: { groupId: string }) => {
    const { Text } = jest.requireActual<typeof import('react-native')>('react-native');
    return <Text testID="mock-navigation-bar">{groupId}</Text>;
  },
}));

jest.mock('@/components/DatePickerSheet', () => ({
  DatePickerSheet: ({
    onSelectDate,
    onClose,
  }: {
    onSelectDate: (dateString: string) => void;
    onClose: () => void;
  }) => {
    const { Pressable, Text } = jest.requireActual<typeof import('react-native')>('react-native');
    return (
      <Pressable
        accessibilityRole="button"
        onPress={() => {
          onSelectDate('2026-10-15');
          onClose();
        }}
        testID="mock-date-picker-sheet"
      >
        <Text>Selecionar data de teste</Text>
      </Pressable>
    );
  },
}));

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));

jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
}));

const EMPTY_DRAFT: EventCardDraft = { name: '', imageUri: null, address: '', date: '', time: '' };

function buildProps(overrides: Partial<CreateEventScreenProps> = {}): CreateEventScreenProps {
  return {
    groupId: 'group-1',
    draft: EMPTY_DRAFT,
    onChangeDraft: jest.fn(),
    onSelectDate: jest.fn(),
    onImageSelected: jest.fn(),
    participants: [
      { id: 'user-1', name: 'Luiza', profilePic: null },
      { id: 'user-2', name: 'Kata', profilePic: null },
    ],
    currentUserId: 'user-1',
    isLoadingParticipants: false,
    isConfirmDisabled: true,
    isSubmitting: false,
    onConfirm: jest.fn(),
    ...overrides,
  };
}

describe('<CreateEventScreen />', () => {
  test('renders the tabs, event form, and participants', async () => {
    const { getByText, getByPlaceholderText, getByTestId } = await render(
      <CreateEventScreen {...buildProps()} />
    );

    expect(getByText('Evento')).toBeTruthy();
    expect(getByText('Sugestão')).toBeTruthy();
    expect(getByPlaceholderText('Definir nome do evento')).toBeTruthy();
    expect(getByText('Participantes')).toBeTruthy();
    expect(getByText('Eu')).toBeTruthy();
    expect(getByText('Kata')).toBeTruthy();
    expect(getByTestId('mock-navigation-bar').props.children).toBe('group-1');
  });

  test('opens the date sheet and forwards the selected date', async () => {
    const onSelectDate = jest.fn();
    const { getByTestId, queryByTestId } = await render(
      <CreateEventScreen {...buildProps({ onSelectDate })} />
    );

    expect(queryByTestId('mock-date-picker-sheet')).toBeNull();
    await fireEvent.press(getByTestId('create-event-card-date-button'));
    await fireEvent.press(getByTestId('mock-date-picker-sheet'));

    expect(onSelectDate).toHaveBeenCalledWith('2026-10-15');
  });

  test('forwards draft edits to the controller', async () => {
    const onChangeDraft = jest.fn();
    const { getByTestId } = await render(<CreateEventScreen {...buildProps({ onChangeDraft })} />);

    await fireEvent.changeText(getByTestId('create-event-card-name-input'), 'Bloom Café');

    expect(onChangeDraft).toHaveBeenCalledWith({ ...EMPTY_DRAFT, name: 'Bloom Café' });
  });

  test('disables confirm while the draft is incomplete', async () => {
    const onConfirm = jest.fn();
    const { getByTestId } = await render(<CreateEventScreen {...buildProps({ onConfirm })} />);

    const confirm = getByTestId('create-event-card-confirm');
    await fireEvent.press(confirm);

    expect(confirm.props.accessibilityState).toMatchObject({ disabled: true });
    expect(onConfirm).not.toHaveBeenCalled();
  });

  test('calls onConfirm when the draft is complete', async () => {
    const onConfirm = jest.fn();
    const { getByTestId } = await render(
      <CreateEventScreen {...buildProps({ onConfirm, isConfirmDisabled: false })} />
    );

    await fireEvent.press(getByTestId('create-event-card-confirm'));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  test('shows a loading message while participants load', async () => {
    const { getByText } = await render(
      <CreateEventScreen {...buildProps({ participants: [], isLoadingParticipants: true })} />
    );

    expect(getByText('Carregando…')).toBeTruthy();
  });

  test('hides the navigation bar without a group id', async () => {
    const { queryByTestId } = await render(
      <CreateEventScreen {...buildProps({ groupId: undefined })} />
    );

    expect(queryByTestId('mock-navigation-bar')).toBeNull();
  });
});
