import { fireEvent, render } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import CreateProfileController from './controller';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe('CreateProfileController', () => {
  const replace = jest.fn();

  beforeEach(() => {
    mockUseRouter.mockReturnValue({ replace } as unknown as ReturnType<typeof useRouter>);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('goes to the groups home after the profile is filled', async () => {
    const { getByPlaceholderText, getByTestId } = await render(<CreateProfileController />);

    await fireEvent.changeText(getByPlaceholderText('Nome de usuário'), 'Rica');
    await fireEvent.press(getByTestId('create-profile-continue'));

    expect(replace).toHaveBeenCalledWith('/groups');
  });
});
