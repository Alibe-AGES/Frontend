import { getGroupCalendar } from '@/server/calendar';
import { getGroup, getGroupMembers } from '@/server/groups';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { GroupScreen } from './index';

jest.mock('expo-router', () => ({
  useFocusEffect: jest.fn(),
  useLocalSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock('@/server/calendar', () => ({
  getGroupCalendar: jest.fn(),
}));

jest.mock('@/server/groups', () => ({
  getGroup: jest.fn(),
  getGroupMembers: jest.fn(),
}));

jest.mock('@/components/BackButton', () => ({
  BackButton: () => null,
}));

jest.mock('@/components/NavigationBar', () => ({
  NavigationBar: () => null,
}));

let mockDayPress: ((date: string) => void) | undefined;

jest.mock('@/components/Calendar', () => ({
  Calendar: ({
    onDayPress,
  }: {
    onDayPress: (date: string) => void;
    onMonthChange: (date: string) => void;
  }) => {
    mockDayPress = onDayPress;
    return null;
  },
}));

const mockUseLocalSearchParams = useLocalSearchParams as jest.MockedFunction<
  typeof useLocalSearchParams
>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockGetGroupCalendar = getGroupCalendar as jest.MockedFunction<typeof getGroupCalendar>;
const mockGetGroup = getGroup as jest.MockedFunction<typeof getGroup>;
const mockGetGroupMembers = getGroupMembers as jest.MockedFunction<typeof getGroupMembers>;

describe('GroupScreen', () => {
  const push = jest.fn();

  beforeEach(() => {
    mockUseLocalSearchParams.mockReturnValue({ id: 'group-1' });
    mockUseRouter.mockReturnValue({ push } as unknown as ReturnType<typeof useRouter>);
    mockGetGroup.mockResolvedValue({
      id: 'group-1',
      name: 'Hermanas',
      profilePic: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      participants: [],
    });
    mockGetGroupMembers.mockResolvedValue([
      { id: 'user-1', name: 'Ana', profilePic: null },
      { id: 'user-2', name: 'Bia', profilePic: null },
    ]);
    mockGetGroupCalendar.mockResolvedValue([]);
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockDayPress = undefined;
  });

  test('loads and renders the group name and members', async () => {
    const { getByText, getByText: findText } = await render(<GroupScreen />);

    await waitFor(() => {
      expect(getByText('Hermanas')).toBeTruthy();
      expect(findText('Ana, Bia')).toBeTruthy();
    });
    expect(mockGetGroup).toHaveBeenCalledWith('group-1');
    expect(mockGetGroupMembers).toHaveBeenCalledWith('group-1');
  });

  test('shows the empty member state when no members are returned', async () => {
    mockGetGroupMembers.mockResolvedValue([]);

    const { getByText } = await render(<GroupScreen />);

    await waitFor(() => {
      expect(getByText('Nenhum membro encontrado neste grupo.')).toBeTruthy();
    });
  });

  test('navigates to day availability and group info', async () => {
    const { getByTestId } = await render(<GroupScreen />);

    await waitFor(() => {
      expect(getByTestId('group-screen')).toBeTruthy();
    });

    mockDayPress?.('2026-09-22');
    await fireEvent.press(getByTestId('group-screen-members'));

    expect(push).toHaveBeenCalledWith({
      pathname: '/group/[id]/day/[date]/availability',
      params: { id: 'group-1', date: '2026-09-22' },
    });
    expect(push).toHaveBeenCalledWith({
      pathname: '/group/[id]/info',
      params: { id: 'group-1' },
    });
  });
});
