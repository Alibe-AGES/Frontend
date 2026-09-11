import { fireEvent, render } from '@testing-library/react-native';
import { ContinueButton } from './index';

describe('<ContinueButton />', () => {
  test('renders with the default title', async () => {
    const { getByText } = await render(<ContinueButton />);

    expect(getByText('Continuar')).toBeTruthy();
  });

  test('calls onPress when pressed', async () => {
    const onPress = jest.fn();
    const { getByText } = await render(<ContinueButton onPress={onPress} />);

    await fireEvent.press(getByText('Continuar'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test('forwards disabled state', async () => {
    const onPress = jest.fn();
    const { getByText } = await render(
      <ContinueButton
        onPress={onPress}
        disabled
      />
    );

    await fireEvent.press(getByText('Continuar'));

    expect(onPress).not.toHaveBeenCalled();
  });

  test('forwards loading state', async () => {
    const { getByText } = await render(<ContinueButton isLoading />);

    expect(getByText('Carregando...')).toBeTruthy();
  });

  test('accepts a custom title', async () => {
    const { getByText } = await render(<ContinueButton title="Criar grupo" />);

    expect(getByText('Criar grupo')).toBeTruthy();
  });
});
