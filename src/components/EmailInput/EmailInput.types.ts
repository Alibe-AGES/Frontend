import type { TextInputProps } from '@/components/TextInput/TextInput.types';

export type EmailInputProps = Omit<
  TextInputProps,
  'type' | 'icon' | 'secureTextEntry' | 'placeholder'
>;
