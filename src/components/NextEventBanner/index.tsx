import { FC } from 'react';
import { Text, View } from 'react-native';
import { formatNextEventDate } from './formatters';
import { NextEventBannerProps } from './NextEventBanner.types';

export type { NextEventBannerEvent, NextEventBannerProps } from './NextEventBanner.types';

export const NextEventBanner: FC<NextEventBannerProps> = ({
  event,
  testID = 'alibe-next-event-banner',
}) => {
  const dateLabel = event ? formatNextEventDate(event.timeslot) : null;

  return (
    <View
      className="gap-1 rounded-3xl bg-ink px-6 py-5"
      testID={testID}
    >
      <Text className="font-poppins-medium text-lg text-lime">Próximo encontro:</Text>

      {event ? (
        <View>
          <Text
            className="text-md font-poppins text-surface"
            numberOfLines={1}
          >{`• ${event.name}`}</Text>
          {dateLabel ? (
            <Text className="pl-3 font-poppins text-sm text-grey">{dateLabel}</Text>
          ) : null}
        </View>
      ) : (
        <View testID={`${testID}-empty`}>
          <Text className="font-poppins text-sm text-surface">Nenhum encontro marcado ainda.</Text>
          <Text className="font-poppins text-xs text-lime-soft">
            Toque em um dia do calendário para sugerir um.
          </Text>
        </View>
      )}
    </View>
  );
};
