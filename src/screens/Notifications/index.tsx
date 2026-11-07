import NotificationsEmptyHands from '@/assets/images/notifications-empty-hands.svg';
import { BackButton } from '@/components/BackButton';
import { Button } from '@/components/Button';
import { NavigationBar } from '@/components/NavigationBar';
import { AppNotification, NotificationCard } from '@/components/NotificationCard';
import { ScreenFrame } from '@/components/ScreenFrame';
import { useAuthenticatedImageSource } from '@/hooks/use-authenticated-image-source';
import { theme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { ActivityIndicator, Text, View } from 'react-native';
import tw from 'twrnc';

export interface NotificationsScreenProps {
  groupId: string;
  groupName: string;
  groupPhoto: string | null;
  membersText: string;
  notifications: AppNotification[];
  hasMore: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  isClearing: boolean;
  errorMessage: string | null;
  onPressNotification: (notification: AppNotification) => void;
  onActionPressNotification: (notification: AppNotification) => void;
  onDismissNotification: (id: string) => void;
  onClearNotifications: () => void;
  onLoadMore: () => void;
  onRetry: () => void;
}

export function NotificationsScreen({
  groupId,
  groupName,
  groupPhoto,
  membersText,
  notifications,
  hasMore,
  isLoading,
  isLoadingMore,
  isClearing,
  errorMessage,
  onPressNotification,
  onActionPressNotification,
  onDismissNotification,
  onClearNotifications,
  onLoadMore,
  onRetry,
}: Readonly<NotificationsScreenProps>) {
  const groupPhotoSource = useAuthenticatedImageSource(groupPhoto);
  const isEmpty = !isLoading && !errorMessage && notifications.length === 0;

  return (
    <ScreenFrame
      gap="lg"
      footer={<NavigationBar groupId={groupId} />}
      testID="notifications-screen"
    >
      <View className="flex-row items-center">
        <BackButton
          fallbackHref={{ pathname: '/group/[id]', params: { id: groupId } }}
          accessibilityLabel="Voltar para o grupo"
        />
      </View>

      <View className="flex-row items-center gap-3">
        <View className="h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-coral">
          {groupPhotoSource ? (
            <Image
              source={groupPhotoSource}
              accessibilityLabel={`Foto do grupo ${groupName}`}
              contentFit="cover"
              style={tw`h-16 w-16 rounded-full`}
            />
          ) : (
            <Ionicons
              name="people-outline"
              size={26}
              color={theme.colors.coral}
            />
          )}
        </View>

        <View className="flex-1">
          <Text
            className="font-poppins-light text-xl text-wine"
            numberOfLines={1}
          >
            {groupName}
          </Text>
          {membersText ? (
            <Text
              className="font-poppins-semibold text-base text-wine"
              numberOfLines={1}
            >
              {membersText}
            </Text>
          ) : null}
        </View>
      </View>

      {isLoading ? (
        <View
          className="items-center gap-3 py-10"
          testID="notifications-loading"
        >
          <ActivityIndicator color={theme.colors.ink} />
          <Text className="font-poppins text-sm text-ink">Carregando notificações…</Text>
        </View>
      ) : null}

      {errorMessage ? (
        <View
          className="items-center gap-4 py-10"
          testID="notifications-error"
        >
          <Text className="text-center font-poppins text-base text-wine">{errorMessage}</Text>
          <Button
            title="Tentar de novo"
            variant="secondary"
            onPress={onRetry}
            testID="notifications-retry"
          />
        </View>
      ) : null}

      {isEmpty ? (
        <View
          className="-mx-6 flex-1 items-center justify-center gap-6"
          testID="notifications-empty"
        >
          <NotificationsEmptyHands
            width="100%"
            height={240}
            preserveAspectRatio="xMidYMid slice"
          />
          <Text className="px-10 text-center font-poppins-semibold text-xl text-wine">
            Nenhuma novidade do grupo por enquanto
          </Text>
        </View>
      ) : null}

      {!isLoading && notifications.length > 0 ? (
        <View className="gap-3">
          {notifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onPress={onPressNotification}
              onActionPress={onActionPressNotification}
              onDismiss={onDismissNotification}
              testID={`notifications-card-${notification.id}`}
            />
          ))}

          <View className="items-center gap-3 pt-2">
            {hasMore ? (
              <Button
                title="Carregar mais"
                variant="secondary"
                isLoading={isLoadingMore}
                onPress={onLoadMore}
                testID="notifications-load-more"
              />
            ) : null}

            <Button
              title="Limpar notificações"
              variant="tertiary"
              isLoading={isClearing}
              onPress={onClearNotifications}
              testID="notifications-clear"
            />
          </View>
        </View>
      ) : null}
    </ScreenFrame>
  );
}
