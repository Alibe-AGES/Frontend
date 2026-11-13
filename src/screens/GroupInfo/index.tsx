import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, TouchableOpacity, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { BackButton } from '@/components/BackButton';
import { InviteLink } from '@/components/InviteLink';
import { ModalFrame } from '@/components/ModalFrame';
import { ScreenFrame } from '@/components/ScreenFrame';
import { TextInput } from '@/components/TextInput';
import type { GroupDetails, GroupMember } from '@/server/groups';
import { theme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';

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
  /** Only the owner can edit the group's name and picture. */
  canEdit?: boolean;
  isSaving?: boolean;
  onEditImage?: () => void;
  /** Resolves with an error message to show, or null once the name is saved. */
  onRenameGroup?: (name: string) => Promise<string | null>;
  /** Only offered to the owner. Resolves with true once the member is removed. */
  onRemoveMember?: (member: GroupMember) => Promise<boolean>;
  /** Called once the confirmation has closed, so a toast lands on the screen, not the modal. */
  onMemberRemoved?: (member: GroupMember) => void;
  onLeaveGroup: () => void;
  onRefreshInvite: () => void;
}

function formatDate(date: string): string {
  const [, month, day] = date.split('-');
  return `${day}/${month}`;
}

function MemberRow({
  name,
  profilePic,
  dates,
  isCurrentUser,
  onRemove,
  testID,
}: {
  name: string;
  profilePic: string | null;
  dates: string[];
  isCurrentUser: boolean;
  onRemove?: () => void;
  testID: string;
}) {
  return (
    <View
      className="flex-row items-center gap-3 rounded-full bg-canvas px-1.5 py-1"
      testID={testID}
    >
      <Avatar
        photoUri={profilePic}
        accessibilityLabel={'Foto de perfil de ' + name}
        imageClassName="h-8 w-8 rounded-full"
        cachePolicy="none"
        iconSize={24}
        fallbackIconName="person-outline"
        fallbackIconColor={theme.colors.coral}
        testID={testID + '-avatar'}
      />

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

        {isCurrentUser ? (
          <Text className="text-inkSoft pr-2 text-xs font-medium">(você)</Text>
        ) : null}

        {onRemove ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={'Remover ' + name + ' do grupo'}
            hitSlop={8}
            onPress={onRemove}
            style={({ pressed }) => tw`${pressed ? 'opacity-50' : ''}`}
            className="mr-1 h-7 w-7 items-center justify-center rounded-full bg-surface"
            testID={testID + '-remove'}
          >
            <Ionicons
              name="remove-circle-outline"
              size={24}
              color={theme.colors.error}
            />
          </Pressable>
        ) : null}
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
  canEdit = false,
  isSaving = false,
  onEditImage,
  onRenameGroup,
  onRemoveMember,
  onMemberRemoved,
  onLeaveGroup,
  onRefreshInvite,
}: GroupInfoScreenProps) {
  const datesByMember = new Map(availabilities.map((a) => [a.memberId, a.dates]));
  const [isEditingName, setIsEditingName] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [memberToRemove, setMemberToRemove] = useState<GroupMember | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [removedMember, setRemovedMember] = useState<GroupMember | null>(null);

  // Runs after the commit that unmounted the modal (and the Toast it hosts).
  useEffect(() => {
    if (removedMember) {
      onMemberRemoved?.(removedMember);
      setRemovedMember(null);
    }
  }, [removedMember, onMemberRemoved]);

  const startEditingName = () => {
    setDraftName(group?.name ?? '');
    setNameError(null);
    setIsEditingName(true);
  };

  const submitName = async () => {
    const error = onRenameGroup ? await onRenameGroup(draftName) : null;

    if (error) {
      setNameError(error);
      return;
    }

    setIsEditingName(false);
  };

  const closeRemoveModal = () => {
    if (!isRemoving) {
      setMemberToRemove(null);
    }
  };

  const confirmRemoveMember = async () => {
    if (!memberToRemove || !onRemoveMember) {
      return;
    }

    setIsRemoving(true);
    const removed = await onRemoveMember(memberToRemove);
    setIsRemoving(false);

    if (removed) {
      setRemovedMember(memberToRemove);
      setMemberToRemove(null);
    }
  };

  return (
    <ScreenFrame
      floatingChrome
      topFade="header"
      header={
        <View className="flex-row items-center gap-4">
          <BackButton
            fallbackHref={group ? `/group/${group.id}` : '/groups'}
            accessibilityLabel="Voltar"
          />
          <Text className="flex-1 font-poppins-semibold text-2xl text-ink">Detalhes do grupo</Text>
        </View>
      }
      testID="group-info-screen"
    >
      <View className="relative mt-28 rounded-[2rem] bg-ink px-6 pb-10 pt-16">
        <View className="absolute -top-12 left-0 right-0 items-center">
          <View className="h-24 w-24 overflow-hidden rounded-full border-4 border-canvas bg-surface">
            {group ? (
              <Avatar
                photoUri={group.profilePic}
                accessibilityLabel={`Foto do grupo ${group.name}`}
                imageClassName="h-full w-full rounded-full"
                iconSize={42}
                testID="group-info-avatar"
              />
            ) : null}
          </View>
        </View>

        {canEdit ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Editar imagem do grupo"
            accessibilityState={{ disabled: isSaving }}
            disabled={isSaving}
            onPress={onEditImage}
            className={isSaving ? 'opacity-50' : 'opacity-100'}
            testID="group-info-edit-image"
          >
            <Text className="text-center font-poppins-medium text-xs text-surface underline">
              {isSaving ? 'Salvando…' : 'Editar imagem do grupo'}
            </Text>
          </Pressable>
        ) : null}

        {isEditingName ? (
          <View className="mt-6">
            <TextInput
              value={draftName}
              onChangeText={setDraftName}
              size="sm"
              autoFocus
              maxLength={100}
              disabled={isSaving}
              error={nameError ?? undefined}
              onBlur={() => void submitName()}
              testID="group-info-name-input"
            />
          </View>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Editar nome do grupo"
            accessibilityState={{ disabled: !canEdit || isSaving }}
            disabled={!canEdit || isSaving}
            onPress={startEditingName}
            className="mt-6 flex-row items-center justify-center gap-2 self-center rounded-full bg-lime px-6 py-2"
            testID="group-info-edit-name"
          >
            <Text className="font-poppins-semibold text-lg text-ink">{group?.name ?? ''}</Text>
            {canEdit ? (
              <Ionicons
                name="pencil"
                size={16}
                color={theme.colors.ink}
              />
            ) : null}
          </Pressable>
        )}

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
                profilePic={member.profilePic}
                dates={datesByMember.get(member.id) ?? []}
                isCurrentUser={member.id === currentUserId}
                onRemove={
                  canEdit && onRemoveMember && member.id !== currentUserId
                    ? () => {
                        setMemberToRemove(member);
                      }
                    : undefined
                }
                testID={`group-info-member-${member.id}`}
              />
            ))}
          </View>
        ) : (
          <Text className="mt-3 text-center text-sm font-medium text-canvas">
            {isLoading ? 'Carregando…' : 'Nenhum membro encontrado neste grupo.'}
          </Text>
        )}

        {inviteUrl ? (
          <View className="mt-6 gap-2">
            <Text className="text-center text-xs font-medium text-canvas">
              Tem alguém faltando? Compartilhe o link para convidar mais amigos para o grupo.
            </Text>
            <InviteLink
              variant="secondary"
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
        className="mb-16 mt-6 self-center rounded-full bg-ink px-8 py-3"
        testID="group-info-leave"
      >
        <Text className="font-poppins-semibold text-sm text-canvas">Sair do grupo</Text>
      </Pressable>

      <ModalFrame
        visible={memberToRemove !== null}
        onRequestClose={closeRemoveModal}
        closeOnBackdropPress
        title={memberToRemove ? `Remover ${memberToRemove.name} do grupo?` : undefined}
        testID="group-info-remove-modal"
      >
        <Text className="text-center font-poppins text-sm text-ink">
          A pessoa deixará de ver os encontros deste grupo.
        </Text>

        <View className="flex-row gap-4">
          <TouchableOpacity
            disabled={isRemoving}
            onPress={closeRemoveModal}
            className="flex-1 items-center justify-center rounded-full border-2 border-coral py-4"
            testID="group-info-remove-cancel"
          >
            <Text className="font-poppins-semibold leading-none text-coral">Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => void confirmRemoveMember()}
            disabled={isRemoving}
            className={`flex-1 items-center justify-center rounded-full bg-coral py-4 ${
              isRemoving ? 'opacity-60' : ''
            }`}
            testID="group-info-remove-confirm"
          >
            {isRemoving ? (
              <ActivityIndicator
                color={theme.colors.surface}
                testID="group-info-remove-confirm-loading"
              />
            ) : (
              <Text className="font-poppins-semibold leading-none text-surface">Remover</Text>
            )}
          </TouchableOpacity>
        </View>
      </ModalFrame>
    </ScreenFrame>
  );
}
