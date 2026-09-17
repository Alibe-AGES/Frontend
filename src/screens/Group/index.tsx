import { Calendar } from '@/components/Calendar';
import { DayMark } from '@/components/Calendar/Calendar.types';
import { NavigationBar } from '@/components/NavigationBar';
import { CalendarDay, getGroupCalendar } from '@/server/calendar';
import { getGroupMembers, GroupMember } from '@/server/groups';
import { theme } from '@/theme';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

function formatDate(date: Date): string {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function buildDayMarks(days: CalendarDay[]): Record<string, DayMark> {
  const marks: Record<string, DayMark> = {};

  for (const day of days) {
    if (day.scheduledEventIds.length > 0) {
      marks[day.date] = {
        status: 'suggested',
        dot: day.proposalIds.length > 0 ? 'pink' : undefined,
      };
    } else if (day.completedEventIds.length > 0) {
      marks[day.date] = {
        status: 'realized',
        dot: day.proposalIds.length > 0 ? 'pink' : undefined,
      };
    } else if (day.allUsersAvailable) {
      marks[day.date] = {
        status: 'allAvailable',
        dot: day.proposalIds.length > 0 ? 'pink' : undefined,
      };
    } else if (day.availableUserIds.length > 0) {
      marks[day.date] = {
        status: 'available',
        dot: day.proposalIds.length > 0 ? 'pink' : undefined,
      };
    } else if (day.proposalIds.length > 0) {
      marks[day.date] = { status: 'normal', dot: 'pink' };
    }
  }

  return marks;
}

interface MemberItemProps {
  member: GroupMember;
  isAvailable: boolean;
}

function MemberItem({ member, isAvailable }: MemberItemProps) {
  const photoUri =
    member.profilePic ??
    `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`;

  return (
    <View
      className="items-center gap-1"
      testID={`group-screen-member-${member.id}`}
    >
      <Image
        source={{ uri: photoUri }}
        accessibilityLabel={member.name}
        contentFit="cover"
        className="h-14 w-14 rounded-full border-2 border-canvas"
      />

      <View
        accessibilityLabel={
          isAvailable ? `${member.name} disponível` : `${member.name} indisponível`
        }
        className={`h-2.5 w-2.5 rounded-full ${isAvailable ? 'bg-lime' : 'bg-inkSoft'}`}
        testID={`group-screen-member-${member.id}-status`}
      />

      <Text
        className="max-w-16 text-center text-xs font-medium text-ink"
        numberOfLines={1}
      >
        {member.name}
      </Text>
    </View>
  );
}

export function GroupScreen() {
  const router = useRouter();
  const { id: groupId } = useLocalSearchParams<{ id: string }>();

  const [members, setMembers] = useState<GroupMember[]>([]);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const now = new Date();
    return { month: now.getMonth() + 1, year: now.getFullYear() };
  });

  const today = formatDate(new Date());

  const dayMarks = useMemo(() => buildDayMarks(calendarDays), [calendarDays]);

  const availableMemberIds = useMemo(() => {
    const todayEntry = calendarDays.find((day) => day.date === today);
    return new Set(todayEntry?.availableUserIds ?? []);
  }, [calendarDays, today]);

  const loadMembers = useCallback(async () => {
    if (!groupId) {
      return;
    }

    try {
      const data = await getGroupMembers(groupId);
      setMembers(data);
    } catch (error) {
      console.error('Erro ao buscar membros do grupo', error);
    }
  }, [groupId]);

  const loadCalendar = useCallback(async () => {
    if (!groupId) {
      return;
    }

    try {
      const days = await getGroupCalendar(groupId, visibleMonth.month, visibleMonth.year);
      setCalendarDays(days);
    } catch (error) {
      console.error('Erro ao buscar o calendário do grupo', error);
    }
  }, [groupId, visibleMonth]);

  useEffect(() => {
    void loadMembers();
  }, [loadMembers]);

  useEffect(() => {
    void loadCalendar();
  }, [loadCalendar]);

  const handleDayPress = (dateString: string) => {
    if (!groupId) {
      return;
    }

    router.push({
      pathname: '/group/[id]/day/[date]/availability',
      params: { id: groupId, date: dateString },
    });
  };

  const handleMonthChange = (dateString: string) => {
    const [year, month] = dateString.split('-').map(Number);

    if (!year || !month) {
      return;
    }

    setVisibleMonth({ month, year });
  };

  return (
    <View className="flex-1 bg-canvas">
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-6 px-6 pb-32 pt-16"
        testID="group-screen"
      >
        <Text className="text-center text-3xl font-black text-ink">Calendário do grupo</Text>

        <View className="gap-3">
          <Text
            className="text-lg font-bold"
            style={{ color: theme.colors.wine }}
          >
            Membros
          </Text>

          {members.length > 0 ? (
            <View
              className="flex-row flex-wrap gap-4"
              testID="group-screen-members"
            >
              {members.map((member) => (
                <MemberItem
                  key={member.id}
                  member={member}
                  isAvailable={availableMemberIds.has(member.id)}
                />
              ))}
            </View>
          ) : (
            <Text className="text-inkSoft text-sm font-medium">
              Nenhum membro encontrado neste grupo.
            </Text>
          )}
        </View>

        <View className="rounded-3xl bg-surface p-4">
          <Calendar
            initialDate={today}
            dayMarks={dayMarks}
            onDayPress={handleDayPress}
            onMonthChange={handleMonthChange}
            showLegend
          />
        </View>
      </ScrollView>

      {groupId ? (
        <View className="absolute inset-x-0 bottom-0">
          <NavigationBar groupId={groupId} />
        </View>
      ) : null}
    </View>
  );
}
