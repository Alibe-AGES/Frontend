import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';

import { getGroupInviteLink } from '@/server/groups';
import { InviteGroupScreen } from '.';

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

jest.mock('@/components/HandsHiFive', () => {
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    HandsHiFive: ({ playKey }: { playKey?: number }) => (
      <View
        testID="hands-hi-five"
        accessibilityValue={{ now: playKey }}
      />
    ),
  };
});

const mockSetStringAsync = (Clipboard as Record<string, unknown>).setStringAsync as jest.Mock;
const mockCreateURL = Linking.createURL as jest.Mock;
const mockGetGroupInviteLink = getGroupInviteLink as jest.Mock;
type InviteResponse = Awaited<ReturnType<typeof getGroupInviteLink>>;
let resolveInviteRequest: (response: InviteResponse) => void;
let rejectInviteRequest: (error: Error) => void;

const inviteResponse: InviteResponse = {
  token: TOKEN,
  expiresAt: '2099-12-31T23:59:59.000Z',
};

async function renderInviteGroup({ shouldFail = false }: { shouldFail?: boolean } = {}) {
  const result = render(<InviteGroupScreen />);
  await waitFor(() => {
    expect(mockGetGroupInviteLink).toHaveBeenCalledWith(mockGroupId);
  });
  await act(async () => {
    if (shouldFail) {
      rejectInviteRequest(new Error('request failed'));
    } else {
      resolveInviteRequest(inviteResponse);
    }
    await Promise.resolve();
  });
  return result;
}

describe('<InviteGroupScreen />', () => {
  beforeEach(() => {
    mockReplace.mockClear();
    mockSetStringAsync.mockClear();
    mockSetStringAsync.mockResolvedValue(true);
    mockCreateURL.mockClear();
    mockCreateURL.mockReturnValue(mockInviteUrl);
    mockGetGroupInviteLink.mockReset();
    mockGetGroupInviteLink.mockImplementation(
      () =>
        new Promise((resolve, reject) => {
          resolveInviteRequest = resolve;
          rejectInviteRequest = reject;
        })
    );
  });

  test('renders the title', async () => {
    const { getByText } = await renderInviteGroup();

    expect(getByText(/Tudo\s+pronto!/)).toBeTruthy();
  });

  test('explains what to do with the link', async () => {
    const { getByText } = await renderInviteGroup();

    expect(
      getByText(/Agora é só compartilhar\s+o link para convidar seus\s+amigos para o grupo\./)
    ).toBeTruthy();
  });

  test('shows the invite link ready to be shared', async () => {
    const { getByTestId } = await renderInviteGroup();

    await waitFor(() => {
      expect(getByTestId('alibe-invite-link-url')).toHaveTextContent(mockInviteUrl);
    });
    expect(mockGetGroupInviteLink).toHaveBeenCalledWith(mockGroupId);
    expect(mockCreateURL).toHaveBeenCalledWith('/groups', {
      queryParams: { invite: TOKEN },
    });
  });

  test('copies the invite link that is on screen', async () => {
    const { getByTestId } = await renderInviteGroup();

    await waitFor(() => {
      expect(getByTestId('alibe-invite-link-url')).toHaveTextContent(mockInviteUrl);
    });
    await act(async () => {
      fireEvent.press(getByTestId('alibe-invite-link'));
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(mockSetStringAsync).toHaveBeenCalledWith(mockInviteUrl);
    });
  });

  test('plays the hi-five on every copy, not when the screen opens', async () => {
    const { getByTestId } = await renderInviteGroup();
    const playKey = () =>
      (getByTestId('hands-hi-five').props as { accessibilityValue: { now: number } })
        .accessibilityValue.now;

    expect(playKey()).toBe(0);

    for (const expected of [1, 2]) {
      await act(async () => {
        fireEvent.press(getByTestId('alibe-invite-link'));
        await Promise.resolve();
      });
      await waitFor(() => {
        expect(playKey()).toBe(expected);
      });
    }
  });

  test('shows a retry action when loading the invite fails', async () => {
    const { getByText } = await renderInviteGroup({ shouldFail: true });

    await waitFor(() => {
      expect(getByText('Não foi possível gerar o link de convite.')).toBeTruthy();
    });
    expect(getByText('Tentar novamente')).toBeTruthy();
  });

  test('renders the hi-five hands', async () => {
    const { getByTestId } = await renderInviteGroup();

    expect(getByTestId('hands-hi-five')).toBeTruthy();
  });

  test('renders the continue button', async () => {
    const { getByText } = await renderInviteGroup();

    expect(getByText('Continuar')).toBeTruthy();
  });

  test('leaves the creation flow when the user continues', async () => {
    const { getByText } = await Promise.resolve(render(<InviteGroupScreen />));

    fireEvent.press(getByText('Continuar'));
    await Promise.resolve();

    expect(mockReplace).toHaveBeenCalledWith('/groups');
  });
});
