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

  test('keeps its variant color after being pressed', async () => {
    const { getByTestId, getByText } = await render(<Button title="Entrar" />);

    expect(getByTestId('alibe-button').props.className).toContain('bg-coral');

    await fireEvent.press(getByText('Entrar'));

    expect(getByTestId('alibe-button').props.className).toContain('bg-coral');
  });

  test('renders secondary variant correctly', async () => {
    const { getByTestId } = await render(
      <Button
        title="Continuar"
        variant="secondary"
      />
    );

    expect(getByTestId('alibe-button').props.className).toContain('bg-lime');
  });

  test('has button accessibility role', async () => {
    const { getByTestId } = await render(<Button title="Continuar" />);

    expect(getByTestId('alibe-button').props.accessibilityRole).toBe('button');
  });

  test('does not respond to presses while loading', async () => {
    const onPress = jest.fn();

    const { getByText } = await render(
      <Button
        title="Continuar"
        onPress={onPress}
        isLoading
      />
    );

    await fireEvent.press(getByText('Carregando...'));

    expect(onPress).not.toHaveBeenCalled();
  });

  test('accepts a custom testID', async () => {
    const { getByTestId } = await render(
      <Button
        title="Continuar"
        testID="custom-button"
      />
    );

    expect(getByTestId('custom-button')).toBeTruthy();
  });

  test('uses the title as the accessibility label', async () => {
    const { getByTestId } = await render(<Button title="Continuar" />);

    expect(getByTestId('alibe-button').props.accessibilityLabel).toBe('Continuar');
  });
});
