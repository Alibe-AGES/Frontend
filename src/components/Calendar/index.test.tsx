import { fireEvent, render } from '@testing-library/react-native';

import { Calendar } from '@/components/Calendar';

describe('Calendar', () => {
  test('renders the month, weekdays, and backend day marks', async () => {
    const { getByText, getByLabelText } = await render(
      <Calendar
        initialDate="2026-05-01"
        dayMarks={{ '2026-05-18': { status: 'allAvailable' } }}
      />
    );

    expect(getByText('maio de 2026')).toBeTruthy();
    expect(getByText('Dom')).toBeTruthy();
    expect(getByLabelText('Dia 2026-05-18')).toBeTruthy();
  });

  test('changes month and reports the first date of that month', async () => {
    const onMonthChange = jest.fn();
    const { getByText, getByTestId } = await render(
      <Calendar
        initialDate="2026-05-01"
        onMonthChange={onMonthChange}
      />
    );

    await fireEvent.press(getByTestId('calendar-next-month'));

    expect(getByText('junho de 2026')).toBeTruthy();
    expect(onMonthChange).toHaveBeenCalledWith('2026-06-01');
  });

  test('forwards a pressed day date', async () => {
    const onDayPress = jest.fn();
    const { getByLabelText } = await render(
      <Calendar
        initialDate="2026-10-01"
        onDayPress={onDayPress}
      />
    );

    await fireEvent.press(getByLabelText('Dia 2026-10-18'));

    expect(onDayPress).toHaveBeenCalledWith('2026-10-18');
  });

  test('disables past days without events but keeps past event dates selectable', async () => {
    const onDayPress = jest.fn();
    const { getByLabelText } = await render(
      <Calendar
        initialDate="2026-05-01"
        dayMarks={{
          '2026-05-18': { status: 'normal', eventIds: ['event-1', 'event-2'] },
        }}
        onDayPress={onDayPress}
      />
    );

    const emptyPastDay = getByLabelText('Dia 2026-05-17');
    const pastEventDay = getByLabelText('Dia 2026-05-18, 2 eventos');

    await fireEvent.press(emptyPastDay);
    expect(onDayPress).not.toHaveBeenCalled();
    await fireEvent.press(pastEventDay);

    expect(onDayPress).toHaveBeenCalledTimes(1);
    expect(onDayPress).toHaveBeenCalledWith('2026-05-18');
  });

  test('shows the number of scheduled events on a future day', async () => {
    const { getByLabelText, getAllByText } = await render(
      <Calendar
        initialDate="2026-05-01"
        dayMarks={{ '2026-05-20': { status: 'normal', eventIds: ['event-1', 'event-2'] } }}
      />
    );

    expect(getByLabelText('Dia 2026-05-20, 2 eventos')).toBeTruthy();
    expect(getAllByText('2')).toHaveLength(2);
  });
});
