import { Ionicons } from '@expo/vector-icons';

import { TextInput } from '@/components/TextInput';
import { theme } from '@/theme';
import type { PasswordInputProps, PasswordInputVariant } from './PasswordInput.types';

export type { PasswordInputProps, PasswordInputVariant } from './PasswordInput.types';

const ICON_SIZE = 23;

const VARIANT_CONFIG: Record<
  PasswordInputVariant,
  { placeholder: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  password: { placeholder: 'Senha', icon: 'lock-closed-outline' },
  confirm: { placeholder: 'Confirmar senha', icon: 'shield-checkmark-outline' },
};

export function PasswordInput({
  variant = 'password',
  visible = false,
  iconBackground = 'coral',
  testID = 'alibe-password-input',
  ...props
}: PasswordInputProps) {
  const { placeholder, icon } = VARIANT_CONFIG[variant];

  return (
    <TextInput
      {...props}
      icon={
        <Ionicons
          color={theme.colors.white}
          name={icon}
          size={ICON_SIZE}
        />
      }
      iconBackground={iconBackground}
      placeholder={placeholder}
      secureTextEntry={!visible}
      testID={testID}
      type="password"
    />
  );
}
