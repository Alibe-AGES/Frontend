import { fireEvent, render, waitFor } from '@testing-library/react-native';
import * as Clipboard from 'expo-clipboard';

import { InviteLink } from './index';

jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn(() => Promise.resolve(true)),
}));

const INVITE_LINK = 'https://alibe.app/invite/dddddddd-dddd-4ddd-8ddd-dddddddddddd';
const IN_ONE_HOUR = new Date(Date.now() + 60 * 60 * 1000).toISOString();
const ONE_HOUR_AGO = new Date(Date.now() - 60 * 60 * 1000).toISOString();

describe('<InviteLink />', () => {
  beforeEach(() => {
    jest.mocked(Clipboard.setStringAsync).mockClear();
    jest.mocked(Clipboard.setStringAsync).mockResolvedValue(true);
  });

  test('shows the link it receives', async () => {
    const { getByTestId } = await render(<InviteLink link={INVITE_LINK} />);

    expect(getByTestId('alibe-invite-link-url')).toHaveTextContent(INVITE_LINK);
  });

  test('shows a placeholder while no link has arrived', async () => {
    const { getByTestId } = await render(<InviteLink />);

    expect(getByTestId('alibe-invite-link-url')).toHaveTextContent('Gerando link de convite...');
  });

  test('shows the link on a single line truncated at the end', async () => {
    const { getByTestId } = await render(<InviteLink link={INVITE_LINK} />);
    const label = getByTestId('alibe-invite-link-url');

    expect(label.props.numberOfLines).toBe(1);
    expect(label.props.ellipsizeMode).toBe('tail');
  });

  test('copies the whole link and reports it', async () => {
    const onCopy = jest.fn();
    const { getByTestId, getByText } = await render(
      <InviteLink
        link={INVITE_LINK}
        expiresAt={IN_ONE_HOUR}
        onCopy={onCopy}
      />
    );

    await fireEvent.press(getByTestId('alibe-invite-link'));

    await waitFor(() => {
      expect(Clipboard.setStringAsync).toHaveBeenCalledWith(INVITE_LINK);
    });
    expect(onCopy).toHaveBeenCalledWith(INVITE_LINK);
    expect(getByText('Copiado')).toBeTruthy();
  });

  test('is disabled while there is no link', async () => {
    const onCopy = jest.fn();
    const { getByTestId } = await render(<InviteLink onCopy={onCopy} />);

    await fireEvent.press(getByTestId('alibe-invite-link'));

    expect(Clipboard.setStringAsync).not.toHaveBeenCalled();
    expect(onCopy).not.toHaveBeenCalled();
    expect(getByTestId('alibe-invite-link').props.accessibilityState).toMatchObject({
      disabled: true,
    });
  });

  test('respects the disabled prop even with a valid link', async () => {
    const onCopy = jest.fn();
    const { getByTestId } = await render(
      <InviteLink
        link={INVITE_LINK}
        onCopy={onCopy}
        disabled
      />
    );

    await fireEvent.press(getByTestId('alibe-invite-link'));

    expect(Clipboard.setStringAsync).not.toHaveBeenCalled();
    expect(onCopy).not.toHaveBeenCalled();
  });

  test('asks for a new link instead of copying an expired one', async () => {
    const onExpired = jest.fn();
    const onCopy = jest.fn();
    const { getByTestId } = await render(
      <InviteLink
        link={INVITE_LINK}
        expiresAt={ONE_HOUR_AGO}
        onCopy={onCopy}
        onExpired={onExpired}
      />
    );

    await fireEvent.press(getByTestId('alibe-invite-link'));

    expect(onExpired).toHaveBeenCalledTimes(1);
    expect(Clipboard.setStringAsync).not.toHaveBeenCalled();
    expect(onCopy).not.toHaveBeenCalled();
  });

  test('reports a failed copy without marking it as copied', async () => {
    const onCopy = jest.fn();
    const onCopyError = jest.fn();
    const failure = new Error('Write permission denied');
    jest.mocked(Clipboard.setStringAsync).mockRejectedValueOnce(failure);

    const { getByTestId, getByText } = await render(
      <InviteLink
        link={INVITE_LINK}
        onCopy={onCopy}
        onCopyError={onCopyError}
      />
    );

    await fireEvent.press(getByTestId('alibe-invite-link'));

    await waitFor(() => {
      expect(onCopyError).toHaveBeenCalledWith(failure);
    });
    expect(onCopy).not.toHaveBeenCalled();
    expect(getByText('Copiar')).toBeTruthy();
  });

  test('goes back to the copy label when a new link arrives', async () => {
    const { getByTestId, getByText, rerender } = await render(<InviteLink link={INVITE_LINK} />);

    await fireEvent.press(getByTestId('alibe-invite-link'));
    await waitFor(() => {
      expect(getByText('Copiado')).toBeTruthy();
    });

    await rerender(<InviteLink link="https://alibe.app/invite/outro-link" />);

    expect(getByText('Copiar')).toBeTruthy();
  });

  test('has an accessible label and accepts a custom testID', async () => {
    const { getByLabelText, getByTestId } = await render(
      <InviteLink
        link={INVITE_LINK}
        testID="group-invite-link"
      />
    );

    expect(getByLabelText('Copiar link de convite')).toBeTruthy();
    expect(getByTestId('group-invite-link-field')).toBeTruthy();
    expect(getByTestId('group-invite-link-url')).toHaveTextContent(INVITE_LINK);
  });
});
