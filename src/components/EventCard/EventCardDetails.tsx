import { theme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { FC } from 'react';
import { Pressable, Text, View } from 'react-native';
import tw from 'twrnc';
import { EventCardReadProps } from './EventCard.types';
import { EventCardFrame } from './EventCardFrame';
import { formatBudget, formatTime } from './formatters';
import { InfoPill } from './Pill';

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

export const EventCardDetails: FC<Omit<EventCardReadProps, 'mode'> & { testID: string }> = ({
  event,
  onEditPress,
  testID,
}) => {
  const title =
    [event.name, event.location?.description].find((value) => value?.trim()) ?? 'Evento';
  const address = event.location?.address;
  const time = formatTime(event.timeslot);
  const budget = formatBudget(event.budgetStart, event.budgetEnd);
  const openingHours = event.openingHours?.filter(Boolean).join('\n');
  const hasDetails = [budget, event.phone, openingHours, event.website].some(Boolean);

  const image = event.imageUrl ? (
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
      className="h-full w-full items-center justify-center bg-pink"
      testID={`${testID}-image-placeholder`}
    >
      <Ionicons
        name="location-outline"
        size={64}
        color={theme.colors.ink}
      />
    </View>
  );

  return (
    <EventCardFrame
      image={image}
      testID={testID}
    >
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
    </EventCardFrame>
  );
};
