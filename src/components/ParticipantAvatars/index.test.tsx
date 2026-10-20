import { render } from '@testing-library/react-native';
import { Participant, ParticipantAvatars } from './index';

const participants = [
  { id: 'user-2', name: 'Katarina Souza', profilePic: 'https://cdn.alibe.com/kata.jpg' },
  { id: 'user-1', name: 'Luiza', profilePic: null },
  { id: 'user-3', name: 'Manu', profilePic: null },
];

describe('<ParticipantAvatars />', () => {
  test('labels the current user as "Eu" and lists them first', async () => {
    const { getAllByText, getByText } = await render(
      <ParticipantAvatars
        participants={participants}
        currentUserId="user-1"
      />
    );

    const labels = getAllByText(/^(Eu|Katarina|Manu)$/).map(
      (node) => node.props.children as string
    );
    expect(labels).toEqual(['Eu', 'Katarina', 'Manu']);
    expect(getByText('Eu')).toBeTruthy();
  });

  test('shows the photo when available and a placeholder otherwise', async () => {
    const { getByTestId, getByLabelText } = await render(
      <ParticipantAvatars participants={participants} />
    );

    expect(getByLabelText('Foto de Katarina Souza')).toBeTruthy();
    expect(getByTestId('alibe-participant-avatars-user-1-placeholder')).toBeTruthy();
  });

  test('shows the empty message when there are no participants', async () => {
    const { getByText } = await render(
      <ParticipantAvatars
        participants={[]}
        emptyMessage="Carregando…"
      />
    );

    expect(getByText('Carregando…')).toBeTruthy();
  });

  test('renders presence badges correctly for yes and no answers, and none for pending', async () => {
    const participantsWithAnswers: Participant[] = [
      {
        id: 'user-1',
        name: 'Luiza',
        profilePic: null,
        answer: 'yes',
      },
      {
        id: 'user-2',
        name: 'Katarina Souza',
        profilePic: 'https://cdn.alibe.com/kata.jpg',
        answer: 'no',
      },
      {
        id: 'user-3',
        name: 'Manu',
        profilePic: null,
        answer: 'pending',
      },
    ];

    const { getByTestId, queryByTestId, getByLabelText } = await render(
      <ParticipantAvatars participants={participantsWithAnswers} />
    );

    expect(getByTestId('alibe-participant-avatars-user-1-badge-yes')).toBeTruthy();
    expect(getByLabelText('Presença confirmada')).toBeTruthy();

    expect(getByTestId('alibe-participant-avatars-user-2-badge-no')).toBeTruthy();
    expect(getByLabelText('Não vai participar')).toBeTruthy();

    expect(queryByTestId('alibe-participant-avatars-user-3-badge-yes')).toBeNull();
    expect(queryByTestId('alibe-participant-avatars-user-3-badge-no')).toBeNull();
  });
});
