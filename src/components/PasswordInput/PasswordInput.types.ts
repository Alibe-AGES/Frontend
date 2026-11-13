import type { TextInputProps } from '@/components/TextInput/TextInput.types';

export type PasswordInputVariant = 'password' | 'confirm';

export interface PasswordInputProps extends Omit<
  TextInputProps,
  'type' | 'icon' | 'secureTextEntry' | 'placeholder'
> {
  variant?: PasswordInputVariant;
  visible?: boolean;
}
