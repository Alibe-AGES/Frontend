import { fireEvent, render } from '@testing-library/react-native';
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

const mockUseLocalSearchParams = useLocalSearchParams as jest.MockedFunction<
  typeof useLocalSearchParams
>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe('LeaveGroupController', () => {
  const back = jest.fn();
  const replace = jest.fn();
  const canGoBack = jest.fn();

  beforeEach(() => {
    mockUseLocalSearchParams.mockReturnValue({ id: 'group-1' });
    mockUseRouter.mockReturnValue({ back, replace, canGoBack } as unknown as ReturnType<
      typeof useRouter
    >);
    canGoBack.mockReturnValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('goes back when navigation history is available', async () => {
    const { getByTestId } = await render(<LeaveGroupController />);

    await fireEvent.press(getByTestId('leave-group-cancel'));

    expect(back).toHaveBeenCalledTimes(1);
    expect(replace).not.toHaveBeenCalled();
  });

  test('replaces with the group route when there is no history', async () => {
    canGoBack.mockReturnValue(false);
    const { getByTestId } = await render(<LeaveGroupController />);

    await fireEvent.press(getByTestId('leave-group-cancel'));

    expect(replace).toHaveBeenCalledWith({ pathname: '/group/[id]', params: { id: 'group-1' } });
  });

  test('shows the not implemented message when confirming', async () => {
    const { getByTestId } = await render(<LeaveGroupController />);

    await fireEvent.press(getByTestId('leave-group-confirm'));

    expect(Toast.show).toHaveBeenCalledWith({
      type: 'info',
      text1: 'Not yet implemented',
      text2: 'A funcionalidade de sair do grupo ainda não está disponível.',
    });
  });
});
