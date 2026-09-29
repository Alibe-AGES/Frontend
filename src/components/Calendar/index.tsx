import { useState } from 'react';
import { View } from 'react-native';

import { CalendarProps } from '@/components/Calendar/Calendar.types';

import { CalendarGrid } from './CalendarGrid';
import { CalendarHeader } from './CalendarHeader';
import { CalendarLegend } from './CalendarLegend';
import { formatCalendarDate } from './calendar.utils';

export function Calendar({
  initialDate,
  dayMarks = {},
  onDayPress,
  onMonthChange,
  showLegend = false,
  testID = 'alibe-calendar',
}: CalendarProps) {
  const [monthDate, setMonthDate] = useState(() => {
    const dateString = initialDate ?? formatCalendarDate(new Date());
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  });

  const changeMonth = (offset: number) => {
    const nextMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + offset, 1);
    setMonthDate(nextMonth);
    onMonthChange?.(formatCalendarDate(nextMonth));
  };

  return (
    <View testID={testID}>
      <CalendarHeader
        monthDate={monthDate}
        onPreviousMonth={() => {
          changeMonth(-1);
        }}
        onNextMonth={() => {
          changeMonth(1);
        }}
      />

      <CalendarGrid
        monthDate={monthDate}
        dayMarks={dayMarks}
        onDayPress={onDayPress}
      />

      {showLegend ? <CalendarLegend /> : null}
    </View>
  );
}
