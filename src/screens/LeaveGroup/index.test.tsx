import { fireEvent, render } from '@testing-library/react-native';
import { LeaveGroupScreen } from './index';

describe('LeaveGroupScreen', () => {
  test('shows the group name and invokes cancel', async () => {
    const onCancel = jest.fn();
    const { getByText, getByTestId } = await Promise.resolve(
      render(
        <LeaveGroupScreen
          groupName="Hermanas"
          onConfirm={jest.fn()}
          onCancel={onCancel}
        />
      )
    );

    expect(getByText('Tem certeza de que deseja sair do grupo Hermanas?')).toBeTruthy();
    fireEvent.press(getByTestId('leave-group-cancel'));
    await Promise.resolve();

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  test('uses the generic message without a group name and invokes confirm', async () => {
    const onConfirm = jest.fn();
    const { getByText, getByTestId } = await Promise.resolve(
      render(
        <LeaveGroupScreen
          onConfirm={onConfirm}
          onCancel={jest.fn()}
        />
      )
    );

    expect(getByText('Tem certeza de que deseja sair do grupo?')).toBeTruthy();
    fireEvent.press(getByTestId('leave-group-confirm'));
    await Promise.resolve();

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});

describe('LeaveGroupScreen while leaving', () => {
  test('shows a spinner and disables both actions', async () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();
    const { getByTestId, queryByText } = await Promise.resolve(
      render(
        <LeaveGroupScreen
          isLeaving
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      )
    );

    expect(getByTestId('leave-group-loading')).toBeTruthy();
    expect(queryByText('Sair do grupo')).toBeNull();
    // A disabled Pressable lets the press bubble up to the dialog, which stops propagation.
    const event = { stopPropagation: jest.fn() };
    fireEvent.press(getByTestId('leave-group-confirm'), event);
    fireEvent.press(getByTestId('leave-group-cancel'), event);
    await Promise.resolve();

    expect(onConfirm).not.toHaveBeenCalled();
    expect(onCancel).not.toHaveBeenCalled();
  });
});
