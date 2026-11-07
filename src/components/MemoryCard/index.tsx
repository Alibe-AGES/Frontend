import { Image, Text, View } from 'react-native';
import { MemoryCardProps } from './MemoryCard.types';

export type { MemoryCardProps } from './MemoryCard.types';

const WEEKDAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const MONTHS = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
];

function formatDate(date: Date) {
  return `${WEEKDAYS[date.getDay()]}, ${String(date.getDate())} de ${MONTHS[date.getMonth()]}`;
}

export function MemoryCard({
  date,
  name,
  address,
  imageUri,
  imageHeaders,
  testID = 'memory-card',
}: MemoryCardProps) {
  return (
    // The shadow lives on the outer view: on iOS `overflow-hidden` would clip it.
    <View
      className="w-full rounded-3xl bg-white shadow-md"
      testID={testID}
    >
      <View className="overflow-hidden rounded-3xl">
        <Text
          className="px-4 py-4 font-poppins-light text-base text-wine"
          testID={`${testID}-date`}
        >
          {formatDate(date)}
        </Text>

        <Image
          source={{ uri: imageUri, headers: imageHeaders }}
          accessibilityLabel={`Foto de ${name}`}
          className="aspect-[3/4] w-full bg-lime-soft"
          resizeMode="cover"
        />

        <View className="flex-row items-start justify-between gap-2 px-4 py-4">
          <View className="flex-1">
            <Text
              className="font-poppins-semibold text-base text-wine"
              numberOfLines={2}
              testID={`${testID}-name`}
            >
              {name}
            </Text>
            <Text
              className="font-poppins-light text-base text-wine"
              numberOfLines={2}
              testID={`${testID}-address`}
            >
              {address}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
