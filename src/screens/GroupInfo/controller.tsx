import { useDefaultPhotoPickerController } from '@/components/PhotoPicker/controllers/useDefaultPhotoPickerController';
import type { SelectedPhoto } from '@/components/PhotoPicker/PhotoPicker.types';
import { GroupInfoScreen, type MemberAvailability } from '@/screens/GroupInfo';
import { getGroupCalendar } from '@/server/calendar';
import {
  getGroup,
  getGroupInviteLink,
  getMe,
  updateGroup,
  type GroupDetails,
  type UpdateGroupInput,
} from '@/server/groups';
import * as Linking from 'expo-linking';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';

const GROUP_NAME_MIN_LENGTH = 2;
const GROUP_NAME_MAX_LENGTH = 100;

function buildMemberAvailabilities(
  days: { date: string; availableUserIds: string[] }[]
): MemberAvailability[] {
  const byMember = new Map<string, string[]>();

  for (const day of days) {
    for (const userId of day.availableUserIds) {
      const existing = byMember.get(userId) ?? [];
      existing.push(day.date);
      byMember.set(userId, existing);
    }
  }

  return [...byMember.entries()].map(([memberId, dates]) => ({
    memberId,
    dates: dates.toSorted((first, second) => first.localeCompare(second)),
  }));
}

export default function GroupInfoController() {
  const router = useRouter();
  const { id: groupId } = useLocalSearchParams<{ id: string }>();

  const [group, setGroup] = useState<GroupDetails | null>(null);
  const [availabilities, setAvailabilities] = useState<MemberAvailability[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [inviteExpiresAt, setInviteExpiresAt] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const load = useCallback(async () => {
    if (!groupId) {
      return;
    }

    setIsLoading(true);

    try {
      const now = new Date();
      const [groupData, days] = await Promise.all([
        getGroup(groupId),
        getGroupCalendar(groupId, now.getMonth() + 1, now.getFullYear()),
      ]);

      setGroup(groupData);
      setAvailabilities(buildMemberAvailabilities(days));
    } catch (error) {
      console.error('Erro ao carregar informações do grupo', error);
    } finally {
      setIsLoading(false);
    }
  }, [groupId]);

  const loadInvite = useCallback(async () => {
    if (!groupId) {
      return;
    }

    try {
      const invite = await getGroupInviteLink(groupId);
      setInviteExpiresAt(invite.expiresAt);
      setInviteUrl(Linking.createURL('/groups', { queryParams: { invite: invite.token } }));
    } catch (error) {
      console.error('Erro ao carregar link de convite', error);
    }
  }, [groupId]);

  useEffect(() => {
    void load();
    void loadInvite();

    getMe()
      .then((user) => {
        setCurrentUserId(user.id);
      })
      .catch(() => {
        setCurrentUserId(undefined);
      });
  }, [load, loadInvite]);

  const saveGroup = async (input: UpdateGroupInput, localPhotoUri?: string): Promise<boolean> => {
    if (!groupId) {
      return false;
    }

    setIsSaving(true);

    try {
      const updated = await updateGroup(groupId, input);
      // The picture keeps the same URL after an edit, so the cached image would come back; the
      // picked file is shown instead until the screen loads again.
      setGroup((current) =>
        current
          ? {
              ...current,
              name: updated.name,
              profilePic: localPhotoUri ?? updated.profilePic,
            }
          : current
      );
      return true;
    } catch (error) {
      console.error('Erro ao atualizar o grupo', error);
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível atualizar o grupo. Tente novamente.',
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoPicked = async (photo: SelectedPhoto) => {
    const saved = await saveGroup({ image: photo }, photo.uri);

    if (saved) {
      Toast.show({ type: 'success', text1: 'Sucesso!', text2: 'Imagem do grupo atualizada.' });
    }
  };

  const photoPicker = useDefaultPhotoPickerController({
    onUploadSuccess: (photo) => void handlePhotoPicked(photo),
  });

  const handleRenameGroup = async (name: string): Promise<string | null> => {
    const trimmed = name.trim();

    if (trimmed.length < GROUP_NAME_MIN_LENGTH || trimmed.length > GROUP_NAME_MAX_LENGTH) {
      return `O nome deve conter entre ${String(GROUP_NAME_MIN_LENGTH)} e ${String(GROUP_NAME_MAX_LENGTH)} caracteres.`;
    }

    if (trimmed === group?.name) {
      return null;
    }

    const saved = await saveGroup({ name: trimmed });
    return saved ? null : 'Não foi possível salvar o nome.';
  };

  const handleLeaveGroup = () => {
    if (!groupId) {
      return;
    }

    router.push({ pathname: '/group/[id]/leave', params: { id: groupId } });
  };

  return (
    <GroupInfoScreen
      group={group}
      availabilities={availabilities}
      currentUserId={currentUserId}
      inviteUrl={inviteUrl}
      inviteExpiresAt={inviteExpiresAt}
      isLoading={isLoading}
      canEdit={Boolean(group?.ownerId) && group?.ownerId === currentUserId}
      isSaving={isSaving || photoPicker.isLoading}
      onEditImage={() => void photoPicker.pickImage()}
      onRenameGroup={handleRenameGroup}
      onLeaveGroup={handleLeaveGroup}
      onRefreshInvite={() => void loadInvite()}
    />
  );
}
