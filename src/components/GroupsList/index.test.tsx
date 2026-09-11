import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { useGroups } from '@/hooks/useGroups';
import { GroupsList } from './index';

jest.mock('@/hooks/useGroups', () => ({
  useGroups: jest.fn(),
}));

const mockUseGroups = useGroups as jest.MockedFunction<typeof useGroups>;

const GROUPS = [
  { id: '1', name: 'Hermanas', photoUri: null, color: 'bg-lime' as const },
  { id: '2', name: 'Pela cidade', photoUri: null, color: 'bg-pink' as const },
  { id: '3', name: 'Galera 2012', photoUri: null, color: 'bg-coral' as const },
];

describe('<GroupsList />', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('shows a loading indicator while the groups are being fetched', async () => {
    mockUseGroups.mockReturnValue({
      groups: [],
      isLoading: true,
      isRefreshing: false,
      error: null,
      refetch: jest.fn(),
    });

    const { getByTestId } = await render(<GroupsList />);

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

    const { getByText, getByLabelText } = await render(<GroupsList />);

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

    const { getByTestId } = await render(<GroupsList />);

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

    const { getByText } = await render(<GroupsList />);

    await waitFor(() => {
      expect(getByText('Hermanas')).toBeTruthy();
      expect(getByText('Pela cidade')).toBeTruthy();
      expect(getByText('Galera 2012')).toBeTruthy();
    });
  });

  test('opens a group when its card is pressed', async () => {
    mockUseGroups.mockReturnValue({
      groups: GROUPS,
      isLoading: false,
      isRefreshing: false,
      error: null,
      refetch: jest.fn(),
    });
    const onGroupPress = jest.fn();
    const { getByTestId } = await render(<GroupsList onGroupPress={onGroupPress} />);

    await waitFor(() => {
      expect(getByTestId('alibe-groups-list-item-1')).toBeTruthy();
    });

    await fireEvent.press(getByTestId('alibe-groups-list-item-1'));

    expect(onGroupPress).toHaveBeenCalledWith('1');
  });
});
