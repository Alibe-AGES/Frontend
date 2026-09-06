import { fireEvent, render } from '@testing-library/react-native';
import { useState } from 'react';
import { Text } from 'react-native';
import { TextInput } from './index';

function ControlledTextInput(
  props: Omit<React.ComponentProps<typeof TextInput>, 'value' | 'onChangeText'>
) {
  const [value, setValue] = useState('');
  return (
    <TextInput
      {...props}
      value={value}
      onChangeText={setValue}
    />
  );
}

describe('<TextInput />', () => {
  test('renders label and placeholder', async () => {
    const { getByText, getByPlaceholderText } = await render(
      <TextInput
        label="E-mail"
        placeholder="voce@exemplo.com"
        value=""
        onChangeText={jest.fn()}
      />
    );

    expect(getByText('E-mail')).toBeTruthy();
    expect(getByPlaceholderText('voce@exemplo.com')).toBeTruthy();
  });

  test('lets the user edit its content', async () => {
    const { getByTestId, getByDisplayValue } = await render(
      <ControlledTextInput testID="name-input" />
    );

    await fireEvent.changeText(getByTestId('name-input'), 'Alibe');

    expect(getByDisplayValue('Alibe')).toBeTruthy();
  });

  test('type "all" accepts any character, including special ones', async () => {
    const onChangeText = jest.fn();
    const { getByTestId, queryByTestId } = await render(
      <TextInput
        type="all"
        value=""
        onChangeText={onChangeText}
        testID="all-input"
      />
    );

    await fireEvent.changeText(getByTestId('all-input'), 'Rua 123, ap° 4 - #casa!');

    expect(onChangeText).toHaveBeenLastCalledWith('Rua 123, ap° 4 - #casa!');
    expect(queryByTestId('all-input-error')).toBeNull();
  });

  test('type "numeric" strips non-numeric characters and warns the user', async () => {
    const onChangeText = jest.fn();
    const { getByTestId, getByText } = await render(
      <TextInput
        type="numeric"
        value=""
        onChangeText={onChangeText}
        testID="numeric-input"
      />
    );

    await fireEvent.changeText(getByTestId('numeric-input'), '12a3b');

    expect(onChangeText).toHaveBeenLastCalledWith('123');
    expect(getByText('Este campo aceita somente números.')).toBeTruthy();
  });

  test('type "numeric" has no error when only digits are typed', async () => {
    const onChangeText = jest.fn();
    const { getByTestId, queryByTestId } = await render(
      <TextInput
        type="numeric"
        value=""
        onChangeText={onChangeText}
        testID="numeric-input"
      />
    );

    await fireEvent.changeText(getByTestId('numeric-input'), '2026');

    expect(onChangeText).toHaveBeenLastCalledWith('2026');
    expect(queryByTestId('numeric-input-error')).toBeNull();
  });

  test('type "alphanumeric" strips special characters and warns the user', async () => {
    const onChangeText = jest.fn();
    const { getByTestId, getByText } = await render(
      <TextInput
        type="alphanumeric"
        value=""
        onChangeText={onChangeText}
        testID="alphanumeric-input"
      />
    );

    await fireEvent.changeText(getByTestId('alphanumeric-input'), 'Alibe#2026!');

    expect(onChangeText).toHaveBeenLastCalledWith('Alibe2026');
    expect(getByText('Este campo não aceita caracteres especiais.')).toBeTruthy();
  });

  test('type "alphanumeric" accepts letters, numbers and spaces without error', async () => {
    const onChangeText = jest.fn();
    const { getByTestId, queryByTestId } = await render(
      <TextInput
        type="alphanumeric"
        value=""
        onChangeText={onChangeText}
        testID="alphanumeric-input"
      />
    );

    await fireEvent.changeText(getByTestId('alphanumeric-input'), 'Grupo Familia 2026');

    expect(onChangeText).toHaveBeenLastCalledWith('Grupo Familia 2026');
    expect(queryByTestId('alphanumeric-input-error')).toBeNull();
  });

  test('type "email" warns the user about an invalid format on blur', async () => {
    const { getByTestId, getByText } = await render(
      <TextInput
        type="email"
        value="not-an-email"
        onChangeText={jest.fn()}
        testID="email-input"
      />
    );

    await fireEvent(getByTestId('email-input'), 'blur');

    expect(getByText('Informe um e-mail válido.')).toBeTruthy();
  });

  test('type "email" has no error for a valid address on blur', async () => {
    const { getByTestId, queryByTestId } = await render(
      <TextInput
        type="email"
        value="user@example.com"
        onChangeText={jest.fn()}
        testID="email-input"
      />
    );

    await fireEvent(getByTestId('email-input'), 'blur');

    expect(queryByTestId('email-input-error')).toBeNull();
  });

  test('type "email" has no error for an empty value on blur', async () => {
    const { getByTestId, queryByTestId } = await render(
      <TextInput
        type="email"
        value=""
        onChangeText={jest.fn()}
        testID="email-input"
      />
    );

    await fireEvent(getByTestId('email-input'), 'blur');

    expect(queryByTestId('email-input-error')).toBeNull();
  });

  test('an externally provided error takes precedence over the internal validation', async () => {
    const { getByText, queryByText } = await render(
      <TextInput
        type="numeric"
        value="123"
        onChangeText={jest.fn()}
        error="Campo obrigatório."
      />
    );

    expect(getByText('Campo obrigatório.')).toBeTruthy();
    expect(queryByText('Este campo aceita somente números.')).toBeNull();
  });

  test('is not editable when disabled', async () => {
    const { getByTestId } = await render(
      <TextInput
        value=""
        onChangeText={jest.fn()}
        disabled
        testID="disabled-input"
      />
    );

    expect(getByTestId('disabled-input').props.editable).toBe(false);
  });

  test('calls the onBlur callback', async () => {
    const onBlur = jest.fn();
    const { getByTestId } = await render(
      <TextInput
        value=""
        onChangeText={jest.fn()}
        onBlur={onBlur}
        testID="blur-input"
      />
    );

    await fireEvent(getByTestId('blur-input'), 'blur');

    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  test('highlights the whole pill border on focus and clears it on blur', async () => {
    const { getByTestId } = await render(
      <TextInput
        value=""
        onChangeText={jest.fn()}
        testID="focus-input"
      />
    );

    const field = getByTestId('focus-input-field');
    expect(field.props.className).toContain('border-transparent');

    await fireEvent(getByTestId('focus-input'), 'focus');
    expect(field.props.className).toContain('border-ink');

    await fireEvent(getByTestId('focus-input'), 'blur');
    expect(field.props.className).toContain('border-transparent');
  });

  test('keeps the error border even when the field is focused', async () => {
    const { getByTestId } = await render(
      <TextInput
        value=""
        onChangeText={jest.fn()}
        testID="focus-error-input"
        error="Campo obrigatório."
      />
    );

    await fireEvent(getByTestId('focus-error-input'), 'focus');

    expect(getByTestId('focus-error-input-field').props.className).toContain('border-coral');
  });

  test('renders no icon slot when no icon is provided', async () => {
    const { queryByTestId } = await render(
      <TextInput
        value=""
        onChangeText={jest.fn()}
        testID="no-icon-input"
      />
    );

    expect(queryByTestId('no-icon-input-icon')).toBeNull();
  });

  test('renders the provided icon with a coral badge', async () => {
    const { getByTestId, getByText } = await render(
      <TextInput
        value=""
        onChangeText={jest.fn()}
        testID="icon-input"
        icon={<Text>@</Text>}
        iconBackground="coral"
      />
    );

    expect(getByText('@')).toBeTruthy();
    expect(getByTestId('icon-input-icon').props.className).toContain('bg-coral');
  });

  test('renders the provided icon with an ink badge', async () => {
    const { getByTestId } = await render(
      <TextInput
        value=""
        onChangeText={jest.fn()}
        testID="icon-input"
        icon={<Text>@</Text>}
        iconBackground="ink"
      />
    );

    expect(getByTestId('icon-input-icon').props.className).toContain('bg-ink');
  });

  test('renders a plain icon with no badge background when iconBackground is omitted', async () => {
    const { getByTestId } = await render(
      <TextInput
        value=""
        onChangeText={jest.fn()}
        testID="icon-input"
        icon={<Text>✎</Text>}
      />
    );

    const iconWrapperClassName = getByTestId('icon-input-icon').props.className as string;
    expect(iconWrapperClassName).not.toContain('bg-coral');
    expect(iconWrapperClassName).not.toContain('bg-ink');
  });
});
