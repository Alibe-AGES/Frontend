import { fireEvent, render } from '@testing-library/react-native';
import { useState } from 'react';

import { PasswordInput } from './index';

function ControlledPasswordInput(
  props: Omit<React.ComponentProps<typeof PasswordInput>, 'value' | 'onChangeText'> & {
    initialValue?: string;
  }
) {
  const { initialValue = '', ...rest } = props;
  const [value, setValue] = useState(initialValue);

  return (
    <PasswordInput
      {...rest}
      onChangeText={setValue}
      value={value}
    />
  );
}

describe('<PasswordInput />', () => {
  test('uses "Senha" as the placeholder by default', async () => {
    const { getByPlaceholderText } = await render(
      <PasswordInput
        value=""
        onChangeText={jest.fn()}
      />
    );

    expect(getByPlaceholderText('Senha')).toBeTruthy();
  });

  test('uses "Confirmar senha" as the placeholder for the confirm variant', async () => {
    const { getByPlaceholderText } = await render(
      <PasswordInput
        variant="confirm"
        value=""
        onChangeText={jest.fn()}
      />
    );

    expect(getByPlaceholderText('Confirmar senha')).toBeTruthy();
  });

  test('accepts an optional label', async () => {
    const { getByText } = await render(
      <PasswordInput
        label="Senha"
        value=""
        onChangeText={jest.fn()}
      />
    );

    expect(getByText('Senha')).toBeTruthy();
  });

  test('hides the password by default', async () => {
    const { getByTestId } = await render(
      <PasswordInput
        value=""
        onChangeText={jest.fn()}
        testID="password-input"
      />
    );

    expect(getByTestId('password-input').props.secureTextEntry).toBe(true);
  });

  test('shows the password when visible', async () => {
    const { getByTestId } = await render(
      <PasswordInput
        value=""
        onChangeText={jest.fn()}
        visible
        testID="password-input"
      />
    );

    expect(getByTestId('password-input').props.secureTextEntry).toBe(false);
  });

  test('configures the field for password entry', async () => {
    const { getByTestId } = await render(
      <PasswordInput
        value=""
        onChangeText={jest.fn()}
        testID="password-input"
      />
    );

    const field = getByTestId('password-input');
    expect(field.props.autoCapitalize).toBe('none');
    expect(field.props.autoCorrect).toBe(false);
  });

  test('renders the icon over a coral badge by default', async () => {
    const { getByTestId } = await render(
      <PasswordInput
        value=""
        onChangeText={jest.fn()}
        testID="password-input"
      />
    );

    expect(getByTestId('password-input-icon').props.className).toContain('bg-coral');
  });

  test('renders the icon over an ink badge when asked', async () => {
    const { getByTestId } = await render(
      <PasswordInput
        value=""
        onChangeText={jest.fn()}
        iconBackground="ink"
        testID="password-input"
      />
    );

    expect(getByTestId('password-input-icon').props.className).toContain('bg-ink');
  });

  test('lets the user type any character', async () => {
    const { getByTestId, getByDisplayValue } = await render(
      <ControlledPasswordInput testID="password-input" />
    );

    await fireEvent.changeText(getByTestId('password-input'), 'Alibe#2026!');

    expect(getByDisplayValue('Alibe#2026!')).toBeTruthy();
  });

  test('renders an externally provided error', async () => {
    const { getByText } = await render(
      <PasswordInput
        variant="confirm"
        value="abc"
        onChangeText={jest.fn()}
        error="As senhas não coincidem."
      />
    );

    expect(getByText('As senhas não coincidem.')).toBeTruthy();
  });

  test('is not editable when disabled', async () => {
    const { getByTestId } = await render(
      <PasswordInput
        value=""
        onChangeText={jest.fn()}
        disabled
        testID="password-input"
      />
    );

    expect(getByTestId('password-input').props.editable).toBe(false);
  });

  test('calls the onBlur callback', async () => {
    const onBlur = jest.fn();
    const { getByTestId } = await render(
      <PasswordInput
        value=""
        onChangeText={jest.fn()}
        onBlur={onBlur}
        testID="password-input"
      />
    );

    await fireEvent(getByTestId('password-input'), 'blur');

    expect(onBlur).toHaveBeenCalledTimes(1);
  });
});
