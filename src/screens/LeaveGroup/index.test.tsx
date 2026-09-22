import { fireEvent, render } from '@testing-library/react-native';
import { LeaveGroupScreen } from './index';

describe('LeaveGroupScreen', () => {
  test('shows the group name and invokes cancel', async () => {
    const onCancel = jest.fn();
    const { getByText, getByTestId } = await render(
      <LeaveGroupScreen
        groupName="Hermanas"
        onConfirm={jest.fn()}
        onCancel={onCancel}
      />
    );

    expect(getByText('Tem certeza de que deseja sair do grupo Hermanas?')).toBeTruthy();
    await fireEvent.press(getByTestId('leave-group-cancel'));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  test('uses the generic message without a group name and invokes confirm', async () => {
    const onConfirm = jest.fn();
    const { getByText, getByTestId } = await render(
      <LeaveGroupScreen
        onConfirm={onConfirm}
        onCancel={jest.fn()}
      />
    );

    expect(getByText('Tem certeza de que deseja sair do grupo?')).toBeTruthy();
    await fireEvent.press(getByTestId('leave-group-confirm'));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
