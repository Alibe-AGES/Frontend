import { fireEvent, render } from '@testing-library/react-native';

import { Calendar } from '@/components/Calendar';

describe('Calendar', () => {
  test('renders the month, weekdays, and backend day marks', async () => {
    const { getByText, getByLabelText } = await Promise.resolve(
      render(
        <Calendar
          initialDate="2026-05-01"
          dayMarks={{ '2026-05-18': { status: 'allAvailable' } }}
        />
      )
    );

    expect(getByText('maio')).toBeTruthy();
    expect(getByText('Toque nos dias para ver mais detalhes.')).toBeTruthy();
    expect(getByText('Dom')).toBeTruthy();
    expect(getByLabelText('Dia 2026-05-18')).toBeTruthy();
  });

  test('changes month and reports the first date of that month', async () => {
    const onMonthChange = jest.fn();
    const { getByText, getByTestId } = await Promise.resolve(
      render(
        <Calendar
          initialDate="2026-05-01"
          onMonthChange={onMonthChange}
        />
      )
    );

    fireEvent.press(getByTestId('calendar-next-month'));
    await Promise.resolve();

    expect(getByText('junho')).toBeTruthy();
    expect(onMonthChange).toHaveBeenCalledWith('2026-06-01');
  });

  test('forwards a pressed day date', async () => {
    const onDayPress = jest.fn();
    const { getByLabelText } = await Promise.resolve(
      render(
        <Calendar
          initialDate="2999-10-01"
          onDayPress={onDayPress}
        />
      )
    );

    fireEvent.press(getByLabelText('Dia 2999-10-18'));
    await Promise.resolve();

    expect(onDayPress).toHaveBeenCalledWith('2999-10-18');
  });

  test('forwards a date from its create action', async () => {
    const onDayCreatePress = jest.fn();
    const { getByTestId } = await Promise.resolve(
      render(
        <Calendar
          initialDate="2999-01-01"
          onDayCreatePress={onDayCreatePress}
        />
      )
    );

    fireEvent.press(getByTestId('calendar-create-2999-01-05'));
    await Promise.resolve();

    expect(onDayCreatePress).toHaveBeenCalledWith('2999-01-05');
  });

  test('disables past days without events but keeps past event dates selectable', async () => {
    const onDayPress = jest.fn();
    const { getByLabelText } = await Promise.resolve(
      render(
        <Calendar
          initialDate="2026-05-01"
          dayMarks={{
            '2026-05-18': { status: 'normal', eventIds: ['event-1', 'event-2'] },
          }}
          onDayPress={onDayPress}
        />
      )
    );

    const emptyPastDay = getByLabelText('Dia 2026-05-17');
    const pastEventDay = getByLabelText('Dia 2026-05-18, 2 eventos');

    fireEvent.press(emptyPastDay);
    await Promise.resolve();
    expect(onDayPress).not.toHaveBeenCalled();
    fireEvent.press(pastEventDay);
    await Promise.resolve();

    expect(onDayPress).toHaveBeenCalledTimes(1);
    expect(onDayPress).toHaveBeenCalledWith('2026-05-18');
  });

  test('renders the first memory image on a day and keeps it selectable even in the past', async () => {
    const onDayPress = jest.fn();
    const { getByTestId, getByLabelText } = await Promise.resolve(
      render(
        <Calendar
          initialDate="2025-05-01"
          dayMarks={{
            '2025-05-08': {
              status: 'realized',
              imageUrl: 'https://cdn.alibe.com/memory-1.jpg',
            },
          }}
          onDayPress={onDayPress}
        />
      )
    );

    expect(getByTestId('calendar-day-image-2025-05-08')).toBeTruthy();

    fireEvent.press(getByLabelText('Dia 2025-05-08'));
    await Promise.resolve();

    expect(onDayPress).toHaveBeenCalledWith('2025-05-08');
  });

  test('preserves realized and suggested styles for past event days without IDs', async () => {
    const { getByTestId, getByText } = await Promise.resolve(
      render(
        <Calendar
          initialDate="2025-05-01"
          dayMarks={{
            '2025-05-08': { status: 'realized' },
            '2025-05-22': { status: 'suggested' },
          }}
        />
      )
    );

    expect(getByText('☆')).toBeTruthy();
    expect(getByTestId('calendar-day-2025-05-08').props.className).toContain('bg-ink');
  });

  test('announces scheduled event counts accessibly without adding number badges', async () => {
    const { getByLabelText, getAllByText } = await Promise.resolve(
      render(
        <Calendar
          initialDate="2026-05-01"
          dayMarks={{ '2026-05-20': { status: 'normal', eventIds: ['event-1', 'event-2'] } }}
        />
      )
    );

    expect(getByLabelText('Dia 2026-05-20, 2 eventos')).toBeTruthy();
    expect(getAllByText('2')).toHaveLength(1);
  });

  test('marks partial availability with a coral dot beside an event', async () => {
    const { getByLabelText, getByTestId, getAllByText } = await Promise.resolve(
      render(
        <Calendar
          initialDate="2026-10-01"
          dayMarks={{
            '2026-10-05': {
              status: 'suggested',
              eventIds: ['event-1'],
              availableUserCount: 3,
            },
          }}
        />
      )
    );

    expect(getByLabelText('Dia 2026-10-05, 1 evento, 3 disponíveis')).toBeTruthy();
    expect(getByTestId('calendar-availability-indicator-2026-10-05')).toBeTruthy();
    expect(getAllByText('3')).toHaveLength(1);
  });

  test('does not show a member count when everyone is available', async () => {
    const { getByLabelText, queryByText } = await Promise.resolve(
      render(
        <Calendar
          initialDate="2026-10-01"
          dayMarks={{
            '2026-10-05': {
              status: 'realized',
              eventIds: ['event-1'],
              allUsersAvailable: true,
            },
          }}
        />
      )
    );

    expect(getByLabelText('Dia 2026-10-05, 1 evento, todos disponíveis')).toBeTruthy();
    expect(queryByText('✓')).toBeNull();
  });

  test('keeps the final partial week aligned to seven weekday columns', async () => {
    const { getByTestId } = await Promise.resolve(render(<Calendar initialDate="2026-06-01" />));

    expect(getByTestId('calendar-week-4').children).toHaveLength(7);
  });
});
