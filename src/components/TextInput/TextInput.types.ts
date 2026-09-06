import type { ReactNode } from 'react';

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
