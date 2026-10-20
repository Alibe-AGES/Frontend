import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';
import tw from 'twrnc';

import { ProfileButtonProps } from '@/components/ProfileButton/ProfileButton.types';
import { useDefaultProfileButtonController } from '@/components/ProfileButton/controllers/useDefaultProfileButtonController';
import { theme } from '@/theme';

export const ProfileButton: React.FC<ProfileButtonProps> = ({
  groupId,
  size = 24,
  className = '',
  testID = 'alibe-profile-button',
}) => {
  const { openProfile } = useDefaultProfileButtonController({ groupId });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Perfil do usuário"
      hitSlop={12}
      onPress={openProfile}
      className={className}
      style={({ pressed }) => tw`${pressed ? 'opacity-60' : ''}`}
      testID={testID}
    >
      <Ionicons
        name="person-outline"
        size={size}
        color={theme.colors.ink}
        style={{ includeFontPadding: false }}
      />
    </Pressable>
  );
};
