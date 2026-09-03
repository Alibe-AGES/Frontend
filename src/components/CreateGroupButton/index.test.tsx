import { fireEvent, render } from '@testing-library/react-native';
import { CreateGroupButton } from './index';

describe('<CreateGroupButton />', () => {
  test('responds to presses', async () => {
    const onPress = jest.fn();
    const { getByTestId } = await render(<CreateGroupButton onPress={onPress} />);

    await fireEvent.press(getByTestId('create-group-button'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test('is not pressable when disabled', async () => {
    const onPress = jest.fn();
    const { getByTestId } = await render(
      <CreateGroupButton
        onPress={onPress}
        disabled
      />
    );

    await fireEvent.press(getByTestId('create-group-button'));

    expect(onPress).not.toHaveBeenCalled();
  });

  test('has an accessible label and exposes the disabled state', async () => {
    const { getByLabelText, getByTestId } = await render(<CreateGroupButton disabled />);

    expect(getByLabelText('Criar novo grupo')).toBeTruthy();
    expect(getByTestId('create-group-button').props.accessibilityState).toMatchObject({
      disabled: true,
    });
  });
});
