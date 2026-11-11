// 1. Renomeamos os componentes com o prefixo 'Mock'
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import {
  Text as MockText,
  TouchableOpacity as MockTouchableOpacity,
  View as MockView,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { AvailabilityScreen } from '.';

interface MockAvailabilityCardProps {
  onIntervalsChange?: (intervals: unknown[]) => void;
}

interface MockButtonProps {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  testID?: string;
}

// 2. Utilizamos as variáveis 'Mock...' dentro do jest.mock()
jest.mock('@/components/AvailabilityCard', () => ({
  AvailabilityCard: (props: MockAvailabilityCardProps) => (
    <MockView
      testID="mock-availability-card"
      {...props}
    />
  ),
}));

jest.mock('@/components/BackButton', () => ({
  BackButton: () => <MockView testID="mock-back-button" />,
}));

jest.mock('@/components/Button', () => ({
  Button: ({ title, onPress, disabled, isLoading, testID }: MockButtonProps) => (
    <MockTouchableOpacity
      testID={testID}
      onPress={onPress}
      disabled={disabled}
      accessibilityState={{ disabled, busy: isLoading }}
    >
      {isLoading ? <MockView testID={`${String(testID)}-loading`} /> : <MockText>{title}</MockText>}
    </MockTouchableOpacity>
  ),
}));

jest.mock('@/theme', () => ({
  theme: {
    colors: {
      black: '#000',
      pink: '#F8C6D8',
      ink: '#1A1A1A',
      wine: '#7A2E2E',
    },
  },
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => <MockView testID="mock-ionicons" />,
}));

jest.mock('expo-image', () => ({
  Image: (props: Record<string, unknown>) => <MockView {...props} />,
}));

jest.mock('react-native-toast-message', () => ({
  __esModule: true,
  default: { show: jest.fn() },
}));

function getProps(element: unknown): Record<string, unknown> {
  return (element as { props?: Record<string, unknown> }).props ?? {};
}

function getChildren(element: unknown): string {
  return String(getProps(element).children);
}

const completeInterval = { id: 'a', startTime: '09:00', endTime: '10:00', error: null };

function changeIntervals(
  getByTestId: (testID: string) => unknown,
  intervals: Record<string, unknown>[]
) {
  const card = getByTestId('mock-availability-card');
  const { onIntervalsChange } = getProps(card) as MockAvailabilityCardProps;

  act(() => {
    onIntervalsChange?.(intervals);
  });
}

describe('AvailabilityScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the formatted date correctly', async () => {
    const { getByTestId } = await Promise.resolve(render(<AvailabilityScreen date="2026-09-14" />));
    const dateText: unknown = getByTestId('availability-screen-date-text');

    expect(getChildren(dateText)).toContain('14/09');
  });

  it('shows the empty-state message when nobody is available', async () => {
    const { getByTestId, queryByTestId } = await Promise.resolve(
      render(<AvailabilityScreen date="2026-09-14" />)
    );
    const heading: unknown = getByTestId('availability-screen-participants-heading');

    expect(getChildren(heading)).toContain('Nenhum participante disponível por enquanto');
    expect(queryByTestId('availability-screen-participants')).toBeNull();
  });

  it('shows a loading indicator instead of the heading while participants load', async () => {
    const { getByTestId, queryByTestId } = await Promise.resolve(
      render(
        <AvailabilityScreen
          date="2026-09-14"
          isLoadingParticipants
        />
      )
    );

    expect(getByTestId('availability-screen-participants-loading')).toBeTruthy();
    expect(queryByTestId('availability-screen-participants-heading')).toBeNull();
  });

  it('shows an avatar for each available participant, current user first', async () => {
    const participants = [
      {
        id: '1',
        name: 'Ana',
        photoUri: 'https://example.com/ana.png',
        isCurrentUser: false,
        availableAllDay: true,
        intervals: [],
      },
      {
        id: '2',
        name: 'Bia Souza',
        photoUri: null,
        isCurrentUser: true,
        availableAllDay: false,
        intervals: [['14:00', '20:00'] as const],
      },
    ];

    const { getAllByTestId, getByTestId, getByLabelText, getByText } = await Promise.resolve(
      render(
        <AvailabilityScreen
          date="2026-09-14"
          participants={participants}
        />
      )
    );

    const heading: unknown = getByTestId('availability-screen-participants-heading');
    const order = getAllByTestId(/^availability-participant-\d+$/).map(
      (participant) => getProps(participant).testID
    );

    expect(getChildren(heading)).toContain('Participantes disponíveis');
    expect(order).toEqual(['availability-participant-2', 'availability-participant-1']);
    expect(getByLabelText('Foto de Ana')).toBeTruthy();
    expect(getByText('Ana')).toBeTruthy();
    expect(getByText('Eu')).toBeTruthy();
    expect(getByTestId('availability-participant-2-avatar-placeholder')).toBeTruthy();
  });

  it('passes the current user registered intervals to the card', async () => {
    const base = {
      name: 'Ana',
      photoUri: null,
      availableAllDay: false,
      intervals: [['20:00', '21:00'] as const],
    };
    const { getByTestId, rerender } = await Promise.resolve(
      render(
        <AvailabilityScreen
          participants={[
            {
              ...base,
              id: 'other',
              isCurrentUser: false,
              intervals: [['08:00', '09:00'] as const],
            },
            { ...base, id: 'me', isCurrentUser: true },
          ]}
        />
      )
    );
    const registered = () => getProps(getByTestId('mock-availability-card')).registeredIntervals;

    expect(registered()).toEqual([['20:00', '21:00']]);

    rerender(
      <AvailabilityScreen
        participants={[{ ...base, id: 'me', isCurrentUser: true, availableAllDay: true }]}
      />
    );
    expect(registered()).toEqual([['00:00', '23:59']]);

    rerender(
      <AvailabilityScreen participants={[{ ...base, id: 'other', isCurrentUser: false }]} />
    );
    expect(registered()).toEqual([]);
  });

  it('keeps Confirmar disabled until every interval is filled in and valid', async () => {
    const { getByTestId } = await Promise.resolve(render(<AvailabilityScreen date="2026-09-14" />));
    const confirm = getByTestId('availability-screen-confirm');

    expect(confirm).toBeDisabled();

    changeIntervals(getByTestId, [{ id: 'a', startTime: '09:00', endTime: '' }]);
    expect(confirm).toBeDisabled();

    changeIntervals(getByTestId, [
      {
        id: 'a',
        startTime: '10:00',
        endTime: '09:00',
        error: 'O horário de fim deve ser depois do início.',
      },
    ]);
    expect(confirm).toBeDisabled();

    changeIntervals(getByTestId, [
      { id: 'a', startTime: '09:00', endTime: '10:00', error: null },
      { id: 'b', startTime: '', endTime: '' },
    ]);
    expect(confirm).toBeDisabled();

    changeIntervals(getByTestId, [completeInterval]);
    expect(confirm).toBeEnabled();
  });

  it('shows only the Confirmar button', async () => {
    const { getByTestId, queryByText } = await Promise.resolve(
      render(<AvailabilityScreen date="2026-09-14" />)
    );

    expect(getByTestId('availability-screen-confirm')).toBeTruthy();
    expect(queryByText('Voltar')).toBeNull();
  });

  it('shows a spinner on Confirmar while submitting, then a success toast', async () => {
    let resolveConfirm: () => void = () => undefined;
    const onConfirm = jest.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveConfirm = resolve;
        })
    );
    const { getByTestId, queryByTestId } = await Promise.resolve(
      render(
        <AvailabilityScreen
          date="2026-09-14"
          onConfirm={onConfirm}
        />
      )
    );

    changeIntervals(getByTestId, [completeInterval]);
    fireEvent.press(getByTestId('availability-screen-confirm'));

    expect(getByTestId('availability-screen-confirm-loading')).toBeTruthy();
    expect(onConfirm).toHaveBeenCalledWith([completeInterval]);

    await act(async () => {
      resolveConfirm();
      await Promise.resolve();
    });

    expect(queryByTestId('availability-screen-confirm-loading')).toBeNull();
    expect(Toast.show).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'success', text1: 'Sucesso!' })
    );
  });

  it('sends an empty list when the user is available all day', async () => {
    const onConfirm = jest.fn().mockResolvedValue(undefined);
    const { getByTestId } = await Promise.resolve(
      render(
        <AvailabilityScreen
          date="2026-09-14"
          onConfirm={onConfirm}
        />
      )
    );
    const card = () => getProps(getByTestId('mock-availability-card'));

    expect(getByTestId('availability-screen-confirm')).toBeDisabled();

    act(() => {
      (card().onAllDayChange as (allDay: boolean) => void)(true);
    });

    expect(card().allDay).toBe(true);
    expect(getByTestId('availability-screen-confirm')).toBeEnabled();

    fireEvent.press(getByTestId('availability-screen-confirm'));

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledWith([]);
    });
  });

  it('locks the all-day option when the user already registered the whole day', async () => {
    const { getByTestId } = await Promise.resolve(
      render(
        <AvailabilityScreen
          participants={[
            {
              id: 'me',
              name: 'Ana',
              photoUri: null,
              isCurrentUser: true,
              availableAllDay: true,
              intervals: [],
            },
          ]}
        />
      )
    );
    const card = getProps(getByTestId('mock-availability-card'));

    expect(card.allDay).toBe(true);
    expect(card.allDayDisabled).toBe(true);
    expect(getByTestId('availability-screen-confirm')).toBeDisabled();
  });

  it('shows error toast when onConfirm fails', async () => {
    const onConfirmError = jest.fn().mockRejectedValue(new Error('API Error'));
    const { getByTestId } = await Promise.resolve(
      render(
        <AvailabilityScreen
          date="2026-09-14"
          onConfirm={onConfirmError}
        />
      )
    );

    changeIntervals(getByTestId, [completeInterval]);
    fireEvent.press(getByTestId('availability-screen-confirm'));

    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'error', text1: 'Erro' })
      );
    });
  });
});
