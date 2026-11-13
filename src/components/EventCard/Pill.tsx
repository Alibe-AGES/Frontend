import { theme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { ComponentProps, FC } from 'react';
import { KeyboardTypeOptions, Text, TextInput, View } from 'react-native';

type IconName = ComponentProps<typeof Ionicons>['name'];

const PILL_CLASS_NAME = 'w-full flex-row items-center gap-2 rounded-full bg-coral px-4';

interface InfoPillProps {
  icon: IconName;
  label: string;
  testID: string;
}

export const InfoPill: FC<InfoPillProps> = ({ icon, label, testID }) => (
  <View
    className={`${PILL_CLASS_NAME} py-3`}
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
      ellipsizeMode="tail"
    >
      {label}
    </Text>
  </View>
);

interface PillInputProps {
  icon: IconName;
  value: string;
  placeholder: string;
  onChangeText: (text: string) => void;
  keyboardType?: KeyboardTypeOptions;
  maxLength?: number;
  multiline?: boolean;
  editable?: boolean;
  testID: string;
}

export const PillInput: FC<PillInputProps> = ({
  icon,
  value,
  placeholder,
  onChangeText,
  keyboardType,
  maxLength,
  multiline,
  editable = true,
  testID,
}) =>
  // A TextInput scrolls long text instead of truncating it, so a fixed value is shown as text.
  editable ? (
    <View className={PILL_CLASS_NAME}>
      <Ionicons
        name={icon}
        size={20}
        color={theme.colors.white}
      />
      <TextInput
        accessibilityLabel={placeholder}
        className="flex-1 py-3 font-poppins-medium text-lg text-white outline-none"
        editable={editable}
        keyboardType={keyboardType}
        maxLength={maxLength}
        multiline={multiline}
        onChangeText={onChangeText}
        placeholder={placeholder}
        style={{ includeFontPadding: false, textAlignVertical: 'center' }}
        placeholderTextColor={theme.colors.coralSoft}
        testID={testID}
        value={value}
      />
    </View>
  ) : (
    <InfoPill
      icon={icon}
      label={value}
      testID={testID}
    />
  );
