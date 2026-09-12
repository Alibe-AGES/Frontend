import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';

import { useGroups } from '@/hooks/useGroups';
import { GroupsScreen } from './GroupsScreen';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/hooks/useGroups', () => ({
  useGroups: jest.fn(),
}));

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseGroups = useGroups as jest.MockedFunction<typeof useGroups>;

const GROUPS = [
  { id: '1', name: 'Hermanas', photoUri: null, color: 'bg-lime' as const },
  { id: '2', name: 'Pela cidade', photoUri: null, color: 'bg-pink' as const },
];

describe('<GroupsScreen />', () => {
  const push = jest.fn();

  beforeEach(() => {
    mockUseRouter.mockReturnValue({ push } as unknown as ReturnType<typeof useRouter>);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders the header content', async () => {
    mockUseGroups.mockReturnValue({
      groups: [],
      isLoading: false,
      isRefreshing: false,
      error: null,
      refetch: jest.fn(),
    });

    const { getByText, getByLabelText } = await render(<GroupsScreen />);

    expect(getByText('Meus grupos')).toBeTruthy();
    expect(getByText('Clique no + para criar um novo grupo.')).toBeTruthy();
    expect(getByLabelText('Logo Alibe')).toBeTruthy();
  });

  test('shows a loading indicator while the groups are being fetched', async () => {
    mockUseGroups.mockReturnValue({
      groups: [],
      isLoading: true,
      isRefreshing: false,
      error: null,
      refetch: jest.fn(),
    });

    const { getByTestId } = await render(<GroupsScreen />);

    expect(getByTestId('alibe-groups-list-loading')).toBeTruthy();
  });

  test('shows an error state with a retry action when the request fails', async () => {
    const refetch = jest.fn();
    mockUseGroups.mockReturnValue({
      groups: [],
      isLoading: false,
      isRefreshing: false,
      error: 'Não foi possível carregar os grupos.',
      refetch,
    });

    const { getByText, getByLabelText } = await render(<GroupsScreen />);

    expect(getByText('Não foi possível carregar os grupos.')).toBeTruthy();

    await fireEvent.press(getByLabelText('Tentar novamente'));

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  test('shows an empty state when the user has no groups', async () => {
    mockUseGroups.mockReturnValue({
      groups: [],
      isLoading: false,
      isRefreshing: false,
      error: null,
      refetch: jest.fn(),
    });

    const { getByTestId } = await render(<GroupsScreen />);

    expect(getByTestId('alibe-groups-list-empty')).toBeTruthy();
  });

  test('shows every available group', async () => {
    mockUseGroups.mockReturnValue({
      groups: GROUPS,
      isLoading: false,
      isRefreshing: false,
      error: null,
      refetch: jest.fn(),
    });

    const { getByText } = await render(<GroupsScreen />);

    await waitFor(() => {
      expect(getByText('Hermanas')).toBeTruthy();
      expect(getByText('Pela cidade')).toBeTruthy();
    });
  });

  test('navigates to the group screen when a group card is pressed', async () => {
    mockUseGroups.mockReturnValue({
      groups: GROUPS,
      isLoading: false,
      isRefreshing: false,
      error: null,
      refetch: jest.fn(),
    });

    const { getByTestId } = await render(<GroupsScreen />);

    await waitFor(() => {
      expect(getByTestId('alibe-groups-list-item-1')).toBeTruthy();
    });

    await fireEvent.press(getByTestId('alibe-groups-list-item-1'));

    expect(push).toHaveBeenCalledWith({ pathname: '/group/[id]', params: { id: '1' } });
  });

  test('navigates to the create group screen when the create button is pressed', async () => {
    mockUseGroups.mockReturnValue({
      groups: [],
      isLoading: false,
      isRefreshing: false,
      error: null,
      refetch: jest.fn(),
    });

    const { getByTestId } = await render(<GroupsScreen />);

    await fireEvent.press(getByTestId('create-group-button'));

    expect(push).toHaveBeenCalledWith('/create-group');
  });
});
