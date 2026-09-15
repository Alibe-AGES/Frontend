import { fireEvent, render, waitFor } from '@testing-library/react-native';
import * as Clipboard from 'expo-clipboard';

import { InviteGroupScreen } from './InviteGroupScreen';

const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn(() => Promise.resolve(true)),
}));

const mockSetStringAsync = (Clipboard as Record<string, unknown>).setStringAsync as jest.Mock;

const PLACEHOLDER_LINK = 'https://alibe.app/invite/7f3a9c21';

describe('<InviteGroupScreen />', () => {
  beforeEach(() => {
    mockReplace.mockClear();
    mockSetStringAsync.mockClear();
    mockSetStringAsync.mockResolvedValue(true);
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

    expect(getByTestId('alibe-invite-link-url')).toHaveTextContent(PLACEHOLDER_LINK);
  });

  test('copies the invite link that is on screen', async () => {
    const { getByTestId } = await render(<InviteGroupScreen />);

    await fireEvent.press(getByTestId('alibe-invite-link'));

    await waitFor(() => {
      expect(mockSetStringAsync).toHaveBeenCalledWith(PLACEHOLDER_LINK);
    });
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
