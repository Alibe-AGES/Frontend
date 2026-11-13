import { BackButton } from '@/components/BackButton';
import { DatePickerSheet } from '@/components/DatePickerSheet';
import { EventCard, EventCardDraft } from '@/components/EventCard';
import { NavigationBar } from '@/components/NavigationBar';
import { Participant, ParticipantAvatars } from '@/components/ParticipantAvatars';
import type { SelectedPhoto } from '@/components/PhotoPicker/PhotoPicker.types';
import { ScreenFrame } from '@/components/ScreenFrame';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

export type CreateEventTab = 'event' | 'suggestion';

export interface CreateEventScreenProps {
  groupId?: string;
  openDatePickerOnMount?: boolean;
  activeTab?: CreateEventTab;
  /** The event is for a matched place, whose name, address and picture are fixed. */
  isLocationReadOnly?: boolean;
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

const EVENT_TYPE_TABS: readonly { value: CreateEventTab; label: string }[] = [
  { value: 'event', label: 'Evento' },
  { value: 'suggestion', label: 'Sugestão' },
];

function EventTypeTabs({
  activeTab,
  disabledTab,
  onSelectTab,
}: {
  readonly activeTab: CreateEventTab;
  readonly disabledTab?: CreateEventTab;
  readonly onSelectTab?: (tab: CreateEventTab) => void;
}) {
  return (
    <View
      accessibilityRole="tablist"
      className="flex-1 flex-row"
    >
      {EVENT_TYPE_TABS.map(({ value, label }) => {
        const isSelected = activeTab === value;
        const isDisabled = disabledTab === value;

        return (
          <Pressable
            key={value}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected, disabled: isDisabled }}
            disabled={isDisabled}
            className={`flex-1 items-center pt-3 ${isDisabled ? 'opacity-40' : 'opacity-100'}`}
            onPress={() => {
              onSelectTab?.(value);
            }}
            testID={`create-event-tab-${value}`}
          >
            <Text
              className={`text-center text-base leading-tight ${
                isSelected ? 'font-poppins-semibold text-ink' : 'font-poppins text-ink-soft'
              }`}
            >
              {label}
            </Text>
            {/* The ruler keeps its height on every tab so the labels don't shift on selection. */}
            <View
              className={`mt-3 h-1 w-full rounded-full ${isSelected ? 'bg-coral' : 'bg-transparent'}`}
              testID={`create-event-tab-${value}-indicator`}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

export function CreateEventScreen({
  groupId,
  openDatePickerOnMount = false,
  activeTab = 'event',
  isLocationReadOnly = false,
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
  const shouldShowDateSheet = isDateSheetVisible && activeTab === 'event';

  useEffect(() => {
    if (openDatePickerOnMount) setIsDateSheetVisible(true);
  }, [openDatePickerOnMount]);

  return (
    <>
      <ScreenFrame
        gap="md"
        topFade="header"
        floatingChrome
        header={
          <View
            className="flex-row items-center gap-4"
            testID="create-event-tabs-header"
          >
            <BackButton
              fallbackHref={groupId ? `/group/${groupId}` : '/groups'}
              accessibilityLabel="Voltar para o grupo"
            />
            <EventTypeTabs
              activeTab={activeTab}
              // A matched place is already chosen, so there is nothing left to suggest.
              disabledTab={isLocationReadOnly ? 'suggestion' : undefined}
              onSelectTab={onSelectTab}
            />
          </View>
        }
        footer={groupId ? <NavigationBar groupId={groupId} /> : undefined}
        testID="create-event-form-scroll"
      >
        <View className="mt-20 flex-1">
          <EventCard
            mode="create"
            variant={activeTab}
            locationReadOnly={activeTab === 'event' && isLocationReadOnly}
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
            <Text className="text-center font-poppins-medium text-2xl text-wine">
              Participantes
            </Text>
            <ParticipantAvatars
              participants={participants}
              currentUserId={currentUserId}
              emptyMessage={
                isLoadingParticipants ? 'Carregando…' : 'Nenhum participante encontrado.'
              }
              testID="create-event-participants"
            />
          </View>
        </View>
      </ScreenFrame>

      {shouldShowDateSheet ? (
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
    </>
  );
}
