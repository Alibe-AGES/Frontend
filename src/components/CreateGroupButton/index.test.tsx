import { fireEvent, render } from '@testing-library/react-native';
import { CreateGroupButton } from './index';

describe('<CreateGroupButton />', () => {
  test('responds to presses', async () => {
    const onPress = jest.fn();
    const { getByTestId } = await Promise.resolve(render(<CreateGroupButton onPress={onPress} />));

    fireEvent.press(getByTestId('create-group-button'));
    await Promise.resolve();

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test('is not pressable when disabled', async () => {
    const onPress = jest.fn();
    const { getByTestId } = await Promise.resolve(
      render(
        <CreateGroupButton
          onPress={onPress}
          disabled
        />
      )
    );

    fireEvent.press(getByTestId('create-group-button'));
    await Promise.resolve();

    expect(onPress).not.toHaveBeenCalled();
  });

  test('has an accessible label and exposes the disabled state', async () => {
    const { getByLabelText, getByTestId } = await Promise.resolve(
      render(<CreateGroupButton disabled />)
    );

    expect(getByLabelText('Criar novo grupo')).toBeTruthy();
    expect(getByTestId('create-group-button').props.accessibilityState).toMatchObject({
      disabled: true,
    });
  });
});
