import { fireEvent, render } from '@testing-library/react-native';
import { Button, type ButtonVariant } from './index';

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

  test.each<[ButtonVariant, string, string]>([
    ['primary', 'bg-coral', 'text-white'],
    ['secondary', 'bg-lime', 'text-ink'],
    ['tertiary', 'bg-ink', 'text-white'],
  ])('paints the %s variant', async (variant, background, color) => {
    const { getByTestId, getByText } = await render(
      <Button
        title="Continuar"
        variant={variant}
      />
    );

    expect(getByTestId('alibe-button').props.className).toContain(background);
    expect(getByText('Continuar').props.className).toContain(color);
  });

  test('shows a loading indicator and does not respond to presses while loading', async () => {
    const onPress = jest.fn();

    const { getByTestId, queryByText } = await render(
      <Button
        title="Continuar"
        onPress={onPress}
        isLoading
      />
    );

    expect(getByTestId('alibe-button-loading')).toBeTruthy();
    expect(queryByText('Continuar')).toBeNull();
    expect(getByTestId('alibe-button').props.accessibilityState).toEqual({
      disabled: true,
      busy: true,
    });

    await fireEvent.press(getByTestId('alibe-button'));

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
