import { fireEvent, render } from '@testing-library/react-native';
import { EMPTY_FILTER_VALUE, FilterGroup, FilterSheet } from './index';

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
  const utils = await render(
    <FilterSheet
      visible
      value={EMPTY_FILTER_VALUE}
      groups={groups}
      budgetTitle="Orçamento"
      onConfirm={onConfirm}
      onClose={onClose}
    />
  );

  return { onConfirm, onClose, ...utils };
}

describe('<FilterSheet />', () => {
  test('confirms budget, single and multiple selections', async () => {
    const { onConfirm, getByTestId, getByLabelText } = await setup();

    await fireEvent.changeText(getByTestId('filter-sheet-min-budget'), '10a');
    await fireEvent.changeText(getByTestId('filter-sheet-max-budget'), '50');
    await fireEvent.press(getByLabelText('Até 5 km'));
    await fireEvent.press(getByLabelText('Até 10 km'));
    await fireEvent.press(getByLabelText('Manhã'));
    await fireEvent.press(getByLabelText('Noite'));
    await fireEvent.press(getByLabelText('Confirmar'));

    expect(onConfirm).toHaveBeenCalledWith({
      minBudget: '10',
      maxBudget: '50',
      selections: { distance: ['10'], period: ['morning', 'night'] },
    });
  });

  test('deselects an option and resets the draft', async () => {
    const { onConfirm, getByLabelText } = await setup();

    await fireEvent.press(getByLabelText('Manhã'));
    await fireEvent.press(getByLabelText('Manhã'));
    await fireEvent.press(getByLabelText('Noite'));
    await fireEvent.press(getByLabelText('Limpar filtros'));
    await fireEvent.press(getByLabelText('Confirmar'));

    expect(onConfirm).toHaveBeenCalledWith(EMPTY_FILTER_VALUE);
  });

  test('closes without confirming', async () => {
    const { onConfirm, onClose, getByTestId } = await setup();

    await fireEvent.press(getByTestId('filter-sheet-close'));

    expect(onClose).toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
