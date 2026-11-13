import type { GroupMember } from '@/server/groups';
import { fireEvent, render, within } from '@testing-library/react-native';
import { MatchScreen } from './index';

jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: jest.fn(),
    canGoBack: () => true,
  }),
}));

const participants: GroupMember[] = [
  { id: 'user-1', name: 'Luiza Costa', profilePic: null },
  { id: 'user-2', name: 'Kata Silva', profilePic: null },
  { id: 'user-3', name: 'Manu Reis', profilePic: null },
  { id: 'user-4', name: 'May Lima', profilePic: null },
];

describe('<MatchScreen />', () => {
  test('shows the match message, group members, and event action', async () => {
    const onConfirm = jest.fn();
    const { getByText, getByTestId, queryByLabelText } = await Promise.resolve(
      render(
        <MatchScreen
          participants={participants}
          currentUserId="user-1"
          isLoadingParticipants={false}
          isConfirmDisabled={false}
          onConfirm={onConfirm}
        />
      )
    );

    expect(getByText('Vocês tem um álibi!')).toBeTruthy();
    expect(queryByLabelText('Voltar para o grupo')).toBeNull();
    expect(getByText('Eu')).toBeTruthy();
    expect(getByText('Kata')).toBeTruthy();
    expect(getByText('Manu')).toBeTruthy();
    expect(getByText('May')).toBeTruthy();
    fireEvent.press(getByTestId('match-create-event'));
    await Promise.resolve();
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  test('shows participant photos and a fallback for missing photos', async () => {
    const { getByLabelText, getByTestId } = await Promise.resolve(
      render(
        <MatchScreen
          participants={[
            { ...participants[0], profilePic: 'https://example.com/luiza.jpg' },
            participants[1],
          ]}
          isLoadingParticipants={false}
          isConfirmDisabled={false}
          onConfirm={jest.fn()}
        />
      )
    );

    expect(getByLabelText('Foto de Luiza Costa')).toBeTruthy();
    expect(getByTestId('match-participant-user-2-avatar-placeholder')).toBeTruthy();
  });

  test('shows a loading indicator while group members are loading', async () => {
    const { getByTestId } = await Promise.resolve(
      render(
        <MatchScreen
          participants={[]}
          isLoadingParticipants
          isConfirmDisabled
          onConfirm={jest.fn()}
        />
      )
    );

    expect(getByTestId('match-participants-loading')).toBeTruthy();
    expect(getByTestId('match-create-event').props.accessibilityState).toMatchObject({
      disabled: true,
    });
  });

  test('keeps a large group scrollable and the event action outside the scrolling content', async () => {
    const manyParticipants = Array.from({ length: 12 }, (_, index) => ({
      id: `participant-${String(index)}`,
      name: `Pessoa${String(index)} Sobrenome`,
      profilePic: null,
    }));
    const onConfirm = jest.fn();
    const { getByTestId, getByText } = await Promise.resolve(
      render(
        <MatchScreen
          participants={manyParticipants}
          currentUserId="participant-11"
          isLoadingParticipants={false}
          isConfirmDisabled={false}
          onConfirm={onConfirm}
        />
      )
    );

    const scroll = getByTestId('match-screen');
    const grid = getByTestId('match-participants');
    const renderedParticipants = within(grid).getAllByTestId(/^match-participant-participant-\d+$/);
    expect(scroll.props.keyboardShouldPersistTaps).toBe('handled');
    expect(scroll).toContainElement(grid);
    expect(renderedParticipants).toHaveLength(12);
    expect(renderedParticipants[0].props.testID).toBe('match-participant-participant-11');
    expect(getByText('Pessoa10')).toBeTruthy();
    expect(scroll).not.toContainElement(getByTestId('match-create-event'));
    fireEvent.press(getByTestId('match-create-event'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
