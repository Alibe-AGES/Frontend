import { theme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { FC } from 'react';
import { Pressable, Text, View } from 'react-native';
import tw from 'twrnc';
import { EventCardReadProps } from './EventCard.types';
import { EventCardAdditionalDetails } from './EventCardAdditionalDetails';
import { EventCardFrame } from './EventCardFrame';
import { formatBudget, formatTime } from './formatters';
import { InfoPill } from './Pill';

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

      <EventCardAdditionalDetails
        budget={budget}
        phone={event.phone}
        openingHours={openingHours}
        website={event.website}
        testID={testID}
      />

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
