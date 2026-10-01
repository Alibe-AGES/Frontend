import { FC } from 'react';
import { Text, View } from 'react-native';

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

interface EventCardAdditionalDetailsProps {
  budget: string | null;
  phone?: string | null;
  openingHours?: string;
  website?: string | null;
  testID: string;
}

export const EventCardAdditionalDetails: FC<EventCardAdditionalDetailsProps> = ({
  budget,
  phone,
  openingHours,
  website,
  testID,
}) => {
  if (!budget && !phone && !openingHours && !website) {
    return null;
  }

  return (
    <View className="mt-4 gap-4 px-2">
      {budget || phone ? (
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
          {phone ? (
            <InfoItem
              label="Número"
              className="flex-1"
              testID={`${testID}-phone`}
            >
              {phone}
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

      {website ? (
        <InfoItem
          label="Site"
          testID={`${testID}-website`}
        >
          {website}
        </InfoItem>
      ) : null}
    </View>
  );
};
