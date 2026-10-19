import { BackButton } from '@/components/BackButton';
import { DatePickerSheet } from '@/components/DatePickerSheet';
import { EventCard, EventCardDraft } from '@/components/EventCard';
import { NavigationBar } from '@/components/NavigationBar';
import { Participant, ParticipantAvatars } from '@/components/ParticipantAvatars';
import type { SelectedPhoto } from '@/components/PhotoPicker/PhotoPicker.types';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

export type CreateEventTab = 'event' | 'suggestion';

export interface CreateEventScreenProps {
  groupId?: string;
  activeTab?: CreateEventTab;
  onSelectTab?: (tab: CreateEventTab) => void;
  draft: EventCardDraft;
  onChangeDraft: (draft: EventCardDraft) => void;
  onSelectDate: (dateString: string) => void;
  onImageSelected: (photo: SelectedPhoto) => void;
  participants: Participant[];
  currentUserId?: string;
  isLoadingParticipants: boolean;
  isConfirmDisabled: boolean;
  isSubmitting: boolean;
  onConfirm: () => void;
}

function EventTypeTabs({
  activeTab,
  onSelectTab,
}: {
  activeTab: CreateEventTab;
  onSelectTab?: (tab: CreateEventTab) => void;
}) {
  const isEventSelected = activeTab === 'event';
  const isSuggestionSelected = activeTab === 'suggestion';

  return (
    <View
      accessibilityRole="tablist"
      className="flex-1 flex-row gap-4"
    >
      <Pressable
        accessibilityRole="tab"
        accessibilityState={{ selected: isEventSelected }}
        className={`flex-1 items-center rounded-full py-3 ${
          isEventSelected ? 'bg-pink' : 'border border-pink'
        }`}
        onPress={() => {
          onSelectTab?.('event');
        }}
        testID="create-event-tab-event"
      >
        <Text
          className={`font-poppins-medium text-lg ${isEventSelected ? 'text-ink' : 'text-pink'}`}
        >
          Evento
        </Text>
      </Pressable>

      <Pressable
        accessibilityRole="tab"
        accessibilityState={{ selected: isSuggestionSelected }}
        className={`flex-1 items-center rounded-full py-3 ${
          isSuggestionSelected ? 'bg-pink' : 'border border-pink'
        }`}
        onPress={() => {
          onSelectTab?.('suggestion');
        }}
        testID="create-event-tab-suggestion"
      >
        <Text
          className={`font-poppins-medium text-lg ${
            isSuggestionSelected ? 'text-ink' : 'text-pink'
          }`}
        >
          Sugestão
        </Text>
      </Pressable>
    </View>
  );
}

export function CreateEventScreen({
  groupId,
  activeTab = 'event',
  onSelectTab,
  draft,
  onChangeDraft,
  onSelectDate,
  onImageSelected,
  participants,
  currentUserId,
  isLoadingParticipants,
  isConfirmDisabled,
  isSubmitting,
  onConfirm,
}: CreateEventScreenProps) {
  const [isDateSheetVisible, setIsDateSheetVisible] = useState(false);

  return (
    <View className="flex-1 bg-canvas">
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-4 px-6 pb-36 pt-16"
        keyboardShouldPersistTaps="handled"
        testID="create-event-screen"
      >
        <View className="flex-row items-center gap-4">
          <BackButton
            fallbackHref={groupId ? `/group/${groupId}` : '/groups'}
            accessibilityLabel="Voltar para o grupo"
          />
          <EventTypeTabs
            activeTab={activeTab}
            onSelectTab={onSelectTab}
          />
        </View>

        <EventCard
          mode="create"
          draft={draft}
          onChangeDraft={onChangeDraft}
          onDatePress={() => {
            setIsDateSheetVisible(true);
          }}
          onImageSelected={onImageSelected}
          onConfirm={onConfirm}
          isConfirmDisabled={isConfirmDisabled}
          isSubmitting={isSubmitting}
          testID="create-event-card"
        />

        <View className="mt-6 gap-4">
          <Text className="text-center font-poppins-medium text-2xl text-wine">Participantes</Text>
          <ParticipantAvatars
            participants={participants}
            currentUserId={currentUserId}
            emptyMessage={isLoadingParticipants ? 'Carregando…' : 'Nenhum participante encontrado.'}
            testID="create-event-participants"
          />
        </View>
      </ScrollView>

      {groupId ? (
        <View className="absolute inset-x-0 bottom-0">
          <NavigationBar groupId={groupId} />
        </View>
      ) : null}

      {isDateSheetVisible ? (
        <DatePickerSheet
          visible
          initialDate={draft.date || undefined}
          onSelectDate={(dateString) => {
            onSelectDate(dateString);
            setIsDateSheetVisible(false);
          }}
          onClose={() => {
            setIsDateSheetVisible(false);
          }}
        />
      ) : null}
    </View>
  );
}
