import { Pressable, Text, View } from 'react-native';

import { DayMark, DayStatus } from '@/components/Calendar/Calendar.types';

import { formatCalendarDate } from './calendar.utils';

interface CalendarDayProps {
  dateString: string;
  day: number;
  mark: DayMark;
  onPress?: (dateString: string) => void;
}

interface CalendarGridProps {
  monthDate: Date;
  dayMarks: Record<string, DayMark>;
  onDayPress?: (dateString: string) => void;
}

const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

const dayContainerClasses: Record<DayStatus, string> = {
  normal: 'bg-transparent',
  available: 'bg-lime',
  realized: 'bg-ink',
  suggested: 'bg-pink',
  allAvailable: 'bg-coral',
  past: 'bg-gray-200',
  pastEvent: 'bg-gray-200',
};

const dayTextClasses: Record<DayStatus, string> = {
  normal: 'text-ink',
  available: 'text-ink',
  realized: 'text-canvas',
  suggested: 'text-canvas',
  allAvailable: 'text-canvas',
  past: 'text-inkSoft/50',
  pastEvent: 'text-ink',
};

function CalendarDayCell({ dateString, day, mark, onPress }: CalendarDayProps) {
  const eventCount = mark.eventIds?.length ?? 0;
  const isPastDate = dateString < formatCalendarDate(new Date());
  const displayStatus = isPastDate ? (eventCount > 0 ? 'pastEvent' : 'past') : mark.status;
  const accessibilityLabel =
    eventCount > 0 ? `Dia ${dateString}, ${String(eventCount)} eventos` : `Dia ${dateString}`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: displayStatus === 'past' }}
      disabled={displayStatus === 'past'}
      className="h-11 flex-1 items-center justify-center"
      onPress={() => {
        onPress?.(dateString);
      }}
    >
      <View
        className={`h-9 w-9 items-center justify-center rounded-lg ${dayContainerClasses[displayStatus]}`}
      >
        {displayStatus === 'suggested' ? (
          <Text className="text-xl text-canvas">☆</Text>
        ) : (
          <Text className={`text-sm font-medium ${dayTextClasses[displayStatus]}`}>
            {String(day)}
          </Text>
        )}
      </View>

      {eventCount > 0 ? (
        <View className="absolute right-0 top-0 min-h-4 min-w-4 items-center justify-center rounded-full bg-coral px-1">
          <Text className="text-xs font-bold text-canvas">{String(eventCount)}</Text>
        </View>
      ) : null}

      {mark.dot === 'pink' ? (
        <View className="absolute bottom-0 h-2 w-2 rounded-full bg-pink" />
      ) : null}
      {mark.dot === 'coral' ? (
        <View className="absolute bottom-0 h-2 w-2 rounded-full bg-coral" />
      ) : null}
    </Pressable>
  );
}

export function CalendarGrid({ monthDate, dayMarks, onDayPress }: CalendarGridProps) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const slots: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];
  const weeks = Array.from({ length: Math.ceil(slots.length / 7) }, (_, weekIndex) =>
    slots.slice(weekIndex * 7, weekIndex * 7 + 7)
  );

  return (
    <View>
      <View className="mb-2 flex-row">
        {weekDays.map((weekDay) => (
          <Text
            key={weekDay}
            className="flex-1 py-1 text-center text-xs font-medium text-ink"
          >
            {weekDay}
          </Text>
        ))}
      </View>

      <View className="gap-1">
        {weeks.map((week, weekIndex) => (
          <View
            key={`week-${String(weekIndex)}`}
            className="flex-row"
          >
            {week.map((day, dayIndex) => {
              if (day === null) {
                return (
                  <View
                    key={`empty-${String(weekIndex)}-${String(dayIndex)}`}
                    className="h-11 flex-1"
                  />
                );
              }

              const dateString = formatCalendarDate(new Date(year, month, day));

              return (
                <CalendarDayCell
                  key={dateString}
                  dateString={dateString}
                  day={day}
                  mark={dayMarks[dateString] ?? { status: 'normal' }}
                  onPress={onDayPress}
                />
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}
