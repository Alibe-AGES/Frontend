import { theme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { ComponentProps, FC } from 'react';
import { Pressable, Text, View } from 'react-native';
import tw from 'twrnc';
import { EventCardProps } from './EventCard.types';
import { formatBudget, formatTime } from './formatters';

export type { EventCardEvent, EventCardProps, EventLocation, EventStatus } from './EventCard.types';

interface InfoPillProps {
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
  testID: string;
}

const InfoPill: FC<InfoPillProps> = ({ icon, label, testID }) => (
  <View
    className="w-full flex-row items-center gap-2 rounded-full bg-coral px-4 py-3"
    testID={testID}
  >
    <Ionicons
      name={icon}
      size={20}
      color={theme.colors.white}
    />
    <Text
      className="flex-1 font-poppins-medium text-lg text-white"
      numberOfLines={1}
    >
      {label}
    </Text>
  </View>
);

interface InfoItemProps {
  label: string;
  children: string;
  className?: string;
  testID: string;
}

const InfoItem: FC<InfoItemProps> = ({ label, children, className, testID }) => (
  <View
    className={className}
    testID={testID}
  >
    <Text className="font-poppins-semibold text-sm text-wine">{label}</Text>
    <Text className="font-poppins text-sm text-wine">{children}</Text>
  </View>
);

export const EventCard: FC<EventCardProps> = ({
  event,
  onEditPress,
  testID = 'alibe-event-card',
}) => {
  const title =
    [event.name, event.location?.description].find((value) => value?.trim()) ?? 'Evento';
  const address = event.location?.address;
  const time = formatTime(event.timeslot);
  const budget = formatBudget(event.budgetStart, event.budgetEnd);
  const openingHours = event.openingHours?.filter(Boolean).join('\n');
  const hasDetails = [budget, event.phone, openingHours, event.website].some(Boolean);

  return (
    <View
      className="relative w-full"
      testID={testID}
    >
      <View className="mt-28 w-full gap-3 rounded-[2.5rem] bg-lime-soft px-6 pb-6 pt-24">
        <Text
          className="text-center font-poppins-medium text-3xl text-wine"
          numberOfLines={2}
          testID={`${testID}-title`}
        >
          {title}
        </Text>

        {address ? (
          <InfoPill
            icon="location-outline"
            label={address}
            testID={`${testID}-address`}
          />
        ) : null}

        {time ? (
          <InfoPill
            icon="time-outline"
            label={time}
            testID={`${testID}-time`}
          />
        ) : null}

        {hasDetails ? (
          <View className="mt-4 gap-4 px-2">
            {budget || event.phone ? (
              <View className="flex-row gap-4">
                {budget ? (
                  <InfoItem
                    label="Faixa de Preço"
                    className="flex-1"
                    testID={`${testID}-budget`}
                  >
                    {budget}
                  </InfoItem>
                ) : null}
                {event.phone ? (
                  <InfoItem
                    label="Número"
                    className="flex-1"
                    testID={`${testID}-phone`}
                  >
                    {event.phone}
                  </InfoItem>
                ) : null}
              </View>
            ) : null}

            {openingHours ? (
              <InfoItem
                label="Horários"
                testID={`${testID}-hours`}
              >
                {openingHours}
              </InfoItem>
            ) : null}

            {event.website ? (
              <InfoItem
                label="Site"
                testID={`${testID}-website`}
              >
                {event.website}
              </InfoItem>
            ) : null}
          </View>
        ) : null}

        {onEditPress ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Editar evento"
            hitSlop={12}
            onPress={onEditPress}
            style={({ pressed }) => tw`${pressed ? 'opacity-50' : 'opacity-100'}`}
            className="self-end"
            testID={`${testID}-edit`}
          >
            <Ionicons
              name="pencil-outline"
              size={22}
              color={theme.colors.wine}
            />
          </Pressable>
        ) : null}
      </View>

      <View className="absolute inset-x-8 top-0 h-48 overflow-hidden rounded-3xl bg-pink shadow-lg">
        {event.imageUrl ? (
          <Image
            source={{ uri: event.imageUrl }}
            accessible
            accessibilityLabel={`Foto de ${title}`}
            contentFit="cover"
            style={tw`h-full w-full`}
            testID={`${testID}-image`}
          />
        ) : (
          <View
            className="h-full w-full items-center justify-center"
            testID={`${testID}-image-placeholder`}
          >
            <Ionicons
              name="location-outline"
              size={64}
              color={theme.colors.ink}
            />
          </View>
        )}
      </View>
    </View>
  );
};
