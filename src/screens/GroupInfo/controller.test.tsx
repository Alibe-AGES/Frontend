import { getGroupCalendar } from '@/server/calendar';
import { getGroup, getGroupInviteLink, getMe } from '@/server/groups';
import { render, waitFor } from '@testing-library/react-native';
import { createURL } from 'expo-linking';
import { useLocalSearchParams, useRouter } from 'expo-router';
import GroupInfoController from './controller';

let mockGroupInfoProps: Record<string, unknown> = {};

jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock('expo-linking', () => ({
  createURL: jest.fn(),
}));

jest.mock('@/server/calendar', () => ({
  getGroupCalendar: jest.fn(),
}));

jest.mock('@/server/groups', () => ({
  getGroup: jest.fn(),
  getGroupInviteLink: jest.fn(),
  getMe: jest.fn(),
}));

jest.mock('@/screens/GroupInfo', () => ({
  GroupInfoScreen: (props: Record<string, unknown>) => {
    mockGroupInfoProps = props;
    return null;
  },
}));

const mockUseLocalSearchParams = useLocalSearchParams as jest.MockedFunction<
  typeof useLocalSearchParams
>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockGetGroup = getGroup as jest.MockedFunction<typeof getGroup>;
const mockGetGroupCalendar = getGroupCalendar as jest.MockedFunction<typeof getGroupCalendar>;
const mockGetGroupInviteLink = getGroupInviteLink as jest.MockedFunction<typeof getGroupInviteLink>;
const mockGetMe = getMe as jest.MockedFunction<typeof getMe>;
const mockCreateURL = createURL as jest.MockedFunction<typeof createURL>;

describe('GroupInfoController', () => {
  const push = jest.fn();

  beforeEach(() => {
    mockUseLocalSearchParams.mockReturnValue({ id: 'group-1' });
    mockUseRouter.mockReturnValue({ push } as unknown as ReturnType<typeof useRouter>);
    mockGetGroup.mockResolvedValue({
      id: 'group-1',
      name: 'Hermanas',
      profilePic: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      participants: [{ id: 'user-1', name: 'Ana', profilePic: null }],
    });
    mockGetGroupCalendar.mockResolvedValue([
      {
        date: '2026-09-12',
        scheduledEventIds: [],
        proposalIds: [],
        availableUserIds: ['user-1'],
        completedEventIds: [],
        allUsersAvailable: false,
      },
      {
        date: '2026-09-02',
        scheduledEventIds: [],
        proposalIds: [],
        availableUserIds: ['user-1'],
        completedEventIds: [],
        allUsersAvailable: false,
      },
    ]);
    mockGetGroupInviteLink.mockResolvedValue({ token: 'invite-token', expiresAt: '2026-12-31' });
    mockGetMe.mockResolvedValue({ id: 'user-1', name: 'Ana', profilePic: null });
    mockCreateURL.mockReturnValue('alibe://groups?invite=invite-token');
    mockGroupInfoProps = {};
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('loads group data, sorted availabilities, current user, and invite URL', async () => {
    await render(<GroupInfoController />);

    await waitFor(() => {
      expect(mockGroupInfoProps.group).toMatchObject({ id: 'group-1', name: 'Hermanas' });
      expect(mockGroupInfoProps.availabilities).toEqual([
        { memberId: 'user-1', dates: ['2026-09-02', '2026-09-12'] },
      ]);
      expect(mockGroupInfoProps.currentUserId).toBe('user-1');
      expect(mockGroupInfoProps.inviteUrl).toBe('alibe://groups?invite=invite-token');
      expect(mockGroupInfoProps.inviteExpiresAt).toBe('2026-12-31');
      expect(mockGroupInfoProps.isLoading).toBe(false);
    });
  });

  test('navigates to the leave route', async () => {
    await render(<GroupInfoController />);
    const onLeaveGroup = mockGroupInfoProps.onLeaveGroup as () => void;

    onLeaveGroup();

    expect(push).toHaveBeenCalledWith({
      pathname: '/group/[id]/leave',
      params: { id: 'group-1' },
    });
  });

  test('refreshes the invite when requested', async () => {
    await render(<GroupInfoController />);
    mockGetGroupInviteLink.mockResolvedValueOnce({ token: 'new-token', expiresAt: '2027-01-01' });
    mockCreateURL.mockReturnValueOnce('alibe://groups?invite=new-token');

    const onRefreshInvite = mockGroupInfoProps.onRefreshInvite as () => void;
    onRefreshInvite();

    await waitFor(() => {
      expect(mockGetGroupInviteLink).toHaveBeenCalledTimes(2);
      expect(mockGroupInfoProps.inviteUrl).toBe('alibe://groups?invite=new-token');
    });
  });
});
