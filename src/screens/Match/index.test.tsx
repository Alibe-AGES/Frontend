import type { GroupMember } from '@/server/groups';
import { fireEvent, render } from '@testing-library/react-native';
import { MatchScreen } from './index';

const participants: GroupMember[] = [
  { id: 'user-1', name: 'Luiza Costa', profilePic: null },
  { id: 'user-2', name: 'Kata Silva', profilePic: null },
  { id: 'user-3', name: 'Manu Reis', profilePic: null },
  { id: 'user-4', name: 'May Lima', profilePic: null },
];

describe('<MatchScreen />', () => {
  test('shows the match message, group members, and event action', async () => {
    const onConfirm = jest.fn();
    const { getByText, getByTestId } = await render(
      <MatchScreen
        participants={participants}
        currentUserId="user-1"
        isLoadingParticipants={false}
        isConfirmDisabled={false}
        onConfirm={onConfirm}
      />
    );

    expect(getByText('Vocês tem um álibi!')).toBeTruthy();
    expect(getByText('Eu')).toBeTruthy();
    expect(getByText('Kata')).toBeTruthy();
    expect(getByText('Manu')).toBeTruthy();
    expect(getByText('May')).toBeTruthy();
    await fireEvent.press(getByTestId('match-create-event'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  test('shows a loading indicator while group members are loading', async () => {
    const { getByTestId } = await render(
      <MatchScreen
        participants={[]}
        isLoadingParticipants
        isConfirmDisabled
        onConfirm={jest.fn()}
      />
    );

    expect(getByTestId('match-participants-loading')).toBeTruthy();
    expect(getByTestId('match-create-event').props.accessibilityState).toMatchObject({
      disabled: true,
    });
  });
});
