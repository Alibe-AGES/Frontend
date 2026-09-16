import { fireEvent, render, waitFor } from '@testing-library/react-native';
import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';

import { getGroupInviteLink } from '@/server/groups';
import { InviteGroupScreen } from './InviteGroupScreen';

const mockReplace = jest.fn();
const mockGroupId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const TOKEN = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const mockInviteUrl = `exp://192.168.0.10:8081/--/invite?token=${TOKEN}`;

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({
    groupId: mockGroupId,
  }),
  useRouter: () => ({ replace: mockReplace }),
}));

jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn(() => Promise.resolve(true)),
}));

jest.mock('expo-linking', () => ({
  createURL: jest.fn(() => mockInviteUrl),
}));

jest.mock('@/server/groups', () => ({
  getGroupInviteLink: jest.fn(),
}));

const mockSetStringAsync = (Clipboard as Record<string, unknown>).setStringAsync as jest.Mock;
const mockCreateURL = Linking.createURL as jest.Mock;
const mockGetGroupInviteLink = getGroupInviteLink as jest.Mock;

describe('<InviteGroupScreen />', () => {
  beforeEach(() => {
    mockReplace.mockClear();
    mockSetStringAsync.mockClear();
    mockSetStringAsync.mockResolvedValue(true);
    mockCreateURL.mockClear();
    mockCreateURL.mockReturnValue(mockInviteUrl);
    mockGetGroupInviteLink.mockReset();
    mockGetGroupInviteLink.mockResolvedValue({
      token: TOKEN,
      expiresAt: '2099-12-31T23:59:59.000Z',
    });
  });

  test('renders the title', async () => {
    const { getByText } = await render(<InviteGroupScreen />);

    expect(getByText(/Tudo\s+pronto!/)).toBeTruthy();
  });

  test('explains what to do with the link', async () => {
    const { getByText } = await render(<InviteGroupScreen />);

    expect(
      getByText('Agora é só compartilhar o link para convidar seus amigos para o grupo.')
    ).toBeTruthy();
  });

  test('shows the invite link ready to be shared', async () => {
    const { getByTestId } = await render(<InviteGroupScreen />);

    await waitFor(() => {
      expect(getByTestId('alibe-invite-link-url')).toHaveTextContent(mockInviteUrl);
    });
    expect(mockGetGroupInviteLink).toHaveBeenCalledWith(mockGroupId);
    expect(mockCreateURL).toHaveBeenCalledWith('/groups', {
      queryParams: { invite: TOKEN },
    });
  });

  test('copies the invite link that is on screen', async () => {
    const { getByTestId } = await render(<InviteGroupScreen />);

    await waitFor(() => {
      expect(getByTestId('alibe-invite-link-url')).toHaveTextContent(mockInviteUrl);
    });
    await fireEvent.press(getByTestId('alibe-invite-link'));

    await waitFor(() => {
      expect(mockSetStringAsync).toHaveBeenCalledWith(mockInviteUrl);
    });
  });

  test('shows a retry action when loading the invite fails', async () => {
    mockGetGroupInviteLink.mockRejectedValueOnce(new Error('request failed'));
    const { getByText } = await render(<InviteGroupScreen />);

    await waitFor(() => {
      expect(getByText('Não foi possível gerar o link de convite.')).toBeTruthy();
    });
    expect(getByText('Tentar novamente')).toBeTruthy();
  });

  test('renders the decoration', async () => {
    const { getByTestId } = await render(<InviteGroupScreen />);

    expect(getByTestId('alibe-invite-decoration')).toBeTruthy();
  });

  test('renders the continue button', async () => {
    const { getByText } = await render(<InviteGroupScreen />);

    expect(getByText('Continuar')).toBeTruthy();
  });

  test('leaves the creation flow when the user continues', async () => {
    const { getByText } = await render(<InviteGroupScreen />);

    await fireEvent.press(getByText('Continuar'));

    expect(mockReplace).toHaveBeenCalledWith('/groups');
  });
});
