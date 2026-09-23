import { fireEvent, render } from '@testing-library/react-native';
import { GroupInfoScreen } from './index';

const group = {
  id: 'group-1',
  name: 'Hermanas',
  profilePic: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  participants: [
    { id: 'user-1', name: 'Ana', profilePic: null },
    { id: 'user-2', name: 'Bia', profilePic: null },
  ],
};

describe('GroupInfoScreen', () => {
  test('renders members, availability dates, and invite link', async () => {
    const { getByText, getByTestId } = await render(
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
    );

    expect(getByText('Hermanas')).toBeTruthy();
    expect(getByText('02/09 · 12/09')).toBeTruthy();
    expect(getByText('(você)')).toBeTruthy();
    expect(getByTestId('group-info-member-user-2')).toBeTruthy();
  });

  test('shows loading and empty states, then invokes leave', async () => {
    const onLeaveGroup = jest.fn();
    const { getByText, getByTestId } = await render(
      <GroupInfoScreen
        group={null}
        availabilities={[]}
        inviteUrl={null}
        isLoading
        onLeaveGroup={onLeaveGroup}
        onRefreshInvite={jest.fn()}
      />
    );

    expect(getByText('Carregando…')).toBeTruthy();
    await fireEvent.press(getByTestId('group-info-leave'));

    expect(onLeaveGroup).toHaveBeenCalledTimes(1);
  });

  test('shows the empty member state after loading', async () => {
    const { getByText } = await render(
      <GroupInfoScreen
        group={null}
        availabilities={[]}
        inviteUrl={null}
        isLoading={false}
        onLeaveGroup={jest.fn()}
        onRefreshInvite={jest.fn()}
      />
    );

    expect(getByText('Nenhum membro encontrado neste grupo.')).toBeTruthy();
  });
});
