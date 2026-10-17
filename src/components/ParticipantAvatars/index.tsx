import { theme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { FC } from 'react';
import { Text, View } from 'react-native';
import tw from 'twrnc';
import { Participant, ParticipantAvatarsProps } from './ParticipantAvatars.types';

export type {
  Participant,
  ParticipantAnswer,
  ParticipantAvatarsProps,
} from './ParticipantAvatars.types';

const CURRENT_USER_LABEL = 'Eu';

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

export const ParticipantAvatars: FC<ParticipantAvatarsProps> = ({
  participants,
  currentUserId,
  emptyMessage = 'Nenhum participante encontrado.',
  testID = 'alibe-participant-avatars',
}) => {
  if (participants.length === 0) {
    return (
      <Text
        className="text-center font-poppins text-sm text-wine"
        testID={`${testID}-empty`}
      >
        {emptyMessage}
      </Text>
    );
  }

  const ordered: Participant[] = [
    ...participants.filter((participant) => participant.id === currentUserId),
    ...participants.filter((participant) => participant.id !== currentUserId),
  ];

  return (
    <View
      className="flex-row flex-wrap justify-center gap-4"
      testID={testID}
    >
      {ordered.map((participant) => {
        const label =
          participant.id === currentUserId ? CURRENT_USER_LABEL : firstName(participant.name);

        return (
          <View
            key={participant.id}
            className="w-14 items-center gap-1"
            testID={`${testID}-${participant.id}`}
          >
            <View className="relative h-12 w-12 items-center justify-center">
              <View className="h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-pink">
                {participant.profilePic ? (
                  <Image
                    source={{ uri: participant.profilePic }}
                    accessible
                    accessibilityLabel={`Foto de ${participant.name}`}
                    contentFit="cover"
                    style={tw`h-full w-full`}
                    testID={`${testID}-${participant.id}-photo`}
                  />
                ) : (
                  <Ionicons
                    name="person-outline"
                    size={22}
                    color={theme.colors.wine}
                    testID={`${testID}-${participant.id}-placeholder`}
                  />
                )}
              </View>
              {participant.answer === 'yes' ? (
                <View
                  accessibilityLabel="Presença confirmada"
                  className="absolute -bottom-1 left-0 right-0 items-center"
                  testID={`${testID}-${participant.id}-badge-yes`}
                >
                  <View className="h-5 w-5 items-center justify-center rounded-full bg-ink">
                    <Ionicons
                      name="checkmark"
                      size={12}
                      color={theme.colors.white}
                    />
                  </View>
                </View>
              ) : participant.answer === 'no' ? (
                <View
                  accessibilityLabel="Não vai participar"
                  className="absolute -bottom-1 left-0 right-0 items-center"
                  testID={`${testID}-${participant.id}-badge-no`}
                >
                  <View className="h-5 w-5 items-center justify-center rounded-full bg-coral">
                    <Ionicons
                      name="close"
                      size={12}
                      color={theme.colors.white}
                    />
                  </View>
                </View>
              ) : null}
            </View>
            <Text
              className="font-poppins text-sm text-wine"
              numberOfLines={1}
            >
              {label}
            </Text>
          </View>
        );
      })}
    </View>
  );
};
