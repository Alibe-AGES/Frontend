import * as Linking from 'expo-linking';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { ContinueButton } from '@/components/ContinueButton';
import { InviteLink } from '@/components/InviteLink';
import { ScreenFrame } from '@/components/ScreenFrame';
import { getGroupInviteLink, type GroupInviteLink } from '@/server/groups';
import { theme } from '@/theme';
import { HandsHiFive } from '@/components/HandsHiFive';

export function InviteGroupScreen() {
  const router = useRouter();
  const { groupId } = useLocalSearchParams<{ groupId?: string }>();
  const [invite, setInvite] = useState<GroupInviteLink | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copyCount, setCopyCount] = useState(0);

  const loadInvite = useCallback(async () => {
    if (!groupId) {
      setError('Não foi possível identificar o grupo criado.');
      setIsLoading(false);
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      setInvite(await getGroupInviteLink(groupId));
    } catch {
      setError('Não foi possível gerar o link de convite.');
    } finally {
      setIsLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    void loadInvite();
  }, [loadInvite]);

  const inviteUrl = useMemo(
    () =>
      invite
        ? Linking.createURL('/groups', {
            queryParams: {
              invite: invite.token,
            },
          })
        : null,
    [invite]
  );

  return (
    <ScreenFrame padding="none">
      <View className="flex-1 px-6 pb-28 pt-40">
        <Text
          className={`text-center text-[2.857rem] leading-[3rem] text-ink ${theme.typography.display}`}
        >
          Tudo{'\n'}pronto!
        </Text>

        <Text className="mt-5 text-center font-poppins text-xl leading-7 text-wine">
          Agora é só compartilhar{'\n'}o link para convidar seus{'\n'}amigos para o grupo.
        </Text>

        <View className="mt-8 min-h-16 justify-center">
          {(() => {
            if (isLoading) {
              return (
                <ActivityIndicator
                  color={theme.colors.ink}
                  testID="invite-link-loading"
                />
              );
            }
            if (error) {
              return (
                <View className="gap-3">
                  <Text className="text-center font-poppins text-sm text-coral">{error}</Text>
                  {groupId ? (
                    <Button
                      title="Tentar novamente"
                      onPress={() => void loadInvite()}
                      variant="secondary"
                      testID="retry-invite-link"
                    />
                  ) : null}
                </View>
              );
            }
            return (
              <InviteLink
                variant="primary"
                link={inviteUrl}
                expiresAt={invite?.expiresAt}
                onExpired={() => void loadInvite()}
                onCopy={() => {
                  setCopyCount((count) => count + 1);
                }}
              />
            );
          })()}
        </View>

        <View
          accessible={false}
          className="-mx-8 aspect-[390/280]"
          testID="hi-five-hands-invite-group"
        >
          <HandsHiFive
            variant="sign-up"
            playKey={copyCount}
          />
        </View>

        <View className="mt-auto px-6 pt-6">
          <ContinueButton
            onPress={() => {
              router.replace('/groups');
            }}
          />
        </View>
      </View>
    </ScreenFrame>
  );
}
