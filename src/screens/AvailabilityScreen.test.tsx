// 1. Renomeamos os componentes com o prefixo 'Mock'
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import {
  Text as MockText,
  TouchableOpacity as MockTouchableOpacity,
  View as MockView,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { AvailabilityScreen } from './AvailabilityScreen';

interface MockAvailabilityCardProps {
  onIntervalsChange?: (intervals: unknown[]) => void;
}

interface MockButtonProps {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
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
  Button: ({ title, onPress, disabled }: MockButtonProps) => (
    <MockTouchableOpacity
      testID={`button-${title}`}
      onPress={onPress}
      disabled={disabled}
    >
      <MockText>{title}</MockText>
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

describe('AvailabilityScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the formatted date correctly', async () => {
    const { getByTestId } = await render(<AvailabilityScreen date="2026-09-14" />);
    const dateText: unknown = getByTestId('availability-screen-date-text');

    expect(getChildren(dateText)).toContain('14/09');
  });

  it('shows the empty-state message when there are no participants', async () => {
    const { getByTestId, queryByTestId } = await render(<AvailabilityScreen date="2026-09-14" />);
    const heading: unknown = getByTestId('availability-screen-participants-heading');

    expect(getChildren(heading)).toContain('Nenhum participante');
    expect(queryByTestId('availability-screen-participants')).toBeNull();
  });

  it('shows participant avatars and heading when participants are present', async () => {
    const participants = [{ id: '1', name: 'Ana', avatarUrl: 'https://example.com/ana.png' }];

    const { getByTestId } = await render(
      <AvailabilityScreen
        date="2026-09-14"
        participants={participants}
      />
    );

    const heading: unknown = getByTestId('availability-screen-participants-heading');

    expect(getChildren(heading)).toContain('Participantes disponíveis');
    expect(getByTestId('availability-screen-participants')).toBeTruthy();
  });

  it('calls onConfirm and shows success toast when confirmed', async () => {
    const onConfirm = jest.fn().mockResolvedValue(undefined);
    const { getByTestId } = await render(
      <AvailabilityScreen
        date="2026-09-14"
        onConfirm={onConfirm}
      />
    );

    const btnConfirm = getByTestId('button-Confirmar!');
    void fireEvent.press(btnConfirm);

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    expect(onConfirm).toHaveBeenCalledWith([]);
    expect(Toast.show).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'success', text1: 'Sucesso!' })
    );
  });

  it('shows error toast when onConfirm fails', async () => {
    const onConfirmError = jest.fn().mockRejectedValue(new Error('API Error'));
    const { getByTestId } = await render(
      <AvailabilityScreen
        date="2026-09-14"
        onConfirm={onConfirmError}
      />
    );

    const btnConfirm = getByTestId('button-Confirmar!');
    void fireEvent.press(btnConfirm);

    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'error', text1: 'Erro' })
      );
    });
  });

  it('calls onDecline and shows success toast when declined', async () => {
    const onDecline = jest.fn().mockResolvedValue(undefined);
    const { getByTestId } = await render(
      <AvailabilityScreen
        date="2026-09-14"
        onDecline={onDecline}
      />
    );

    const btnDecline = getByTestId('button-Não estarei disponível neste dia.');
    void fireEvent.press(btnDecline);

    await waitFor(() => {
      expect(onDecline).toHaveBeenCalledTimes(1);
    });

    expect(Toast.show).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'success', text1: 'Sucesso!' })
    );
  });

  it('shows error toast when onDecline fails', async () => {
    const onDeclineError = jest.fn().mockRejectedValue(new Error('API Error'));
    const { getByTestId } = await render(
      <AvailabilityScreen
        date="2026-09-14"
        onDecline={onDeclineError}
      />
    );

    const btnDecline = getByTestId('button-Não estarei disponível neste dia.');
    void fireEvent.press(btnDecline);

    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'error', text1: 'Erro' })
      );
    });
  });
});
