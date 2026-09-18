import { Avatar } from '@/components/Avatar';
import { BackButton } from '@/components/BackButton';
import { InviteLink } from '@/components/InviteLink';
import { GroupDetails } from '@/server/groups';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, Text, View } from 'react-native';

export interface MemberAvailability {
  memberId: string;
  dates: string[];
}

export interface GroupInfoScreenProps {
  group: GroupDetails | null;
  availabilities: MemberAvailability[];
  currentUserId?: string;
  inviteUrl: string | null;
  inviteExpiresAt?: string;
  isLoading: boolean;
  onLeaveGroup: () => void;
  onRefreshInvite: () => void;
}

function formatDate(date: string): string {
  const [, month, day] = date.split('-');
  return `${day}/${month}`;
}

function MemberRow({
  name,
  dates,
  isCurrentUser,
  testID,
}: {
  name: string;
  dates: string[];
  isCurrentUser: boolean;
  testID: string;
}) {
  return (
    <View
      className="flex-row items-center gap-3 rounded-full bg-canvas px-5 py-3"
      testID={testID}
    >
      <View className="flex-1 flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="font-poppins-medium text-base uppercase text-ink">{name}</Text>
          {dates.length > 0 ? (
            <Text
              className="text-inkSoft text-xs font-medium"
              numberOfLines={1}
            >
              {dates.map(formatDate).join(' · ')}
            </Text>
          ) : null}
        </View>

        {isCurrentUser ? <Text className="text-inkSoft text-xs font-medium">(você)</Text> : null}
      </View>
    </View>
  );
}

export function GroupInfoScreen({
  group,
  availabilities,
  currentUserId,
  inviteUrl,
  inviteExpiresAt,
  isLoading,
  onLeaveGroup,
  onRefreshInvite,
}: GroupInfoScreenProps) {
  const datesByMember = new Map(availabilities.map((a) => [a.memberId, a.dates]));

  return (
    <View className="flex-1 bg-canvas">
      <View className="px-6 pt-16">
        <BackButton
          fallbackHref={group ? `/group/${group.id}` : '/groups'}
          accessibilityLabel="Voltar"
        />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pb-16 pt-8"
        testID="group-info-screen"
      >
        <View className="relative rounded-[2rem] bg-ink px-6 pb-10 pt-16">
          <View className="absolute -top-12 left-0 right-0 items-center">
            <View className="h-24 w-24 overflow-hidden rounded-full border-4 border-canvas bg-coral">
              {group ? (
                <Avatar
                  photoUri={group.profilePic}
                  accessibilityLabel={`Foto do grupo ${group.name}`}
                  imageClassName="h-full w-full rounded-full"
                  iconSize={40}
                  testID="group-info-avatar"
                />
              ) : null}
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Editar imagem do grupo"
            className="mt-2"
            testID="group-info-edit-image"
          >
            <Text className="text-center text-xs font-medium text-canvas underline">
              Editar imagem do grupo
            </Text>
          </Pressable>

          <View className="mt-4 flex-row items-center justify-center gap-2 self-center rounded-full bg-lime px-6 py-2">
            <Text className="font-poppins-semibold text-lg text-ink">{group?.name ?? ''}</Text>
            <Ionicons
              name="pencil"
              size={16}
              color="#17352B"
            />
          </View>

          <Text className="mt-6 text-center font-poppins-semibold text-sm text-canvas">
            Participantes:
          </Text>

          {group && group.participants.length > 0 ? (
            <View
              className="mt-3 gap-2"
              testID="group-info-members"
            >
              {group.participants.map((member) => (
                <MemberRow
                  key={member.id}
                  name={member.name}
                  dates={datesByMember.get(member.id) ?? []}
                  isCurrentUser={member.id === currentUserId}
                  testID={`group-info-member-${member.id}`}
                />
              ))}
            </View>
          ) : (
            <Text className="mt-3 text-center text-sm font-medium text-canvas">
              {isLoading ? 'Carregando…' : 'Nenhum membro encontrado neste grupo.'}
            </Text>
          )}

          <View className="mt-4 items-center">
            <View className="h-8 w-8 items-center justify-center rounded-full bg-canvas">
              <Ionicons
                name="add"
                size={20}
                color="#17352B"
              />
            </View>
          </View>

          {inviteUrl ? (
            <View className="mt-4 gap-2">
              <Text className="text-center text-xs font-medium text-canvas">
                Tem alguém faltando? Compartilhe o link para convidar mais amigos para o grupo.
              </Text>
              <InviteLink
                link={inviteUrl}
                expiresAt={inviteExpiresAt}
                onExpired={onRefreshInvite}
              />
            </View>
          ) : null}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Sair do grupo"
          onPress={onLeaveGroup}
          className="mt-6 self-center rounded-full bg-ink px-8 py-3"
          testID="group-info-leave"
        >
          <Text className="font-poppins-semibold text-sm text-canvas">Sair do grupo</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
