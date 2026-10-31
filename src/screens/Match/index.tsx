import type { GroupMember } from '@/server/groups';
import { theme } from '@/theme';
import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from 'twrnc';

import Logo from '@/assets/images/Logo.svg';
import OrangeDecoration from '@/assets/images/group-spin-orange.svg';
import PinkDecoration from '@/assets/images/pink-spin.svg';
import { Button } from '@/components/Button';

export interface MatchScreenProps {
  participants: GroupMember[];
  currentUserId?: string;
  isLoadingParticipants: boolean;
  isConfirmDisabled: boolean;
  onConfirm: () => void;
}

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

export function MatchScreen({
  participants,
  currentUserId,
  isLoadingParticipants,
  isConfirmDisabled,
  onConfirm,
}: MatchScreenProps) {
  const orderedParticipants = [
    ...participants.filter((participant) => participant.id === currentUserId),
    ...participants.filter((participant) => participant.id !== currentUserId),
  ];
  let participantContent: ReactNode;

  if (isLoadingParticipants) {
    participantContent = (
      <ActivityIndicator
        accessibilityLabel="Carregando participantes"
        color={theme.colors.ink}
        testID="match-participants-loading"
      />
    );
  } else if (orderedParticipants.length === 0) {
    participantContent = (
      <Text className="text-center font-poppins text-sm text-wine">
        Participantes do grupo indisponíveis.
      </Text>
    );
  } else {
    participantContent = orderedParticipants.map((participant) => (
      <View
        key={participant.id}
        className="w-1/2 items-center gap-1"
        testID={`match-participant-${participant.id}`}
      >
        <View className="h-14 w-14 overflow-hidden rounded-full bg-pink">
          {participant.profilePic ? (
            <Image
              source={{ uri: participant.profilePic }}
              accessible
              accessibilityLabel={`Foto de ${participant.name}`}
              contentFit="cover"
              style={tw`h-full w-full`}
            />
          ) : null}
        </View>
        <Text
          className="font-poppins text-xs text-wine"
          numberOfLines={1}
        >
          {participant.id === currentUserId ? 'Eu' : firstName(participant.name)}
        </Text>
      </View>
    ));
  }

  return (
    <SafeAreaView
      edges={['top', 'left', 'right', 'bottom']}
      className="flex-1 bg-canvas"
      testID="match-screen"
    >
      <View className="flex-1 items-center px-6 pb-5 pt-3">
        <View
          accessible
          accessibilityRole="image"
          accessibilityLabel="Alibe"
          className="aspect-[269/133] w-36"
          testID="match-logo"
        >
          <Logo
            width="100%"
            height="100%"
          />
        </View>

        <Text
          accessibilityRole="header"
          className="mt-1 text-center font-poppins-medium text-2xl leading-8 text-ink"
          testID="match-headline"
        >
          Vocês tem um álibi!
        </Text>
        <Text className="mt-2 max-w-xs text-center font-poppins text-sm leading-5 text-wine">
          Vocês gostaram do mesmo local e agora já podem marcar o próximo evento.
        </Text>

        <View
          className="mt-10 w-full max-w-xs flex-row flex-wrap justify-center gap-y-5"
          testID="match-participants"
        >
          {participantContent}
        </View>

        <View
          accessible={false}
          className="pointer-events-none absolute inset-x-0 bottom-20 h-40 flex-row items-end justify-between overflow-hidden"
        >
          <OrangeDecoration
            width={136}
            height={138}
          />
          <PinkDecoration
            width={156}
            height={166}
          />
        </View>

        <View className="mt-auto w-full px-2 pt-8">
          <Button
            title="Criar evento"
            variant="tertiary"
            disabled={isConfirmDisabled}
            onPress={onConfirm}
            testID="match-create-event"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
