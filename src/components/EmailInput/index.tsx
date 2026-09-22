import { Ionicons } from '@expo/vector-icons';

import { TextInput } from '@/components/TextInput';
import { theme } from '@/theme';
import type { EmailInputProps } from './EmailInput.types';

export type { EmailInputProps } from './EmailInput.types';

const ICON_SIZE = 25;

export function EmailInput({
  iconBackground = 'coral',
  testID = 'alibe-email-input',
  ...props
}: EmailInputProps) {
  return (
    <TextInput
      {...props}
      icon={
        <Ionicons
          color={theme.colors.white}
          name="at"
          size={ICON_SIZE}
        />
      }
      iconBackground={iconBackground}
      placeholder="Email"
      testID={testID}
      type="email"
    />
  );
}
