import { useAuthenticatedImageSource } from '@/hooks/use-authenticated-image-source';
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
  variant = 'default',
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
  const imageSource = useAuthenticatedImageSource(event.imageUrl);
  const isProposal = variant === 'proposal';

  const image = event.imageUrl ? (
    <Image
      source={imageSource ?? { uri: event.imageUrl }}
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
      variant={variant}
      testID={testID}
    >
      {isProposal && event.rating !== null && event.rating !== undefined ? (
        <View
          className="flex-row items-center gap-0.5"
          testID={`${testID}-rating`}
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <Ionicons
              key={star}
              name={star <= Math.round(event.rating ?? 0) ? 'star' : 'star-outline'}
              size={16}
              color={theme.colors.coral}
            />
          ))}
        </View>
      ) : null}

      {isProposal ? (
        <View className="gap-0.5">
          <Text
            className="font-poppins-semibold text-lg text-ink"
            numberOfLines={2}
            testID={`${testID}-title`}
          >
            {title}
          </Text>
          <Text
            className="font-poppins-semibold text-xs text-ink"
            numberOfLines={2}
            testID={`${testID}-address`}
          >
            {address ?? '--'}
          </Text>
          {event.location?.description ? (
            <Text
              className="font-poppins text-xs text-wine"
              testID={`${testID}-description`}
            >
              {event.location.description}
            </Text>
          ) : null}
        </View>
      ) : (
        <Text
          className="text-center font-poppins-medium text-3xl text-wine"
          numberOfLines={2}
          testID={`${testID}-title`}
        >
          {title}
        </Text>
      )}

      {address && !isProposal ? (
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
        budget={budget ?? (isProposal ? '--' : null)}
        phone={event.phone ?? (isProposal ? '(00) 00000-0000' : null)}
        openingHours={openingHours ?? (isProposal ? '--' : undefined)}
        website={event.website ?? (isProposal ? '--' : null)}
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
