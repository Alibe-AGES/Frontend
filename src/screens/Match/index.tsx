import type { GroupMember } from '@/server/groups';
import { theme } from '@/theme';
import type { ReactNode } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Logo from '@/assets/images/Logo.svg';
import OrangeDecoration from '@/assets/images/group-spin-orange.svg';
import PinkDecoration from '@/assets/images/pink-spin.svg';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { ScreenFrame } from '@/components/ScreenFrame';

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
        className="w-24 items-center gap-2"
        testID={`match-participant-${participant.id}`}
      >
        <View className="items-center justify-center overflow-hidden rounded-full bg-pink">
          <Avatar
            photoUri={participant.profilePic}
            accessibilityLabel={`Foto de ${participant.name}`}
            imageClassName="h-[4.5rem] w-[4.5rem] rounded-full"
            fallbackIconName="person-outline"
            fallbackIconColor={theme.colors.wine}
            iconSize={32}
            testID={`match-participant-${participant.id}-avatar`}
          />
        </View>
        <Text
          className="w-full text-center font-poppins text-xs text-wine"
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
    >
      <ScreenFrame
        padding="none"
        testID="match-screen"
        footer={
          <View className="bg-canvas px-8 pb-5 pt-4">
            <Button
              title="Criar evento"
              variant="tertiary"
              disabled={isConfirmDisabled}
              onPress={onConfirm}
              testID="match-create-event"
            />
          </View>
        }
        backdrop={
          <View
            accessible={false}
            className="absolute inset-x-0 bottom-20 h-40 flex-row items-end justify-between overflow-hidden"
          >
            <OrangeDecoration
              width={136}
              height={138}
            />
            <View style={{ transform: [{ rotate: '180deg' }] }}>
              <PinkDecoration
                width={156}
                height={166}
              />
            </View>
          </View>
        }
      >
        <View className="flex-grow items-center">
          <View
            accessible
            accessibilityRole="image"
            accessibilityLabel="Alibe"
            className="mt-16 aspect-[269/133] w-36"
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
          <Text className="mx-6 mt-2 max-w-xs text-center font-poppins text-sm leading-5 text-wine">
            Vocês gostaram do mesmo local e agora já podem marcar o próximo evento.
          </Text>

          <View
            className="mt-16 w-full max-w-52 flex-row flex-wrap justify-center gap-x-4 gap-y-6"
            testID="match-participants"
          >
            {participantContent}
          </View>
        </View>
      </ScreenFrame>
    </SafeAreaView>
  );
}
