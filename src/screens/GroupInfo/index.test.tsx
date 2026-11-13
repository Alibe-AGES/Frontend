import { act, fireEvent, render } from '@testing-library/react-native';
import { GroupInfoScreen } from './index';

const group = {
  id: 'group-1',
  name: 'Hermanas',
  profilePic: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  ownerId: 'user-1',
  participants: [
    {
      id: 'user-1',
      name: 'Ana',
      profilePic: 'https://api.alibe.test/users/user-1/profile-picture',
    },
    { id: 'user-2', name: 'Bia', profilePic: null },
  ],
};

describe('GroupInfoScreen', () => {
  test('renders members, availability dates, and invite link', async () => {
    const { getByText, getByTestId } = await Promise.resolve(
      render(
        <GroupInfoScreen
          group={group}
          availabilities={[{ memberId: 'user-1', dates: ['2026-09-02', '2026-09-12'] }]}
          currentUserId="user-1"
          inviteUrl="https://alibe.test/invite"
          inviteExpiresAt="2026-12-31T23:59:59.000Z"
          isLoading={false}
          onLeaveGroup={jest.fn()}
          onRefreshInvite={jest.fn()}
        />
      )
    );

    expect(getByText('Hermanas')).toBeTruthy();
    expect(getByText('02/09 · 12/09')).toBeTruthy();
    expect(getByText('(você)')).toBeTruthy();
    expect(getByTestId('group-info-member-user-1-avatar-photo')).toBeTruthy();
    expect(getByTestId('group-info-member-user-2-avatar-placeholder')).toBeTruthy();
    expect(getByTestId('group-info-member-user-2')).toBeTruthy();
  });

  test('shows loading and empty states, then invokes leave', async () => {
    const onLeaveGroup = jest.fn();
    const { getByText, getByTestId } = await Promise.resolve(
      render(
        <GroupInfoScreen
          group={null}
          availabilities={[]}
          inviteUrl={null}
          isLoading
          onLeaveGroup={onLeaveGroup}
          onRefreshInvite={jest.fn()}
        />
      )
    );

    expect(getByText('Carregando…')).toBeTruthy();
    fireEvent.press(getByTestId('group-info-leave'));
    await Promise.resolve();

    expect(onLeaveGroup).toHaveBeenCalledTimes(1);
  });

  test('shows the empty member state after loading', async () => {
    const { getByText } = await Promise.resolve(
      render(
        <GroupInfoScreen
          group={null}
          availabilities={[]}
          inviteUrl={null}
          isLoading={false}
          onLeaveGroup={jest.fn()}
          onRefreshInvite={jest.fn()}
        />
      )
    );

    expect(getByText('Nenhum membro encontrado neste grupo.')).toBeTruthy();
  });
  describe('removing members', () => {
    const renderOwnerScreen = (
      onRemoveMember: jest.Mock,
      canEdit = true,
      onMemberRemoved: jest.Mock = jest.fn()
    ) =>
      Promise.resolve(
        render(
          <GroupInfoScreen
            group={group}
            availabilities={[]}
            currentUserId="user-1"
            inviteUrl={null}
            isLoading={false}
            canEdit={canEdit}
            onRemoveMember={onRemoveMember}
            onMemberRemoved={onMemberRemoved}
            onLeaveGroup={jest.fn()}
            onRefreshInvite={jest.fn()}
          />
        )
      );

    test('shows the remove button only to the owner and never for themselves', async () => {
      const { queryByTestId, rerender } = await renderOwnerScreen(jest.fn());

      expect(queryByTestId('group-info-member-user-2-remove')).toBeTruthy();
      expect(queryByTestId('group-info-member-user-1-remove')).toBeNull();

      rerender(
        <GroupInfoScreen
          group={group}
          availabilities={[]}
          currentUserId="user-2"
          inviteUrl={null}
          isLoading={false}
          onRemoveMember={jest.fn()}
          onLeaveGroup={jest.fn()}
          onRefreshInvite={jest.fn()}
        />
      );

      expect(queryByTestId('group-info-member-user-1-remove')).toBeNull();
    });

    test('asks for confirmation and removes the member', async () => {
      const onRemoveMember = jest.fn().mockResolvedValue(true);
      const onMemberRemoved = jest.fn();
      const { getByTestId, getByText, queryByText } = await renderOwnerScreen(
        onRemoveMember,
        true,
        onMemberRemoved
      );

      fireEvent.press(getByTestId('group-info-member-user-2-remove'));
      expect(getByText('Remover Bia do grupo?')).toBeTruthy();
      expect(onRemoveMember).not.toHaveBeenCalled();

      await act(async () => {
        fireEvent.press(getByTestId('group-info-remove-confirm'));
        await Promise.resolve();
      });

      expect(queryByText('Remover Bia do grupo?')).toBeNull();
      expect(onRemoveMember).toHaveBeenCalledWith(group.participants[1]);
      expect(onMemberRemoved).toHaveBeenCalledTimes(1);
      expect(onMemberRemoved).toHaveBeenCalledWith(group.participants[1]);
    });

    test('closes the confirmation without removing on cancel', async () => {
      const onRemoveMember = jest.fn();
      const { getByTestId, queryByText } = await renderOwnerScreen(onRemoveMember);

      fireEvent.press(getByTestId('group-info-member-user-2-remove'));
      fireEvent.press(getByTestId('group-info-remove-cancel'));

      expect(queryByText('Remover Bia do grupo?')).toBeNull();
      expect(onRemoveMember).not.toHaveBeenCalled();
    });

    test('keeps the confirmation open when removing fails', async () => {
      const onRemoveMember = jest.fn().mockResolvedValue(false);
      const onMemberRemoved = jest.fn();
      const { getByTestId, findByText } = await renderOwnerScreen(
        onRemoveMember,
        true,
        onMemberRemoved
      );

      fireEvent.press(getByTestId('group-info-member-user-2-remove'));
      fireEvent.press(getByTestId('group-info-remove-confirm'));

      expect(await findByText('Remover')).toBeTruthy();
      expect(await findByText('Remover Bia do grupo?')).toBeTruthy();
      expect(onMemberRemoved).not.toHaveBeenCalled();
    });
  });
});
