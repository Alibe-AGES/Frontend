import type { GroupMember } from '@/server/groups';
import { theme } from '@/theme';
import type { ReactNode } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import Logo from '@/assets/images/Logo.svg';
import LimeCoralSpin from '@/assets/images/lime-coral-spin-2.svg';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { MatchHiFive } from '@/components/MatchHiFive';
import { ScreenFrame } from '@/components/ScreenFrame';

export interface MatchScreenProps {
  participants: GroupMember[];
  currentUserId?: string;
  isLoadingParticipants: boolean;
  isConfirmDisabled: boolean;
  onConfirm: () => void;
  onDismiss: () => void;
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
  onDismiss,
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
            imageClassName="h-[4rem] w-[4rem] rounded-full"
            fallbackIconName="person-outline"
            fallbackIconColor={theme.colors.wine}
            iconSize={30}
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
    <ScreenFrame
      padding="none"
      testID="match-screen"
      topFade
      backdrop={
        // Drawn for the top-right corner; turned 90° counterclockwise it fits the top-left one.
        <View className="absolute h-40 w-40">
          <LimeCoralSpin
            width="100%"
            height="100%"
          />
        </View>
      }
    >
      <View className="mt-28 flex-grow items-center">
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
      <View
        accessible={false}
        importantForAccessibility="no-hide-descendants"
        className="mt-auto w-full items-center"
      >
        {/* The spacing stays outside this box so the 3:2 drawing keeps its full size. */}
        <View
          className="aspect-[3/2] w-full max-w-md"
          testID="match-hi-five"
        >
          <MatchHiFive />
        </View>
      </View>
      <View className="flex-column gap-4 bg-canvas px-8 pb-8">
        <Button
          title="Criar evento"
          variant="tertiary"
          disabled={isConfirmDisabled}
          onPress={onConfirm}
          testID="match-create-event"
        />
        <Button
          title="Voltar a tela inicial"
          variant="secondary"
          testID="dismiss-match-create-event"
          onPress={onDismiss}
        />
      </View>
    </ScreenFrame>
  );
}
