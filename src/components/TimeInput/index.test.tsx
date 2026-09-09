import { fireEvent, render } from '@testing-library/react-native';
import { useState } from 'react';

import { TimeInput } from './index';

function ControlledTimeInput(
  props: Omit<React.ComponentProps<typeof TimeInput>, 'value' | 'onChangeTime'> & {
    initialValue?: string;
  }
) {
  const { initialValue = '', ...rest } = props;
  const [value, setValue] = useState(initialValue);

  return (
    <TimeInput
      {...rest}
      onChangeTime={setValue}
      value={value}
    />
  );
}

describe('<TimeInput />', () => {
  test('renders the label and the placeholder it receives', async () => {
    const { getByText, getByPlaceholderText } = await render(
      <TimeInput
        label="Disponibilidade"
        placeholder="Horário de início"
        value=""
        onChangeTime={jest.fn()}
      />
    );

    expect(getByText('Disponibilidade')).toBeTruthy();
    expect(getByPlaceholderText('Horário de início')).toBeTruthy();
  });

  test('shows the value it receives', async () => {
    const { getByDisplayValue } = await render(
      <TimeInput
        value="08:30"
        onChangeTime={jest.fn()}
      />
    );

    expect(getByDisplayValue('08:30')).toBeTruthy();
  });

  test('formats the typed digits as HH:mm', async () => {
    const onChangeTime = jest.fn();
    const { getByTestId } = await render(
      <TimeInput
        value=""
        onChangeTime={onChangeTime}
      />
    );

    await fireEvent.changeText(getByTestId('alibe-time-input'), '0930');

    expect(onChangeTime).toHaveBeenLastCalledWith('09:30');
  });

  test('keeps only the first four digits', async () => {
    const onChangeTime = jest.fn();
    const { getByTestId } = await render(
      <TimeInput
        value=""
        onChangeTime={onChangeTime}
      />
    );

    await fireEvent.changeText(getByTestId('alibe-time-input'), '093045');

    expect(onChangeTime).toHaveBeenLastCalledWith('09:30');
  });

  test('drops characters that are not digits', async () => {
    const onChangeTime = jest.fn();
    const { getByTestId } = await render(
      <TimeInput
        value=""
        onChangeTime={onChangeTime}
      />
    );

    await fireEvent.changeText(getByTestId('alibe-time-input'), '9h3m0');

    expect(onChangeTime).toHaveBeenLastCalledWith('93:0');
  });

  test('lets the user erase the separator by deleting digits', async () => {
    const { getByTestId, getByDisplayValue } = await render(
      <ControlledTimeInput initialValue="09:30" />
    );
    const input = getByTestId('alibe-time-input');

    await fireEvent.changeText(input, '09:');

    expect(getByDisplayValue('09')).toBeTruthy();
  });

  test('reports an invalid time when the field loses focus', async () => {
    const { getByTestId } = await render(<ControlledTimeInput initialValue="99:99" />);

    await fireEvent(getByTestId('alibe-time-input'), 'blur');

    expect(getByTestId('alibe-time-input-error')).toHaveTextContent(
      'Informe um horário válido no formato HH:mm.'
    );
  });

  test('reports an incomplete time when the field loses focus', async () => {
    const { getByTestId, queryByTestId } = await render(<ControlledTimeInput initialValue="9" />);

    await fireEvent(getByTestId('alibe-time-input'), 'blur');

    expect(queryByTestId('alibe-time-input-error')).not.toBeNull();
  });

  test('accepts the edges of the valid range', async () => {
    const { getByTestId, queryByTestId, rerender } = await render(
      <TimeInput
        value="00:00"
        onChangeTime={jest.fn()}
      />
    );

    await fireEvent(getByTestId('alibe-time-input'), 'blur');
    expect(queryByTestId('alibe-time-input-error')).toBeNull();

    await rerender(
      <TimeInput
        value="23:59"
        onChangeTime={jest.fn()}
      />
    );
    await fireEvent(getByTestId('alibe-time-input'), 'blur');

    expect(queryByTestId('alibe-time-input-error')).toBeNull();
  });

  test('does not complain about an empty field', async () => {
    const onBlur = jest.fn();
    const { getByTestId, queryByTestId } = await render(<ControlledTimeInput onBlur={onBlur} />);

    await fireEvent(getByTestId('alibe-time-input'), 'blur');

    expect(queryByTestId('alibe-time-input-error')).toBeNull();
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  test('clears the format error as soon as the user types again', async () => {
    const { getByTestId, queryByTestId } = await render(
      <ControlledTimeInput initialValue="99:99" />
    );
    const input = getByTestId('alibe-time-input');

    await fireEvent(input, 'blur');
    expect(queryByTestId('alibe-time-input-error')).not.toBeNull();

    await fireEvent.changeText(input, '0930');

    expect(queryByTestId('alibe-time-input-error')).toBeNull();
  });

  test('shows the error received by prop over the format one', async () => {
    const { getByTestId } = await render(
      <TimeInput
        error="O horário de fim deve ser depois do início."
        value="07:00"
        onChangeTime={jest.fn()}
      />
    );

    expect(getByTestId('alibe-time-input-error')).toHaveTextContent(
      'O horário de fim deve ser depois do início.'
    );
  });

  test('does not accept edits while disabled', async () => {
    const { getByTestId } = await render(
      <TimeInput
        value=""
        onChangeTime={jest.fn()}
        disabled
      />
    );

    expect(getByTestId('alibe-time-input').props.editable).toBe(false);
    expect(getByTestId('alibe-time-input').props.accessibilityState).toMatchObject({
      disabled: true,
    });
  });

  test('has accessible labels and accepts a custom testID', async () => {
    const { getByLabelText, getByTestId } = await render(
      <TimeInput
        placeholder="Horário de fim"
        testID="availability-end-time"
        value=""
        onChangeTime={jest.fn()}
      />
    );

    expect(getByLabelText('Horário de fim')).toBeTruthy();
    expect(getByTestId('availability-end-time-field')).toBeTruthy();
    expect(getByTestId('availability-end-time-icon')).toBeTruthy();
  });
});
