import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { TextInput as RNTextInput, Text, View } from 'react-native';

import { theme } from '@/theme';
import { isValidTime, maskTime, TIME_LENGTH } from '@/utils/time';
import type { TimeInputProps } from './TimeInput.types';

export type { TimeInputProps } from './TimeInput.types';

const FORMAT_ERROR = 'Informe um horário válido no formato HH:mm.';

export function TimeInput({
  value,
  onChangeTime,
  label,
  placeholder = 'Horário',
  error,
  disabled = false,
  onBlur,
  testID = 'alibe-time-input',
}: TimeInputProps) {
  const [formatError, setFormatError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  const handleChangeText = (text: string) => {
    setFormatError(null);
    onChangeTime(maskTime(text));
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setFormatError(value.length > 0 && !isValidTime(value) ? FORMAT_ERROR : null);
    onBlur?.();
  };

  const displayedError = error ?? formatError;
  const hasError = Boolean(displayedError);
  let borderClassName = 'border-transparent';
  if (hasError) {
    borderClassName = 'border-coral';
  } else if (isFocused) {
    borderClassName = 'border-ink';
  }

  return (
    <View className="w-full gap-2">
      {label ? (
        <Text className="font-poppins-semibold text-xs uppercase tracking-wide text-ink">
          {label}
        </Text>
      ) : null}
      <View
        className={`w-full flex-row items-center gap-3 rounded-full border-2 bg-surface px-5 ${borderClassName} ${
          disabled ? 'opacity-50' : 'opacity-100'
        }`}
        testID={`${testID}-field`}
      >
        <View
          pointerEvents="none"
          testID={`${testID}-icon`}
        >
          <Ionicons
            color={theme.colors.coral}
            name="alarm-outline"
            size={20}
          />
        </View>
        <RNTextInput
          accessibilityLabel={label ?? placeholder}
          accessibilityState={{ disabled }}
          className="flex-1 py-4 font-poppins text-base text-ink outline-none"
          editable={!disabled}
          keyboardType="number-pad"
          maxLength={TIME_LENGTH}
          onBlur={handleBlur}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.inkSoft}
          testID={testID}
          value={value}
        />
      </View>
      {hasError ? (
        <Text
          className="px-2 font-poppins-medium text-xs text-coral"
          testID={`${testID}-error`}
        >
          {displayedError}
        </Text>
      ) : null}
    </View>
  );
}
