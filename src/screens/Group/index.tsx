import { BackButton } from '@/components/BackButton';
import { Calendar } from '@/components/Calendar';
import { DayMark } from '@/components/Calendar/Calendar.types';
import { NavigationBar } from '@/components/NavigationBar';
import { CalendarDay, getGroupCalendar } from '@/server/calendar';
import { getGroup, getGroupMembers, GroupMember } from '@/server/groups';
import { theme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

function formatDate(date: Date): string {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function buildDayMarks(days: CalendarDay[], today: string): Record<string, DayMark> {
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

  return new Proxy(marks, {
    get(target, date: string) {
      const mark = target[date];

      if (mark) {
        return mark;
      }

      if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date) && date < today) {
        return { status: 'past' as const };
      }

      return undefined;
    },
  });
}

export function GroupScreen() {
  const router = useRouter();
  const { id: groupId } = useLocalSearchParams<{ id: string }>();

  const [members, setMembers] = useState<GroupMember[]>([]);
  const [groupName, setGroupName] = useState('');
  const [groupPhoto, setGroupPhoto] = useState<string | null>(null);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const now = new Date();
    return { month: now.getMonth() + 1, year: now.getFullYear() };
  });

  const today = formatDate(new Date());

  const dayMarks = useMemo(() => buildDayMarks(calendarDays, today), [calendarDays, today]);

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

  const loadGroup = useCallback(async () => {
    if (!groupId) {
      return;
    }

    try {
      const data = await getGroup(groupId);
      setGroupName(data.name);
      setGroupPhoto(data.profilePic);
    } catch (error) {
      console.error('Erro ao buscar o grupo', error);
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
    void loadGroup();
  }, [loadMembers, loadGroup]);

  useEffect(() => {
    void loadCalendar();
  }, [loadCalendar]);

  useFocusEffect(
    useCallback(() => {
      void loadMembers();
      void loadGroup();
      void loadCalendar();
    }, [loadMembers, loadGroup, loadCalendar])
  );

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

  const handleOpenInfo = () => {
    if (!groupId) {
      return;
    }

    router.push({ pathname: '/group/[id]/info', params: { id: groupId } });
  };

  const membersText = members.map((member) => member.name).join(', ');

  return (
    <View className="flex-1 bg-canvas">
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-6 px-6 pb-32 pt-16"
        testID="group-screen"
      >
        <View className="flex-row items-center">
          <BackButton
            fallbackHref="/groups"
            accessibilityLabel="Voltar para meus grupos"
          />

          <Text className="flex-1 pr-10 text-center text-3xl font-black text-ink">
            Calendário do grupo
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ver informações do grupo"
          onPress={handleOpenInfo}
          className="flex-row items-center gap-3 rounded-2xl bg-surface p-3"
          testID="group-screen-members"
        >
          <View className="h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-coral">
            {groupPhoto ? (
              <Image
                source={{ uri: groupPhoto }}
                accessibilityLabel={`Foto do grupo ${groupName}`}
                contentFit="cover"
                className="h-14 w-14 rounded-full"
                testID="group-screen-photo"
              />
            ) : (
              <Ionicons
                name="people-outline"
                size={26}
                color={theme.colors.coral}
                testID="group-screen-photo-placeholder"
              />
            )}
          </View>

          <View className="flex-1">
            <Text
              className="font-poppins-semibold text-lg text-wine"
              numberOfLines={1}
            >
              {groupName}
            </Text>

            {members.length > 0 ? (
              <Text
                className="font-poppins text-sm text-wine"
                numberOfLines={1}
                testID="group-screen-members-names"
              >
                {membersText}
              </Text>
            ) : (
              <Text className="text-inkSoft text-sm font-medium">
                Nenhum membro encontrado neste grupo.
              </Text>
            )}
          </View>
        </Pressable>

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
