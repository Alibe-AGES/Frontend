import { Avatar } from '@/components/Avatar';
import { theme } from '@/theme';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

export interface AvailabilityParticipant {
  readonly id: string;
  readonly name: string;
  readonly photoUri: string | null;
  readonly isCurrentUser: boolean;
  readonly availableAllDay: boolean;
  /** Pairs of `HH:MM` start and end times. */
  readonly intervals: readonly (readonly [string, string])[];
}

export interface AvailableParticipantsProps {
  readonly participants: AvailabilityParticipant[];
}

const PER_ROW = 5;
const SLOT_PERCENT = 100 / PER_ROW;
const CURRENT_USER_LABEL = 'Eu';

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] ?? name;
}

function displayName(participant: AvailabilityParticipant) {
  return participant.isCurrentUser ? CURRENT_USER_LABEL : firstName(participant.name);
}

function describeAvailability(participant: AvailabilityParticipant): string[] {
  if (participant.availableAllDay) {
    return ['Dia todo'];
  }

  return participant.intervals.map(([start, end]) => `${start} – ${end}`);
}

function chunk<T>(items: T[], size: number): T[][] {
  const rows: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    rows.push(items.slice(index, index + size));
  }

  return rows;
}

interface IntervalsTooltipProps {
  readonly participant: AvailabilityParticipant;
  readonly caretLeftPercent: number;
}

function IntervalsTooltip({ participant, caretLeftPercent }: IntervalsTooltipProps) {
  return (
    <View
      className="pt-2"
      testID={`availability-participant-${participant.id}-tooltip`}
    >
      <View
        className="absolute top-0 h-4 w-4 -translate-x-2 rotate-45 bg-ink"
        style={{ left: `${caretLeftPercent.toString()}%` as `${number}%` }}
      />
      <View className="gap-1 rounded-2xl bg-ink px-4 py-3">
        <Text className="font-poppins-semibold text-sm text-white">
          {participant.isCurrentUser ? 'Seus horários' : participant.name}
        </Text>
        {describeAvailability(participant).map((line) => (
          <Text
            key={line}
            className="font-poppins text-sm text-white"
          >
            {line}
          </Text>
        ))}
      </View>
    </View>
  );
}

export function AvailableParticipants({ participants }: AvailableParticipantsProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // The current user comes first so they can spot themselves at a glance.
  const ordered = [
    ...participants.filter((participant) => participant.isCurrentUser),
    ...participants.filter((participant) => !participant.isCurrentUser),
  ];

  return (
    <View
      className="gap-4 px-2"
      testID="availability-screen-participants"
    >
      {chunk(ordered, PER_ROW).map((row) => {
        const selected = row.find((participant) => participant.id === selectedId);
        const selectedIndex = selected ? row.indexOf(selected) : -1;
        // Rows are centered, so a short row starts after the empty slots split on both sides.
        const caretLeftPercent = ((PER_ROW - row.length) / 2 + selectedIndex + 0.5) * SLOT_PERCENT;

        return (
          <View key={row.map((participant) => participant.id).join('|')}>
            <View className="flex-row justify-center">
              {row.map((participant) => {
                const isSelected = participant.id === selectedId;

                return (
                  <Pressable
                    key={participant.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Ver horários de ${participant.name}`}
                    accessibilityState={{ expanded: isSelected }}
                    className="w-1/5 items-center gap-1 px-1"
                    onPress={() => {
                      setSelectedId(isSelected ? null : participant.id);
                    }}
                    testID={`availability-participant-${participant.id}`}
                  >
                    {/* The border stays mounted and only changes color: toggling the border on a
                        clipped, rounded view makes Android stop drawing its children. */}
                    <View
                      className="h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 bg-pink"
                      style={{ borderColor: isSelected ? theme.colors.ink : 'transparent' }}
                      testID={`availability-participant-${participant.id}-ring`}
                    >
                      <Avatar
                        photoUri={participant.photoUri}
                        accessibilityLabel={`Foto de ${participant.name}`}
                        imageClassName="h-12 w-12 rounded-full"
                        iconSize={22}
                        fallbackIconName="person-outline"
                        fallbackIconColor={theme.colors.wine}
                        testID={`availability-participant-${participant.id}-avatar`}
                      />
                    </View>
                    <Text
                      className="font-poppins text-sm text-wine"
                      numberOfLines={1}
                    >
                      {displayName(participant)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {selected ? (
              <IntervalsTooltip
                participant={selected}
                caretLeftPercent={caretLeftPercent}
              />
            ) : null}
          </View>
        );
      })}
    </View>
  );
}
