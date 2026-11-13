import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import tw from 'twrnc';

import { theme } from '@/theme';
import { isInviteExpired } from '@/utils/inviteLink';
import type { InviteLinkProps } from './InviteLink.types';

export type { InviteLinkProps } from './InviteLink.types';

const PLACEHOLDER = 'Gerando link de convite...';
const COPIED_LABEL_DURATION_MS = 1600;

export function InviteLink({
  variant,
  link,
  expiresAt,
  disabled = false,
  onCopy,
  onCopyError,
  onExpired,
  testID = 'alibe-invite-link',
}: InviteLinkProps) {
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const copiedResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (copiedResetTimer.current) {
        clearTimeout(copiedResetTimer.current);
      }
    },
    []
  );

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

    // Copiar de novo reinicia a contagem para o rótulo voltar a "Copiar".
    if (copiedResetTimer.current) {
      clearTimeout(copiedResetTimer.current);
    }
    copiedResetTimer.current = setTimeout(() => {
      setCopiedLink(null);
      copiedResetTimer.current = null;
    }, COPIED_LABEL_DURATION_MS);
  };

  return (
    <View
      className={`w-full flex-row items-center rounded-full border-2 py-1 pl-6 pr-1 ${isDisabled ? 'opacity-50' : 'opacity-100'} ${variant === 'primary' ? 'border-ink' : 'border-lime-soft'}`}
      testID={`${testID}-field`}
    >
      <Text
        className={`flex-1 font-poppins text-sm ${variant === 'primary' ? 'text-ink-soft' : 'text-surface'}`}
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
        className={`h-11 flex-row items-center justify-center gap-2 rounded-full px-5 ${variant === 'primary' ? 'bg-ink' : 'bg-lime-soft'}`}
        disabled={isDisabled}
        onPress={() => {
          void handlePress();
        }}
        style={({ pressed }) => tw`${pressed ? 'opacity-75' : ''}`}
        testID={testID}
      >
        <Ionicons
          color={variant === 'primary' ? theme.colors.surface : theme.colors.ink}
          name="link"
          size={16}
        />
        <Text
          className={`font-poppins-semibold text-sm ${variant === 'primary' ? 'text-surface' : 'text-ink'}`}
        >
          {copied ? 'Copiado' : 'Copiar'}
        </Text>
      </Pressable>
    </View>
  );
}
