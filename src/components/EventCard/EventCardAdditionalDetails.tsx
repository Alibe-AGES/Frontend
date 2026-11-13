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
  const budgetValue = budget?.trim() ? budget : null;
  const phoneValue = phone?.trim() ? phone : null;
  const hoursValue = openingHours?.trim() ? openingHours : null;
  const websiteValue = website?.trim() ? website : null;
  return (
    <View className="mt-4 gap-4 px-2">
      <View className="flex-row gap-4">
        <InfoItem
          label="Faixa de Preço"
          className="flex-1"
          testID={`${testID}-budget`}
        >
          {budgetValue ?? '--'}
        </InfoItem>
        <InfoItem
          label="Número"
          className="flex-1"
          testID={`${testID}-phone`}
        >
          {phoneValue ?? '(00) 00000-0000'}
        </InfoItem>
      </View>

      <InfoItem
        label="Horários"
        testID={`${testID}-hours`}
      >
        {hoursValue ?? '--'}
      </InfoItem>

      <InfoItem
        label="Site"
        testID={`${testID}-website`}
      >
        {websiteValue ?? '--'}
      </InfoItem>
    </View>
  );
};
