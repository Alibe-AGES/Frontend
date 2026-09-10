import { fireEvent, render } from '@testing-library/react-native';
import { Button } from './index';

describe('<Button />', () => {
  test('renders its title and responds to presses', async () => {
    const onPress = jest.fn();
    const { getByText } = await render(
      <Button
        title="Entrar"
        onPress={onPress}
      />
    );

    await fireEvent.press(getByText('Entrar'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test('is not pressable when disabled', async () => {
    const onPress = jest.fn();
    const { getByText } = await render(
      <Button
        title="Entrar"
        onPress={onPress}
        disabled
      />
    );

    await fireEvent.press(getByText('Entrar'));

    expect(onPress).not.toHaveBeenCalled();
  });

  test('keeps the ink color after it is pressed once', async () => {
    const { getByTestId, getByText } = await render(<Button title="Entrar" />);

    expect(getByTestId('alibe-button').props.className).toContain('bg-coral');

    await fireEvent.press(getByText('Entrar'));

    expect(getByTestId('alibe-button').props.className).toContain('bg-ink');
  });
});
