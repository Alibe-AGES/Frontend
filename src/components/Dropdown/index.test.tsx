import { fireEvent, render } from '@testing-library/react-native';
import { useState } from 'react';

import { Dropdown } from './index';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

const OPTIONS = [
  { label: 'Jantar de sexta', value: 'dinner' },
  { label: 'Churrasco', value: 'barbecue' },
];

function ControlledDropdown({ onChange }: { onChange?: (value: string) => void }) {
  const [value, setValue] = useState<string | null>(null);

  return (
    <Dropdown
      options={OPTIONS}
      placeholder="Selecionar evento"
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
    />
  );
}

describe('<Dropdown />', () => {
  test('shows the placeholder and keeps the menu closed', async () => {
    const { getByText, queryByTestId } = await render(<ControlledDropdown />);

    expect(getByText('Selecionar evento')).toBeTruthy();
    expect(queryByTestId('alibe-dropdown-menu')).toBeNull();
  });

  test('opens the menu with every option', async () => {
    const { getByTestId, getByText } = await render(<ControlledDropdown />);

    await fireEvent.press(getByTestId('alibe-dropdown'));

    expect(getByTestId('alibe-dropdown')).toBeExpanded();
    expect(getByText('Jantar de sexta')).toBeTruthy();
    expect(getByText('Churrasco')).toBeTruthy();
  });

  test('selects an option, reports it and closes the menu', async () => {
    const onChange = jest.fn();
    const { getByTestId, getByText, queryByTestId } = await render(
      <ControlledDropdown onChange={onChange} />
    );

    await fireEvent.press(getByTestId('alibe-dropdown'));
    await fireEvent.press(getByTestId('alibe-dropdown-option-barbecue'));

    expect(onChange).toHaveBeenCalledWith('barbecue');
    expect(queryByTestId('alibe-dropdown-menu')).toBeNull();
    expect(getByText('Churrasco')).toBeTruthy();
  });

  test('marks the current value as selected', async () => {
    const { getByTestId } = await render(
      <Dropdown
        options={OPTIONS}
        value="dinner"
        onChange={jest.fn()}
      />
    );

    await fireEvent.press(getByTestId('alibe-dropdown'));

    expect(getByTestId('alibe-dropdown-option-dinner')).toBeSelected();
    expect(getByTestId('alibe-dropdown-option-barbecue')).not.toBeSelected();
  });

  test('closes the menu when pressing the trigger again', async () => {
    const { getByTestId, queryByTestId } = await render(<ControlledDropdown />);

    await fireEvent.press(getByTestId('alibe-dropdown'));
    await fireEvent.press(getByTestId('alibe-dropdown'));

    expect(queryByTestId('alibe-dropdown-menu')).toBeNull();
  });

  test('closes the menu when pressing outside it', async () => {
    const onChange = jest.fn();
    const { getByTestId, queryByTestId } = await render(<ControlledDropdown onChange={onChange} />);

    await fireEvent.press(getByTestId('alibe-dropdown'));
    await fireEvent.press(getByTestId('alibe-dropdown-backdrop'));

    expect(queryByTestId('alibe-dropdown-menu')).toBeNull();
    expect(onChange).not.toHaveBeenCalled();
  });

  test('renders long option lists inside a scrollable list', async () => {
    const manyOptions = Array.from({ length: 20 }, (_, index) => ({
      label: `Evento ${String(index + 1)}`,
      value: `event-${String(index + 1)}`,
    }));
    const { getByTestId, getByText } = await render(
      <Dropdown
        options={manyOptions}
        value={null}
        onChange={jest.fn()}
      />
    );

    await fireEvent.press(getByTestId('alibe-dropdown'));

    expect(getByTestId('alibe-dropdown-options').props.onContentSizeChange).toBeDefined();
    expect(getByText('Evento 1')).toBeTruthy();
    expect(getByText('Evento 20')).toBeTruthy();
  });

  test('does not open while disabled', async () => {
    const { getByTestId, queryByTestId } = await render(
      <Dropdown
        disabled
        options={OPTIONS}
        value={null}
        onChange={jest.fn()}
      />
    );

    await fireEvent.press(getByTestId('alibe-dropdown'));

    expect(queryByTestId('alibe-dropdown-menu')).toBeNull();
    expect(getByTestId('alibe-dropdown')).toBeDisabled();
  });

  test('shows the empty message when there are no options', async () => {
    const { getByTestId, getByText } = await render(
      <Dropdown
        emptyMessage="Nenhum evento no grupo"
        options={[]}
        value={null}
        onChange={jest.fn()}
      />
    );

    await fireEvent.press(getByTestId('alibe-dropdown'));

    expect(getByText('Nenhum evento no grupo')).toBeTruthy();
  });
});
