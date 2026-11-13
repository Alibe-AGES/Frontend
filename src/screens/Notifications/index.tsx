import NotificationsEmptyHands from '@/assets/images/notifications-empty-hands.svg';
import { Avatar } from '@/components/Avatar';
import { BackButton } from '@/components/BackButton';
import { Button } from '@/components/Button';
import { NavigationBar } from '@/components/NavigationBar';
import { AppNotification, NotificationCard } from '@/components/NotificationCard';
import { ScreenFrame } from '@/components/ScreenFrame';
import { useAuthenticatedImageSource } from '@/hooks/use-authenticated-image-source';
import { theme } from '@/theme';
import { ActivityIndicator, Text, View } from 'react-native';

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
  const hasNotifications = !isLoading && notifications.length > 0;

  const header = (
    <View className="gap-6">
      <View className="flex-row items-center gap-4">
        <BackButton
          fallbackHref={{ pathname: '/group/[id]', params: { id: groupId } }}
          accessibilityLabel="Voltar para o grupo"
        />
        <Text
          accessibilityRole="header"
          className="flex-1 font-poppins-semibold text-2xl text-ink"
          testID="notifications-title"
        >
          Notificações
        </Text>
      </View>

      <View
        className="flex-row items-center gap-3"
        testID="notifications-group"
      >
        <View className="h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-surface">
          <Avatar
            photoUri={groupPhotoSource}
            accessibilityLabel={`Foto do grupo ${groupName}`}
            imageClassName="w-full h-full"
            iconSize={28}
          />
        </View>

        <View className="flex-1">
          <Text
            className="font-poppins-semibold text-xl text-wine"
            numberOfLines={1}
          >
            {groupName}
          </Text>
          {membersText ? (
            <Text
              className="font-poppins text-base text-wine"
              numberOfLines={1}
            >
              {membersText}
            </Text>
          ) : null}
        </View>
      </View>

      {/* Part of the floating header, so it stays fixed above the list while it scrolls. */}
      {hasNotifications && (
        <View className="px-8">
          <Button
            title="Limpar notificações"
            variant="secondary"
            isLoading={isClearing}
            onPress={onClearNotifications}
            testID="notifications-clear"
          />
        </View>
      )}
    </View>
  );

  return (
    <ScreenFrame
      padding="horizontal"
      floatingChrome
      topFade="header"
      header={header}
      footer={<NavigationBar groupId={groupId} />}
      testID="notifications-screen"
    >
      {({ topInset }) => (
        // The header floats over the list, so the list starts below it and fades out behind it.
        <View
          className="flex-1 gap-6"
          style={{ paddingTop: topInset }}
        >
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
              className="-mx-8 flex-1 items-center justify-center gap-6"
              testID="notifications-empty"
            >
              <NotificationsEmptyHands
                width="100%"
                height={240}
                preserveAspectRatio="xMidYMid slice"
              />
              <Text className="px-10 text-center font-poppins-medium text-lg text-wine">
                Nenhuma novidade do grupo por enquanto
              </Text>
            </View>
          ) : null}

          {hasNotifications ? (
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

              {hasMore ? (
                <View className="items-center pt-2">
                  <Button
                    title="Carregar mais"
                    variant="secondary"
                    isLoading={isLoadingMore}
                    onPress={onLoadMore}
                    testID="notifications-load-more"
                  />
                </View>
              ) : null}
            </View>
          ) : null}
        </View>
      )}
    </ScreenFrame>
  );
}
