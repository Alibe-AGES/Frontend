import { Image } from 'expo-image';
import * as Linking from 'expo-linking';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import tw from 'twrnc';

import inviteDecoration from '@/assets/images/invite-decoration.svg';
import { Button } from '@/components/Button';
import { ContinueButton } from '@/components/ContinueButton';
import { InviteLink } from '@/components/InviteLink';
import { getGroupInviteLink, type GroupInviteLink } from '@/server/groups';
import { theme } from '@/theme';

export function InviteGroupScreen() {
  const router = useRouter();
  const { groupId } = useLocalSearchParams<{ groupId?: string }>();
  const [invite, setInvite] = useState<GroupInviteLink | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
    <ScrollView
      className="flex-1 bg-surface"
      contentContainerClassName="flex-grow"
    >
      <View className="flex-1 bg-surface px-6 pb-28 pt-40">
        <Text className="text-center font-poppins-black text-4xl leading-tight text-ink">
          Tudo{'\n'}pronto!
        </Text>

        <Text className="mt-3 text-center font-poppins text-sm text-coral">
          Agora é só compartilhar o link para convidar seus amigos para o grupo.
        </Text>

        <View className="mt-8 min-h-16 justify-center">
          {isLoading ? (
            <ActivityIndicator
              color={theme.colors.ink}
              testID="invite-link-loading"
            />
          ) : error ? (
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
          ) : (
            <InviteLink
              link={inviteUrl}
              expiresAt={invite?.expiresAt}
              onExpired={() => void loadInvite()}
            />
          )}
        </View>

        <Image
          accessible={false}
          contentFit="contain"
          source={inviteDecoration}
          style={tw`-mx-6 mt-8 h-60`}
          testID="alibe-invite-decoration"
        />

        <View className="mt-auto px-6 pt-6">
          <ContinueButton
            onPress={() => {
              router.replace('/groups');
            }}
          />
        </View>
      </View>
    </ScrollView>
  );
}
