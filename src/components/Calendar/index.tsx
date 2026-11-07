import { useState } from 'react';
import { Text, View } from 'react-native';

import { CalendarProps } from '@/components/Calendar/Calendar.types';

import { CalendarGrid } from './CalendarGrid';
import { CalendarHeader } from './CalendarHeader';
import { CalendarLegend } from './CalendarLegend';
import { formatCalendarDate } from './calendar.utils';

export function Calendar({
  initialDate,
  dayMarks = {},
  onDayPress,
  onDayCreatePress,
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
    <View
      className="relative mt-4 rounded-3xl border border-ink px-3 pb-3 pt-10"
      testID={testID}
    >
      <View className="absolute -top-4 left-0 right-0 z-10 items-center">
        <CalendarHeader
          monthDate={monthDate}
          onPreviousMonth={() => {
            changeMonth(-1);
          }}
          onNextMonth={() => {
            changeMonth(1);
          }}
        />
      </View>

      <CalendarGrid
        monthDate={monthDate}
        dayMarks={dayMarks}
        onDayPress={onDayPress}
        onDayCreatePress={onDayCreatePress}
      />

      {showLegend ? <CalendarLegend /> : null}

      <View className="mt-4 items-center rounded-full bg-pink px-3 py-2">
        <Text className="text-center text-sm font-medium text-ink underline">
          Toque nos dias para ver mais detalhes.
        </Text>
      </View>
    </View>
  );
}
