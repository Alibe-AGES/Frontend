import { fireEvent, render } from '@testing-library/react-native';
import { useState } from 'react';

import { EmailInput } from './index';

function ControlledEmailInput(
  props: Omit<React.ComponentProps<typeof EmailInput>, 'value' | 'onChangeText'> & {
    initialValue?: string;
  }
) {
  const { initialValue = '', ...rest } = props;
  const [value, setValue] = useState(initialValue);

  return (
    <EmailInput
      {...rest}
      onChangeText={setValue}
      value={value}
    />
  );
}

describe('<EmailInput />', () => {
  test('always uses "Email" as the placeholder', async () => {
    const { getByPlaceholderText } = await render(
      <EmailInput
        value=""
        onChangeText={jest.fn()}
      />
    );

    expect(getByPlaceholderText('Email')).toBeTruthy();
  });

  test('accepts an optional label', async () => {
    const { getByText } = await render(
      <EmailInput
        label="E-mail"
        value=""
        onChangeText={jest.fn()}
      />
    );

    expect(getByText('E-mail')).toBeTruthy();
  });

  test('configures the field for email entry', async () => {
    const { getByTestId } = await render(
      <EmailInput
        value=""
        onChangeText={jest.fn()}
        testID="email-input"
      />
    );

    const field = getByTestId('email-input');
    expect(field.props.keyboardType).toBe('email-address');
    expect(field.props.autoCapitalize).toBe('none');
  });

  test('renders the at icon over a coral badge by default', async () => {
    const { getByTestId } = await render(
      <EmailInput
        value=""
        onChangeText={jest.fn()}
        testID="email-input"
      />
    );

    expect(getByTestId('email-input-icon').props.className).toContain('bg-coral');
  });

  test('renders the at icon over an ink badge when asked', async () => {
    const { getByTestId } = await render(
      <EmailInput
        value=""
        onChangeText={jest.fn()}
        iconBackground="ink"
        testID="email-input"
      />
    );

    expect(getByTestId('email-input-icon').props.className).toContain('bg-ink');
  });

  test('lets the user type an address', async () => {
    const { getByTestId, getByDisplayValue } = await render(
      <ControlledEmailInput testID="email-input" />
    );

    await fireEvent.changeText(getByTestId('email-input'), 'user@example.com');

    expect(getByDisplayValue('user@example.com')).toBeTruthy();
  });

  test('warns about an invalid address on blur', async () => {
    const { getByTestId, getByText } = await render(
      <ControlledEmailInput
        initialValue="not-an-email"
        testID="email-input"
      />
    );

    await fireEvent(getByTestId('email-input'), 'blur');

    expect(getByText('Informe um e-mail válido.')).toBeTruthy();
  });

  test('has no error for a valid address on blur', async () => {
    const { getByTestId, queryByTestId } = await render(
      <ControlledEmailInput
        initialValue="user@example.com"
        testID="email-input"
      />
    );

    await fireEvent(getByTestId('email-input'), 'blur');

    expect(queryByTestId('email-input-error')).toBeNull();
  });

  test('has no error for an empty value on blur', async () => {
    const { getByTestId, queryByTestId } = await render(
      <ControlledEmailInput testID="email-input" />
    );

    await fireEvent(getByTestId('email-input'), 'blur');

    expect(queryByTestId('email-input-error')).toBeNull();
  });

  test('an externally provided error takes precedence over the format validation', async () => {
    const { getByText, queryByText } = await render(
      <EmailInput
        value="not-an-email"
        onChangeText={jest.fn()}
        error="Campo obrigatório."
      />
    );

    expect(getByText('Campo obrigatório.')).toBeTruthy();
    expect(queryByText('Informe um e-mail válido.')).toBeNull();
  });

  test('is not editable when disabled', async () => {
    const { getByTestId } = await render(
      <EmailInput
        value=""
        onChangeText={jest.fn()}
        disabled
        testID="email-input"
      />
    );

    expect(getByTestId('email-input').props.editable).toBe(false);
  });

  test('calls the onBlur callback', async () => {
    const onBlur = jest.fn();
    const { getByTestId } = await render(
      <EmailInput
        value=""
        onChangeText={jest.fn()}
        onBlur={onBlur}
        testID="email-input"
      />
    );

    await fireEvent(getByTestId('email-input'), 'blur');

    expect(onBlur).toHaveBeenCalledTimes(1);
  });
});
