import { theme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { FC } from 'react';
import { Pressable, Text, View } from 'react-native';
import tw from 'twrnc';
import { NotificationCardProps } from './NotificationCard.types';
import { getNotificationContent } from './notificationContent';

export type {
  AppNotification,
  NotificationCardProps,
  NotificationType,
} from './NotificationCard.types';
export { getNotificationContent } from './notificationContent';

export const NotificationCard: FC<NotificationCardProps> = ({
  notification,
  onPress,
  onActionPress,
  onDismiss,
  testID = 'alibe-notification-card',
}) => {
  const { icon, actionLabel } = getNotificationContent(notification.type);

  return (
    <View
      className="w-full pl-3 pt-1"
      testID={`${testID}-container`}
    >
      <View className="ml-3 gap-2 rounded-3xl bg-lime-soft pb-3 pl-9 pr-3">
        {/* Sibling pressables: nesting buttons is invalid HTML on web. */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Abrir grupo: ${notification.message}`}
          onPress={() => onPress?.(notification)}
          style={({ pressed }) => tw`${pressed ? 'opacity-75' : 'opacity-100'}`}
          className="gap-1 pr-5 pt-3"
          testID={testID}
        >
          <Text
            className="font-poppins text-sm leading-5 text-wine"
            testID={`${testID}-message`}
          >
            {notification.message}
          </Text>
        </Pressable>

        {onActionPress ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={actionLabel}
            onPress={() => {
              onActionPress(notification);
            }}
            style={({ pressed }) => tw`${pressed ? 'opacity-75' : 'opacity-100'}`}
            className="flex-row items-center justify-center gap-2 rounded-full bg-ink px-4 py-2"
            testID={`${testID}-action`}
          >
            <Text className="flex-shrink text-center font-poppins text-sm text-surface">
              {actionLabel}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={14}
              color={theme.colors.surface}
            />
          </Pressable>
        ) : null}
      </View>

      <View
        className="absolute left-0 top-0 h-11 w-11 items-center justify-center rounded-full bg-wine"
        pointerEvents="none"
        testID={`${testID}-icon`}
      >
        <Ionicons
          name={icon}
          size={22}
          color={theme.colors.surface}
        />
      </View>

      {onDismiss ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dispensar notificação"
          hitSlop={12}
          onPress={() => {
            onDismiss(notification.id);
          }}
          className="absolute right-3 top-3"
          testID={`${testID}-dismiss`}
        >
          <Ionicons
            name="close"
            size={16}
            color={theme.colors.wine}
          />
        </Pressable>
      ) : null}
    </View>
  );
};
