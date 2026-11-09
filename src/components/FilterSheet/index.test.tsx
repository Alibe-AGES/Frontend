import { fireEvent, render } from '@testing-library/react-native';
import { EMPTY_FILTER_VALUE, FilterGroup, FilterSheet, hasActiveFilters } from './index';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

const groups: FilterGroup[] = [
  {
    key: 'distance',
    title: 'Distância',
    options: [
      { value: '5', label: 'Até 5 km' },
      { value: '10', label: 'Até 10 km' },
    ],
  },
  {
    key: 'period',
    title: 'Horário',
    multiple: true,
    options: [
      { value: 'morning', label: 'Manhã' },
      { value: 'night', label: 'Noite' },
    ],
  },
];

async function setup() {
  const onConfirm = jest.fn();
  const onClose = jest.fn();
  const utils = await Promise.resolve(
    render(
      <FilterSheet
        visible
        value={EMPTY_FILTER_VALUE}
        groups={groups}
        budgetTitle="Orçamento"
        onConfirm={onConfirm}
        onClose={onClose}
      />
    )
  );

  return { onConfirm, onClose, ...utils };
}

describe('hasActiveFilters', () => {
  test.each([
    ['the empty value', EMPTY_FILTER_VALUE, false],
    ['a group left empty', { ...EMPTY_FILTER_VALUE, selections: { period: [] } }, false],
    ['a selected option', { ...EMPTY_FILTER_VALUE, selections: { period: ['night'] } }, true],
    ['a minimum budget', { ...EMPTY_FILTER_VALUE, minBudget: '10' }, true],
    ['a maximum budget', { ...EMPTY_FILTER_VALUE, maxBudget: '50' }, true],
  ])('with %s', (_, value, expected) => {
    expect(hasActiveFilters(value)).toBe(expected);
  });
});

describe('<FilterSheet />', () => {
  test('marks single choice options with a radio and multiple choice ones with a check', async () => {
    const { getAllByText, getByLabelText, getByText, queryByText } = await setup();

    expect(getAllByText('radio-button-off')).toHaveLength(2);
    expect(getAllByText('ellipse-outline')).toHaveLength(2);
    expect(queryByText('radio-button-on')).toBeNull();
    expect(queryByText('checkmark-circle')).toBeNull();

    fireEvent.press(getByLabelText('Até 5 km'));
    await Promise.resolve();
    fireEvent.press(getByLabelText('Manhã'));
    await Promise.resolve();

    expect(getByText('radio-button-on')).toBeTruthy();
    expect(getByText('checkmark-circle')).toBeTruthy();
  });

  test('keeps the budget fields as tall as the options', async () => {
    const { getByTestId } = await setup();

    expect(getByTestId('filter-sheet-min-budget').props.className).toContain('py-2');
    expect(getByTestId('filter-sheet-max-budget').props.className).toContain('py-2');
  });

  test('writes the budget in wine', async () => {
    const { getByTestId } = await setup();

    expect(getByTestId('filter-sheet-min-budget').props.className).toContain('text-wine');
    expect(getByTestId('filter-sheet-max-budget').props.className).toContain('text-wine');
  });

  test('confirms budget, single and multiple selections', async () => {
    const { onConfirm, getByTestId, getByLabelText } = await setup();

    await fireEvent.changeText(getByTestId('filter-sheet-min-budget'), '10a');
    await Promise.resolve();
    await fireEvent.changeText(getByTestId('filter-sheet-max-budget'), '50');
    await Promise.resolve();
    await fireEvent.press(getByLabelText('Até 5 km'));
    await Promise.resolve();
    await fireEvent.press(getByLabelText('Até 10 km'));
    await Promise.resolve();
    await fireEvent.press(getByLabelText('Manhã'));
    await Promise.resolve();
    await fireEvent.press(getByLabelText('Noite'));
    await Promise.resolve();
    await fireEvent.press(getByLabelText('Confirmar'));
    await Promise.resolve();

    expect(onConfirm).toHaveBeenCalledWith({
      minBudget: '10',
      maxBudget: '50',
      selections: { distance: ['10'], period: ['morning', 'night'] },
    });
  });

  test('deselects an option and resets the draft', async () => {
    const { onConfirm, getByLabelText } = await setup();

    await fireEvent.press(getByLabelText('Manhã'));
    await Promise.resolve();
    await fireEvent.press(getByLabelText('Manhã'));
    await Promise.resolve();
    await fireEvent.press(getByLabelText('Noite'));
    await Promise.resolve();
    await fireEvent.press(getByLabelText('Limpar filtros'));
    await Promise.resolve();
    await fireEvent.press(getByLabelText('Confirmar'));
    await Promise.resolve();

    expect(onConfirm).toHaveBeenCalledWith(EMPTY_FILTER_VALUE);
  });

  test('closes without confirming', async () => {
    const { onConfirm, onClose, getByTestId } = await setup();

    await fireEvent.press(getByTestId('filter-sheet-close'));
    await Promise.resolve();

    expect(onClose).toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
