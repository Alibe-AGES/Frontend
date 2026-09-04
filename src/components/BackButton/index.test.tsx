import { fireEvent, render } from '@testing-library/react-native';

import { BackButton } from './index';

const mockBack = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: mockBack }),
}));

describe('<BackButton />', () => {
  beforeEach(() => {
    mockBack.mockClear();
  });

  test('navigates to the previous screen by default', async () => {
    const { getByTestId } = await render(<BackButton />);

    await fireEvent.press(getByTestId('alibe-back-button'));

    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  test('closes a modal by relying on the default back navigation', async () => {
    const { getByTestId } = await render(<BackButton accessibilityLabel="Fechar" />);

    await fireEvent.press(getByTestId('alibe-back-button'));

    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  test('runs a custom action instead of navigating back, such as clearing filled fields', async () => {
    const onPress = jest.fn();
    const { getByTestId } = await render(
      <BackButton
        accessibilityLabel="Cancelar"
        onPress={onPress}
      />
    );

    await fireEvent.press(getByTestId('alibe-back-button'));

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(mockBack).not.toHaveBeenCalled();
  });

  test('exposes an accessible label and role', async () => {
    const { getByLabelText } = await render(<BackButton accessibilityLabel="Voltar" />);

    const button = getByLabelText('Voltar');
    expect(button.props.accessibilityRole).toBe('button');
  });

  test('falls back to the default "Voltar" label when none is provided', async () => {
    const { getByLabelText } = await render(<BackButton />);

    expect(getByLabelText('Voltar')).toBeTruthy();
  });

  test('is not pressable when disabled', async () => {
    const onPress = jest.fn();
    const { getByTestId } = await render(
      <BackButton
        onPress={onPress}
        disabled
      />
    );

    await fireEvent.press(getByTestId('alibe-back-button'));

    expect(onPress).not.toHaveBeenCalled();
    expect(mockBack).not.toHaveBeenCalled();
  });

  test('reflects the disabled state to assistive technologies', async () => {
    const { getByTestId } = await render(<BackButton disabled />);

    expect(getByTestId('alibe-back-button').props.accessibilityState).toEqual({
      disabled: true,
    });
  });
});
