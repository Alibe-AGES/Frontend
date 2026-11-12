import { act, fireEvent, render } from '@testing-library/react-native';

import { Calendar } from '@/components/Calendar';
import { API_BASE_URL } from '@/constants';
import { getAuthenticationHeaders } from '@/server/authenticated-fetch';

jest.mock('@/server/authenticated-fetch', () => ({
  getAuthenticationHeaders: jest.fn(),
}));

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
    const { getByTestId } = await Promise.resolve(
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

    expect(getByTestId('calendar-day-icon-suggested')).toBeTruthy();
    expect(getByTestId('calendar-day-2025-05-08').props.className).toContain('bg-ink');
    expect(getByTestId('calendar-day-2025-05-22').props.className).toContain('bg-pink-deep');
  });

  test("outlines today's date without outlining other days", () => {
    const now = new Date();
    const today = `${String(now.getFullYear())}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const otherDayNumber = now.getDate() === 1 ? 2 : 1;
    const otherDay = `${today.slice(0, 8)}${String(otherDayNumber).padStart(2, '0')}`;
    const { getByTestId } = render(<Calendar initialDate={today} />);

    expect(getByTestId(`calendar-day-${today}`).props.className).toContain(
      'border-2 border-pink-deep'
    );
    expect(getByTestId(`calendar-day-${otherDay}`).props.className).not.toContain(
      'border-pink-deep'
    );
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

  test('keeps the day background when someone is available and adds a coral dot', async () => {
    const { getByTestId } = await Promise.resolve(
      render(
        <Calendar
          initialDate="2099-12-01"
          dayMarks={{
            '2099-12-10': { status: 'available', availableUserCount: 1 },
          }}
        />
      )
    );

    expect(getByTestId('calendar-day-2099-12-10')).toHaveProp(
      'className',
      expect.stringContaining('bg-transparent')
    );
    expect(getByTestId('calendar-day-2099-12-10')).not.toHaveProp(
      'className',
      expect.stringContaining('bg-lime')
    );
    expect(getByTestId('calendar-availability-indicator-2099-12-10')).toBeTruthy();
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

  test('shows the scheduled event star in the legend as an icon', async () => {
    const { getByTestId } = await Promise.resolve(
      render(
        <Calendar
          initialDate="2026-05-01"
          showLegend
        />
      )
    );

    expect(getByTestId('calendar-legend-event-icon')).toBeTruthy();
  });

  test('waits for the session headers before showing an API memory image', async () => {
    let resolveHeaders: (headers: Record<string, string>) => void = () => undefined;
    jest.mocked(getAuthenticationHeaders).mockReturnValue(
      new Promise((resolve) => {
        resolveHeaders = resolve;
      })
    );

    const { queryByTestId } = await Promise.resolve(
      render(
        <Calendar
          initialDate="2025-05-01"
          dayMarks={{
            '2025-05-08': {
              status: 'realized',
              imageUrl: `${API_BASE_URL}/api/events/event-1/memories/memory-1/image`,
            },
          }}
        />
      )
    );

    expect(queryByTestId('calendar-day-image-2025-05-08')).toBeNull();

    await act(async () => {
      resolveHeaders({ Authorization: 'Bearer token' });
      await Promise.resolve();
    });

    expect(queryByTestId('calendar-day-image-2025-05-08')).toBeTruthy();
  });
});
