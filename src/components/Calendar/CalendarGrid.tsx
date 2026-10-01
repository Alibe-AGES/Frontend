import { Pressable, Text, View } from 'react-native';

import { DayMark, DayStatus } from '@/components/Calendar/Calendar.types';

import { formatCalendarDate } from './calendar.utils';

interface CalendarDayProps {
  dateString: string;
  day: number;
  mark: DayMark;
  onPress?: (dateString: string) => void;
  onCreatePress?: (dateString: string) => void;
}

interface CalendarGridProps {
  monthDate: Date;
  dayMarks: Record<string, DayMark>;
  onDayPress?: (dateString: string) => void;
  onDayCreatePress?: (dateString: string) => void;
}

interface DayContentProps {
  status: DayStatus;
  day: number;
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
  past: 'text-inkSoft/20',
  pastEvent: 'text-ink',
};

function getAvailableUserCount(mark: DayMark): number {
  const value: unknown = mark.availableUserCount;
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function getAllUsersAvailable(mark: DayMark): boolean {
  const value: unknown = mark.allUsersAvailable;
  return typeof value === 'boolean' && value;
}

function getDisplayStatus(dateString: string, eventCount: number, status: DayStatus): DayStatus {
  if (dateString >= formatCalendarDate(new Date())) {
    return status;
  }

  if (eventCount > 0 || status === 'realized' || status === 'suggested') {
    return status === 'normal' ? 'pastEvent' : status;
  }

  return 'past';
}

function formatEventCount(eventCount: number): string {
  const noun = eventCount === 1 ? 'evento' : 'eventos';
  return `${String(eventCount)} ${noun}`;
}

function formatAvailability(
  availableUserCount: number,
  allUsersAvailable: boolean
): string | undefined {
  if (allUsersAvailable) {
    return 'todos disponíveis';
  }

  if (availableUserCount === 0) {
    return undefined;
  }

  const noun = availableUserCount === 1 ? 'disponível' : 'disponíveis';
  return `${String(availableUserCount)} ${noun}`;
}

function getAccessibilityLabel(
  dateString: string,
  eventCount: number,
  availableUserCount: number,
  allUsersAvailable: boolean
): string {
  const details = [`Dia ${dateString}`];

  if (eventCount > 0) {
    details.push(formatEventCount(eventCount));
  }

  const availability = formatAvailability(availableUserCount, allUsersAvailable);
  if (availability) {
    details.push(availability);
  }

  return details.join(', ');
}

function DayContent({ status, day }: DayContentProps) {
  if (status === 'suggested') {
    return <Text className="text-xl text-canvas">☆</Text>;
  }

  return <Text className={`text-sm font-medium ${dayTextClasses[status]}`}>{String(day)}</Text>;
}

function DayIndicators({
  dot,
  hasPartialAvailability,
  dateString,
}: {
  dot: DayMark['dot'];
  hasPartialAvailability: boolean;
  dateString: string;
}) {
  if (!dot && !hasPartialAvailability) {
    return null;
  }

  return (
    <View className="absolute bottom-0 flex-row items-center gap-1">
      {dot ? (
        <View
          className={`h-2 w-2 rounded-full ${dot === 'pink' ? 'bg-pink' : 'bg-coral'}`}
          testID={`calendar-proposal-indicator-${dateString}`}
        />
      ) : null}
      {hasPartialAvailability ? (
        <View
          className="h-2 w-2 rounded-full bg-coral"
          testID={`calendar-availability-indicator-${dateString}`}
        />
      ) : null}
    </View>
  );
}

function CalendarDayCell({ dateString, day, mark, onPress, onCreatePress }: CalendarDayProps) {
  const eventCount = mark.eventIds?.length ?? 0;
  const availableUserCount = getAvailableUserCount(mark);
  const allUsersAvailable = getAllUsersAvailable(mark);
  const displayStatus = getDisplayStatus(dateString, eventCount, mark.status);
  const accessibilityLabel = getAccessibilityLabel(
    dateString,
    eventCount,
    availableUserCount,
    allUsersAvailable
  );

  const isFutureOrToday = dateString >= formatCalendarDate(new Date());

  return (
    <View className="relative h-11 flex-1 items-center justify-center">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ disabled: displayStatus === 'past' }}
        disabled={displayStatus === 'past'}
        className="h-full w-full items-center justify-center"
        onPress={() => {
          onPress?.(dateString);
        }}
      >
        <View
          className={`h-9 w-9 items-center justify-center rounded-lg ${dayContainerClasses[displayStatus]}`}
        >
          <DayContent
            status={displayStatus}
            day={day}
          />
        </View>

        <DayIndicators
          dot={mark.dot}
          hasPartialAvailability={availableUserCount > 0 && !allUsersAvailable}
          dateString={dateString}
        />
      </Pressable>
      {onCreatePress && isFutureOrToday ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Criar encontro em ${dateString}`}
          hitSlop={3}
          className="absolute right-0 top-0 z-10 h-5 w-5 items-center justify-center rounded-full bg-lime"
          onPress={() => {
            onCreatePress(dateString);
          }}
          testID={`calendar-create-${dateString}`}
        >
          <Text className="text-xs font-bold text-ink">+</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function CalendarGrid({
  monthDate,
  dayMarks,
  onDayPress,
  onDayCreatePress,
}: CalendarGridProps) {
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
  const completeWeeks = weeks.map((week) => [
    ...week,
    ...Array.from({ length: 7 - week.length }, () => null),
  ]);

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
        {completeWeeks.map((week, weekIndex) => (
          <View
            key={`week-${String(weekIndex)}`}
            className="flex-row"
            testID={`calendar-week-${String(weekIndex)}`}
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
                  onCreatePress={onDayCreatePress}
                />
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}
