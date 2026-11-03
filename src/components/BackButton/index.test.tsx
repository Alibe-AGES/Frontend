import { fireEvent, render } from '@testing-library/react-native';

import { BackButton } from './index';

const mockBack = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: mockBack,
    canGoBack: () => true,
  }),
}));

describe('<BackButton />', () => {
  beforeEach(() => {
    mockBack.mockClear();
  });

  test('navigates to the previous screen by default', async () => {
    const { getByTestId } = await Promise.resolve(render(<BackButton />));

    fireEvent.press(getByTestId('alibe-back-button'));
    await Promise.resolve();

    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  test('closes a modal by relying on the default back navigation', async () => {
    const { getByTestId } = await Promise.resolve(
      render(<BackButton accessibilityLabel="Fechar" />)
    );

    fireEvent.press(getByTestId('alibe-back-button'));
    await Promise.resolve();

    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  test('runs a custom action instead of navigating back, such as clearing filled fields', async () => {
    const onPress = jest.fn();
    const { getByTestId } = await Promise.resolve(
      render(
        <BackButton
          accessibilityLabel="Cancelar"
          onPress={onPress}
        />
      )
    );

    fireEvent.press(getByTestId('alibe-back-button'));
    await Promise.resolve();

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(mockBack).not.toHaveBeenCalled();
  });

  test('exposes an accessible label and role', async () => {
    const { getByLabelText } = await Promise.resolve(
      render(<BackButton accessibilityLabel="Voltar" />)
    );

    const button = getByLabelText('Voltar');
    expect(button.props.accessibilityRole).toBe('button');
  });

  test('falls back to the default "Voltar" label when none is provided', async () => {
    const { getByLabelText } = await Promise.resolve(render(<BackButton />));

    expect(getByLabelText('Voltar')).toBeTruthy();
  });

  test('is not pressable when disabled', async () => {
    const onPress = jest.fn();
    const { getByTestId } = await Promise.resolve(
      render(
        <BackButton
          onPress={onPress}
          disabled
        />
      )
    );

    fireEvent.press(getByTestId('alibe-back-button'));
    await Promise.resolve();

    expect(onPress).not.toHaveBeenCalled();
    expect(mockBack).not.toHaveBeenCalled();
  });

  test('reflects the disabled state to assistive technologies', async () => {
    const { getByTestId } = await Promise.resolve(render(<BackButton disabled />));

    expect(getByTestId('alibe-back-button').props.accessibilityState).toEqual({
      disabled: true,
    });
  });
});
