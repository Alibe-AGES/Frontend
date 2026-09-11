import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import tw from 'twrnc';

import inviteDecoration from '@/assets/images/invite-decoration.svg';
import { Button } from '@/components/Button';
import { InviteLink } from '@/components/InviteLink';

// O convite ainda nao vem do backend; ate a integracao existir a tela mostra um link de exemplo.
const PLACEHOLDER_INVITE_LINK = 'https://alibe.app/invite/7f3a9c21';

export function InviteGroupScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-surface px-6 pb-12 pt-40">
      <Text className="text-center font-poppins-black text-4xl leading-tight text-ink">
        Tudo{'\n'}pronto!
      </Text>

      <Text className="mt-3 text-center font-poppins text-sm text-coral">
        Agora é só compartilhar o link para convidar seus amigos para o grupo.
      </Text>

      <View className="mt-8">
        <InviteLink link={PLACEHOLDER_INVITE_LINK} />
      </View>

      <Image
        accessible={false}
        contentFit="contain"
        source={inviteDecoration}
        style={tw`-mx-6 mt-8 h-60`}
        testID="alibe-invite-decoration"
      />

      <View className="mt-auto pt-6">
        <Button
          onPress={() => {
            router.replace('/groups');
          }}
          title="Continuar"
          variant="tertiary"
        />
      </View>
    </View>
  );
}
