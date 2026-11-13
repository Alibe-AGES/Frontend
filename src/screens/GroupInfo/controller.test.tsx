import { getGroupCalendar } from '@/server/calendar';
import {
  getGroup,
  getGroupInviteLink,
  getMe,
  removeGroupMember,
  updateGroup,
  type GroupMember,
} from '@/server/groups';
import { act, render, waitFor } from '@testing-library/react-native';
import { createURL } from 'expo-linking';
import Toast from 'react-native-toast-message';
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
  removeGroupMember: jest.fn(),
  updateGroup: jest.fn(),
}));

const mockPickImage = jest.fn();
let mockOnPhotoPicked: ((photo: { uri: string }) => void) | undefined;

jest.mock('@/components/PhotoPicker/controllers/useDefaultPhotoPickerController', () => ({
  useDefaultPhotoPickerController: (params: {
    onUploadSuccess?: (photo: { uri: string }) => void;
  }) => {
    mockOnPhotoPicked = params.onUploadSuccess;
    return { photoUri: null, isLoading: false, pickImage: mockPickImage };
  },
}));

jest.mock('react-native-toast-message', () => ({ show: jest.fn() }));

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
const mockUpdateGroup = updateGroup as jest.MockedFunction<typeof updateGroup>;
const mockRemoveGroupMember = removeGroupMember as jest.MockedFunction<typeof removeGroupMember>;
const mockCreateURL = createURL as jest.MockedFunction<typeof createURL>;

async function renderController() {
  render(<GroupInfoController />);
  await waitFor(() => {
    expect(mockGroupInfoProps.isLoading).toBe(false);
  });
}

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
      ownerId: 'user-1',
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
    await renderController();

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
    await renderController();
    const onLeaveGroup = mockGroupInfoProps.onLeaveGroup as () => void;

    onLeaveGroup();

    expect(push).toHaveBeenCalledWith({
      pathname: '/group/[id]/leave',
      params: { id: 'group-1' },
    });
  });

  test('refreshes the invite when requested', async () => {
    await renderController();
    mockGetGroupInviteLink.mockResolvedValueOnce({ token: 'new-token', expiresAt: '2027-01-01' });
    mockCreateURL.mockReturnValueOnce('alibe://groups?invite=new-token');

    const onRefreshInvite = mockGroupInfoProps.onRefreshInvite as () => void;
    await act(async () => {
      onRefreshInvite();
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(mockGetGroupInviteLink).toHaveBeenCalledTimes(2);
      expect(mockGroupInfoProps.inviteUrl).toBe('alibe://groups?invite=new-token');
    });
  });

  test('lets only the owner edit the group', async () => {
    await renderController();

    await waitFor(() => {
      expect(mockGroupInfoProps.canEdit).toBe(true);
    });

    mockGetMe.mockResolvedValueOnce({ id: 'user-2', name: 'Bia', profilePic: null });
    await renderController();

    await waitFor(() => {
      expect(mockGroupInfoProps.canEdit).toBe(false);
    });
  });

  test('renames the group with the trimmed name', async () => {
    mockUpdateGroup.mockResolvedValue({
      id: 'group-1',
      name: 'Primas',
      profilePic: null,
      createdAt: '2026-01-01T00:00:00.000Z',
    });
    await renderController();
    const onRenameGroup = mockGroupInfoProps.onRenameGroup as (
      name: string
    ) => Promise<string | null>;

    let result: string | null = 'unset';
    await act(async () => {
      result = await onRenameGroup('  Primas  ');
    });

    expect(result).toBeNull();
    expect(mockUpdateGroup).toHaveBeenCalledWith('group-1', { name: 'Primas' });
    expect(mockGroupInfoProps.group).toMatchObject({ name: 'Primas' });
  });

  test('rejects a name that is too short without calling the API', async () => {
    await renderController();
    const onRenameGroup = mockGroupInfoProps.onRenameGroup as (
      name: string
    ) => Promise<string | null>;

    let result: string | null = null;
    await act(async () => {
      result = await onRenameGroup(' a ');
    });

    expect(result).toBe('O nome deve conter entre 2 e 100 caracteres.');
    expect(mockUpdateGroup).not.toHaveBeenCalled();
  });

  test('uploads the picked image and shows it right away', async () => {
    mockUpdateGroup.mockResolvedValue({
      id: 'group-1',
      name: 'Hermanas',
      profilePic: 'https://api.alibe.app/groups/group-1/profile-picture',
      createdAt: '2026-01-01T00:00:00.000Z',
    });
    await renderController();

    const onEditImage = mockGroupInfoProps.onEditImage as () => void;
    onEditImage();
    expect(mockPickImage).toHaveBeenCalled();

    const photo = { uri: 'file:///picked.jpg', fileName: 'picked.jpg', mimeType: 'image/jpeg' };
    await act(async () => {
      mockOnPhotoPicked?.(photo);
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(mockUpdateGroup).toHaveBeenCalledWith('group-1', { image: photo });
      expect(mockGroupInfoProps.group).toMatchObject({ profilePic: 'file:///picked.jpg' });
    });
  });
  describe('removing a member', () => {
    const bia: GroupMember = { id: 'user-2', name: 'Bia', profilePic: null };

    beforeEach(() => {
      mockGetGroup.mockResolvedValue({
        id: 'group-1',
        name: 'Hermanas',
        profilePic: null,
        createdAt: '2026-01-01T00:00:00.000Z',
        ownerId: 'user-1',
        participants: [{ id: 'user-1', name: 'Ana', profilePic: null }, bia],
      });
      jest.spyOn(console, 'error').mockImplementation(() => undefined);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    test('removes the member and drops them from the screen', async () => {
      mockRemoveGroupMember.mockResolvedValue(undefined);
      await renderController();
      const onRemoveMember = mockGroupInfoProps.onRemoveMember as (
        member: GroupMember
      ) => Promise<boolean>;

      let removed = false;
      await act(async () => {
        removed = await onRemoveMember(bia);
      });

      expect(removed).toBe(true);
      expect(mockRemoveGroupMember).toHaveBeenCalledWith('group-1', 'user-2');
      expect(mockGroupInfoProps.group).toMatchObject({
        participants: [{ id: 'user-1', name: 'Ana', profilePic: null }],
      });
      expect(Toast.show).not.toHaveBeenCalled();
    });

    test('shows the success toast once the screen reports the removal', async () => {
      await renderController();
      const onMemberRemoved = mockGroupInfoProps.onMemberRemoved as (member: GroupMember) => void;

      onMemberRemoved(bia);

      expect(Toast.show).toHaveBeenCalledWith({
        type: 'success',
        text1: 'Sucesso!',
        text2: 'Bia foi removido(a) do grupo.',
      });
    });

    test('keeps the member and shows an error when the request fails', async () => {
      mockRemoveGroupMember.mockRejectedValue(new Error('Forbidden'));
      await renderController();
      const onRemoveMember = mockGroupInfoProps.onRemoveMember as (
        member: GroupMember
      ) => Promise<boolean>;

      let removed = true;
      await act(async () => {
        removed = await onRemoveMember(bia);
      });

      expect(removed).toBe(false);
      expect(
        (mockGroupInfoProps.group as { participants: GroupMember[] }).participants
      ).toHaveLength(2);
      expect(Toast.show).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }));
    });
  });
});
