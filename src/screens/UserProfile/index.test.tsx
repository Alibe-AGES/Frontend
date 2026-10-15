import { render } from '@testing-library/react-native';
import { UserProfileScreen, UserProfileScreenProps } from './index';

jest.mock('../../../src/hooks/useUserAvatarSource', () => ({
  useUserAvatarSource: jest.fn(() => null),
}));

jest.mock('@/components/BackButton', () => {
  const RN = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    BackButton: () => <RN.View testID="mock-back-button" />,
  };
});

jest.mock('@/components/NavigationBar', () => {
  const RN = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    NavigationBar: () => <RN.View testID="mock-navigation-bar" />,
  };
});

jest.mock('@expo/vector-icons', () => {
  const RN = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    Ionicons: () => <RN.View testID="mock-ionicons" />,
  };
});

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  }),
}));

describe('UserProfileScreen', () => {
  const defaultProps: UserProfileScreenProps = {
    userId: 'user-123',
    groupId: 'group-456',
    isOwnProfile: true,
    profile: null,
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders error state', async () => {
    const errorProps: UserProfileScreenProps = {
      ...defaultProps,
      error: new Error('Network error'),
    };

    const { getByText } = await render(<UserProfileScreen {...errorProps} />);

    expect(getByText('Não foi possível carregar o perfil.')).toBeTruthy();
  });

  test('renders user profile info and buttons for own profile', async () => {
    const successProps: UserProfileScreenProps = {
      ...defaultProps,
      profile: {
        name: 'Ellen Miranda',
        created_at: '21 de Setembro de 2026',
        completedEventsCount: 5,
        pendingEventsCount: 2,
        photoUri: null,
      },
    };

    const { getByText, getByTestId } = await render(<UserProfileScreen {...successProps} />);

    expect(getByTestId('user-profile-screen-name')).toHaveTextContent('Ellen Miranda');
    expect(getByText('no alibe desde 21 de Setembro de 2026')).toBeTruthy();

    expect(getByText('Editar perfil')).toBeTruthy();
    expect(getByText('Senha')).toBeTruthy();
  });

  test('does not render edit/password buttons when it is not the user own profile', async () => {
    const thirdPartyProfileProps: UserProfileScreenProps = {
      ...defaultProps,
      isOwnProfile: false,
      profile: {
        name: 'Carlos Silva',
        created_at: '10 de Janeiro de 2026',
        completedEventsCount: 1,
        pendingEventsCount: 0,
        photoUri: null,
      },
    };

    const { queryByText, getByTestId } = await render(
      <UserProfileScreen {...thirdPartyProfileProps} />
    );

    expect(getByTestId('user-profile-screen-name')).toHaveTextContent('Carlos Silva');
    expect(queryByText('Editar perfil')).toBeNull();
    expect(queryByText('Senha')).toBeNull();
  });
});
