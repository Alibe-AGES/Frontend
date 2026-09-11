import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import tw from 'twrnc';

import { theme } from '@/theme';
import { isInviteExpired } from '@/utils/inviteLink';
import type { InviteLinkProps } from './InviteLink.types';

export type { InviteLinkProps } from './InviteLink.types';

const PLACEHOLDER = 'Gerando link de convite...';

export function InviteLink({
  link,
  expiresAt,
  disabled = false,
  onCopy,
  onCopyError,
  onExpired,
  testID = 'alibe-invite-link',
}: InviteLinkProps) {
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const expired = expiresAt ? isInviteExpired(expiresAt) : false;
  const isDisabled = disabled || !link;
  const copied = Boolean(link) && copiedLink === link;

  const handlePress = async () => {
    if (!link) {
      return;
    }

    // Quem consome o componente decide como pedir um link novo.
    if (expired) {
      onExpired?.();
      return;
    }

    // No navegador a escrita na area de transferencia pode ser negada pelo usuario.
    try {
      await Clipboard.setStringAsync(link);
    } catch (error) {
      onCopyError?.(error);
      return;
    }

    setCopiedLink(link);
    onCopy?.(link);
  };

  return (
    <View
      className={`w-full flex-row items-center rounded-full border-2 border-lime-soft bg-surface py-1 pl-6 pr-1 ${
        isDisabled ? 'opacity-50' : 'opacity-100'
      }`}
      testID={`${testID}-field`}
    >
      <Text
        className="flex-1 font-poppins text-sm text-ink-soft"
        ellipsizeMode="tail"
        numberOfLines={1}
        testID={`${testID}-url`}
      >
        {link ?? PLACEHOLDER}
      </Text>
      <Pressable
        accessibilityLabel="Copiar link de convite"
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled }}
        className="h-11 flex-row items-center justify-center gap-2 rounded-full bg-ink px-5"
        disabled={isDisabled}
        onPress={() => {
          void handlePress();
        }}
        style={({ pressed }) => tw`${pressed ? 'opacity-75' : ''}`}
        testID={testID}
      >
        <Ionicons
          color={theme.colors.lime}
          name="link"
          size={16}
        />
        <Text className="font-poppins-semibold text-sm text-white">
          {copied ? 'Copiado' : 'Copiar'}
        </Text>
      </Pressable>
    </View>
  );
}
