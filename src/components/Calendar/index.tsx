import { useCallback, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Calendar as RNCalendar } from 'react-native-calendars';

import {
  CalendarDay,
  CalendarProps,
  DayMark,
  DayStatus,
  LegendVariant,
} from '@/components/Calendar/Calendar.types';

interface CalendarDayProps {
  date?: CalendarDay;
  mark: DayMark;
  onPress?: (dateString: string) => void;
}

interface CalendarHeaderProps {
  date: string;
  onPrevious: () => void;
  onNext: () => void;
}

interface LegendProps {
  label: string;
  variant: LegendVariant;
}

const dayContainerClasses: Record<DayStatus, string> = {
  normal: 'bg-transparent',
  available: 'bg-lime',
  realized: 'bg-ink',
  suggested: 'bg-pink',
  allAvailable: 'bg-coral',
  past: 'bg-transparent',
};

const dayTextClasses: Record<DayStatus, string> = {
  normal: 'text-ink',
  available: 'text-ink',
  realized: 'text-canvas',
  suggested: 'text-canvas',
  allAvailable: 'text-canvas',
  past: 'text-inkSoft/40',
};

function formatCalendarDate(date: Date): string {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getNextMonth(dateString: string): string {
  const date = new Date(`${dateString}T12:00:00`);

  date.setMonth(date.getMonth() + 1);

  return formatCalendarDate(date);
}

function getPreviousMonth(dateString: string): string {
  const date = new Date(`${dateString}T12:00:00`);

  date.setMonth(date.getMonth() - 1);

  return formatCalendarDate(date);
}

function CalendarHeader({ date, onPrevious, onNext }: CalendarHeaderProps) {
  const headerDate = new Date(`${date}T12:00:00`);

  const month = headerDate.toLocaleDateString('pt-BR', {
    month: 'long',
  });

  return (
    <View className="mb-3 flex-row items-center justify-between rounded-full bg-pink px-4 py-2">
      <Pressable
        accessibilityLabel="Mês anterior"
        accessibilityRole="button"
        className="h-8 w-8 items-center justify-center"
        onPress={onPrevious}
      >
        <Text className="text-3xl leading-7 text-ink">‹</Text>
      </Pressable>

      <Text className="text-xl font-black capitalize text-ink">{month}</Text>

      <Pressable
        accessibilityLabel="Próximo mês"
        accessibilityRole="button"
        className="h-8 w-8 items-center justify-center"
        onPress={onNext}
      >
        <Text className="text-3xl leading-7 text-ink">›</Text>
      </Pressable>
    </View>
  );
}

function DayCell({ date, mark, onPress }: CalendarDayProps) {
  if (!date) {
    return <View className="h-11 w-11" />;
  }

  const containerClass = dayContainerClasses[mark.status];
  const textClass = dayTextClasses[mark.status];
  const isPast = mark.status === 'past';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Dia ${date.dateString}`}
      accessibilityState={{ disabled: isPast }}
      disabled={isPast}
      className="h-11 w-11 items-center justify-center"
      onPress={() => {
        onPress?.(date.dateString);
      }}
    >
      <View className={`h-9 w-9 items-center justify-center rounded-lg ${containerClass}`}>
        {mark.status === 'suggested' ? (
          <Text className="text-xl text-canvas">☆</Text>
        ) : (
          <Text className={`text-sm font-medium ${textClass}`}>{String(date.day)}</Text>
        )}
      </View>

      {mark.dot === 'pink' ? (
        <View className="absolute bottom-0 h-2 w-2 rounded-full bg-pink" />
      ) : null}

      {mark.dot === 'coral' ? (
        <View className="absolute bottom-0 h-2 w-2 rounded-full bg-coral" />
      ) : null}
    </Pressable>
  );
}

function Legend({ label, variant }: LegendProps) {
  return (
    <View className="flex-row items-center gap-2">
      {variant === 'pink' ? <View className="h-5 w-5 rounded-full bg-pink" /> : null}

      {variant === 'lime' ? <View className="h-5 w-5 rounded-full bg-lime" /> : null}

      {variant === 'coral' ? <View className="h-5 w-5 rounded-full bg-coral" /> : null}

      {variant === 'ink' ? <View className="h-5 w-5 rounded-full bg-ink" /> : null}

      <Text className="text-inkSoft text-sm font-medium">{label}</Text>
    </View>
  );
}

interface CalendarDayCellProps {
  date?: CalendarDay;
  dayMarks: Record<string, DayMark>;
  onDayPress?: (dateString: string) => void;
}

function CalendarDayCell({ date, dayMarks, onDayPress }: CalendarDayCellProps) {
  return (
    <DayCell
      date={date}
      mark={date ? (dayMarks[date.dateString] ?? { status: 'normal' }) : { status: 'normal' }}
      onPress={onDayPress}
    />
  );
}

export function Calendar({
  initialDate,
  dayMarks = {},
  onDayPress,
  onMonthChange,
  showLegend = false,
  testID = 'alibe-calendar',
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState<string>(
    initialDate ?? formatCalendarDate(new Date())
  );

  const changeMonth = (dateString: string) => {
    setCurrentDate(dateString);
    onMonthChange?.(dateString);
  };

  const renderDay = useCallback(
    (props: { date?: CalendarDay }) => (
      <CalendarDayCell
        date={props.date}
        dayMarks={dayMarks}
        onDayPress={onDayPress}
      />
    ),
    [dayMarks, onDayPress]
  );

  return (
    <View testID={testID}>
      <CalendarHeader
        date={currentDate}
        onPrevious={() => {
          changeMonth(getPreviousMonth(currentDate));
        }}
        onNext={() => {
          changeMonth(getNextMonth(currentDate));
        }}
      />

      <RNCalendar
        current={currentDate}
        hideArrows
        hideExtraDays
        enableSwipeMonths
        firstDay={0}
        dayComponent={renderDay}
        onMonthChange={(month: { dateString: string }) => {
          changeMonth(month.dateString);
        }}
        style={{
          backgroundColor: 'transparent',
        }}
      />

      {showLegend ? (
        <View className="mt-4 gap-2">
          <Legend
            label="Sugestão de encontro"
            variant="pink"
          />

          <Legend
            label="Alguém disponível"
            variant="lime"
          />

          <Legend
            label="Todos estão disponíveis"
            variant="coral"
          />

          <Legend
            label="Encontros realizados"
            variant="ink"
          />

          <View className="flex-row items-center gap-2">
            <View className="h-5 w-5 items-center justify-center rounded bg-pink">
              <Text className="text-sm text-canvas">☆</Text>
            </View>

            <Text className="text-inkSoft text-sm font-medium">Encontro marcado</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}
