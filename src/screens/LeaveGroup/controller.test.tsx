import { ApiError } from '@/server/api';
import { getGroup, leaveGroup, type GroupDetails } from '@/server/groups';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import LeaveGroupController from './controller';

jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock('react-native-toast-message', () => ({
  __esModule: true,
  default: { show: jest.fn() },
}));

jest.mock('@/server/groups', () => ({
  getGroup: jest.fn(),
  leaveGroup: jest.fn(),
}));

const mockUseLocalSearchParams = useLocalSearchParams as jest.MockedFunction<
  typeof useLocalSearchParams
>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockGetGroup = getGroup as jest.MockedFunction<typeof getGroup>;
const mockLeaveGroup = leaveGroup as jest.MockedFunction<typeof leaveGroup>;

const GROUP: GroupDetails = {
  id: 'group-1',
  name: 'Hermanas',
  profilePic: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  ownerId: 'user-1',
  participants: [],
};

describe('LeaveGroupController', () => {
  const back = jest.fn();
  const replace = jest.fn();
  const canGoBack = jest.fn();
  const dismissTo = jest.fn();

  beforeEach(() => {
    mockUseLocalSearchParams.mockReturnValue({ id: 'group-1' });
    mockUseRouter.mockReturnValue({ back, replace, canGoBack, dismissTo } as unknown as ReturnType<
      typeof useRouter
    >);
    canGoBack.mockReturnValue(true);
    mockGetGroup.mockResolvedValue(GROUP);
    mockLeaveGroup.mockResolvedValue(undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  test('shows the group name once it is loaded', async () => {
    const { findByText } = await Promise.resolve(render(<LeaveGroupController />));

    expect(await findByText('Tem certeza de que deseja sair do grupo Hermanas?')).toBeTruthy();
    expect(mockGetGroup).toHaveBeenCalledWith('group-1');
  });

  test('keeps the generic message when the group fails to load', async () => {
    mockGetGroup.mockRejectedValue(new ApiError('Not found', 404));
    const { findByText } = await Promise.resolve(render(<LeaveGroupController />));

    expect(await findByText('Tem certeza de que deseja sair do grupo?')).toBeTruthy();
  });

  test('goes back when navigation history is available', async () => {
    const { getByTestId } = await Promise.resolve(render(<LeaveGroupController />));

    fireEvent.press(getByTestId('leave-group-cancel'));
    await Promise.resolve();

    expect(back).toHaveBeenCalledTimes(1);
    expect(replace).not.toHaveBeenCalled();
  });

  test('replaces with the group route when there is no history', async () => {
    canGoBack.mockReturnValue(false);
    const { getByTestId } = await Promise.resolve(render(<LeaveGroupController />));

    fireEvent.press(getByTestId('leave-group-cancel'));
    await Promise.resolve();

    expect(replace).toHaveBeenCalledWith({ pathname: '/group/[id]', params: { id: 'group-1' } });
  });

  test('leaves the group and returns to the groups list', async () => {
    const { getByTestId, findByText } = await Promise.resolve(render(<LeaveGroupController />));
    await findByText('Tem certeza de que deseja sair do grupo Hermanas?');

    fireEvent.press(getByTestId('leave-group-confirm'));

    await waitFor(() => {
      expect(dismissTo).toHaveBeenCalledWith({
        pathname: '/groups',
        params: { left: 'group-1' },
      });
    });
    expect(mockLeaveGroup).toHaveBeenCalledWith('group-1');
    expect(Toast.show).toHaveBeenCalledWith({
      type: 'success',
      text1: 'Pronto!',
      text2: 'Você saiu do grupo Hermanas.',
    });
  });

  test('ignores repeated presses while the request is pending', async () => {
    mockLeaveGroup.mockReturnValue(new Promise(() => undefined));
    const { getByTestId, findByTestId } = await Promise.resolve(render(<LeaveGroupController />));

    fireEvent.press(getByTestId('leave-group-confirm'));
    await findByTestId('leave-group-loading');
    // A disabled Pressable lets the press bubble up to the dialog, which stops propagation.
    const event = { stopPropagation: jest.fn() };
    fireEvent.press(getByTestId('leave-group-confirm'), event);
    fireEvent.press(getByTestId('leave-group-cancel'), event);

    expect(mockLeaveGroup).toHaveBeenCalledTimes(1);
    expect(back).not.toHaveBeenCalled();
  });

  test('shows an error and stays on the dialog when leaving fails', async () => {
    mockLeaveGroup.mockRejectedValue(new ApiError('Usuário não pertence ao grupo', 400));
    const { getByTestId, findByText } = await Promise.resolve(render(<LeaveGroupController />));

    fireEvent.press(getByTestId('leave-group-confirm'));

    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível sair do grupo. Tente novamente.',
      });
    });
    expect(dismissTo).not.toHaveBeenCalled();
    expect(await findByText('Sair do grupo')).toBeTruthy();
  });
});
