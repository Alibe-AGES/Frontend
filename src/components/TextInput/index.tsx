import type { ReactNode } from 'react';
import { useState } from 'react';
import type { KeyboardTypeOptions } from 'react-native';
import { Text, TextInput as RNTextInput, View } from 'react-native';

import { theme } from '@/theme';

export type TextInputType = 'all' | 'email' | 'numeric' | 'alphanumeric';
export type TextInputIconBackground = 'coral' | 'ink';

export interface TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  type?: TextInputType;
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  secureTextEntry?: boolean;
  autoFocus?: boolean;
  maxLength?: number;
  icon?: ReactNode;
  iconBackground?: TextInputIconBackground;
  onBlur?: () => void;
  testID?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NUMERIC_DISALLOWED_REGEX = /[^0-9]/g;
const ALPHANUMERIC_DISALLOWED_REGEX = /[^\p{L}\p{N}\s]/gu;

const ERROR_MESSAGES: Record<TextInputType, string> = {
  all: '',
  email: 'Informe um e-mail válido.',
  numeric: 'Este campo aceita somente números.',
  alphanumeric: 'Este campo não aceita caracteres especiais.',
};

const KEYBOARD_TYPES: Record<TextInputType, KeyboardTypeOptions> = {
  all: 'default',
  email: 'email-address',
  numeric: 'number-pad',
  alphanumeric: 'default',
};

function sanitizeByType(type: TextInputType, text: string): string {
  if (type === 'numeric') {
    return text.replace(NUMERIC_DISALLOWED_REGEX, '');
  }

  if (type === 'alphanumeric') {
    return text.replace(ALPHANUMERIC_DISALLOWED_REGEX, '');
  }

  return text;
}

export function TextInput({
  value,
  onChangeText,
  type = 'all',
  label,
  placeholder,
  error,
  disabled = false,
  secureTextEntry = false,
  autoFocus = false,
  maxLength,
  icon,
  iconBackground,
  onBlur,
  testID = 'alibe-text-input',
}: TextInputProps) {
  const [typeError, setTypeError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  const handleChangeText = (text: string) => {
    const sanitized = sanitizeByType(type, text);

    setTypeError(sanitized !== text ? ERROR_MESSAGES[type] : null);
    onChangeText(sanitized);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);

    if (type === 'email') {
      setTypeError(value.length > 0 && !EMAIL_REGEX.test(value) ? ERROR_MESSAGES.email : null);
    }

    onBlur?.();
  };

  const displayedError = error ?? typeError;
  const hasError = Boolean(displayedError);
  const borderClassName = hasError
    ? 'border-coral'
    : isFocused
      ? 'border-ink'
      : 'border-transparent';

  return (
    <View className="w-full gap-2">
      {label ? (
        <Text className="font-poppins-semibold text-xs uppercase tracking-wide text-ink">
          {label}
        </Text>
      ) : null}
      <View
        className={`w-full flex-row items-center rounded-full border-2 bg-surface pl-6 ${
          icon ? 'pr-2' : 'pr-6'
        } ${borderClassName} ${disabled ? 'opacity-50' : 'opacity-100'}`}
        testID={`${testID}-field`}
      >
        <RNTextInput
          accessibilityLabel={label ?? placeholder}
          accessibilityState={{ disabled }}
          autoCapitalize={type === 'email' ? 'none' : 'sentences'}
          autoFocus={autoFocus}
          className="flex-1 py-4 font-poppins text-base text-ink outline-none"
          editable={!disabled}
          keyboardType={KEYBOARD_TYPES[type]}
          maxLength={maxLength}
          onBlur={handleBlur}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.pink}
          secureTextEntry={secureTextEntry}
          testID={testID}
          value={value}
        />
        {icon ? (
          <View
            className={`h-10 w-10 items-center justify-center rounded-full ${
              iconBackground === 'coral' ? 'bg-coral' : ''
            } ${iconBackground === 'ink' ? 'bg-ink' : ''}`}
            pointerEvents="none"
            testID={`${testID}-icon`}
          >
            {icon}
          </View>
        ) : null}
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
