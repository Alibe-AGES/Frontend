import { ActivityIndicator, Modal, Pressable, Text, View } from 'react-native';
import { theme } from '@/theme';
import tw from 'twrnc';

export interface LeaveGroupScreenProps {
  readonly groupName?: string;
  readonly isLeaving?: boolean;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
}

export function LeaveGroupScreen({
  groupName,
  isLeaving = false,
  onConfirm,
  onCancel,
}: LeaveGroupScreenProps) {
  return (
    <View className="flex-1 items-center justify-center bg-canvas px-6">
      <Modal
        transparent
        animationType="fade"
        visible
        onRequestClose={onCancel}
      >
        <Pressable
          className="flex-1 items-center justify-center bg-black/40 px-6"
          onPress={onCancel}
          testID="leave-group-backdrop"
        >
          <Pressable
            className="w-full max-w-sm rounded-[2rem] bg-ink px-6 py-8"
            onPress={(e) => {
              e.stopPropagation();
            }}
            testID="leave-group-dialog"
          >
            <Text className="text-center font-poppins-medium text-xl leading-7 text-lime">
              Tem certeza de que deseja sair{groupName ? ` do grupo ${groupName}` : ' do grupo'}?
            </Text>

            <Text className="mt-3 text-center font-poppins text-sm text-canvas">
              Ao sair, você não verá mais os encontros deste grupo.
            </Text>

            <View className="mt-6 flex-row gap-3">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cancelar"
                accessibilityState={{ disabled: isLeaving }}
                disabled={isLeaving}
                onPress={onCancel}
                style={({ pressed }) => tw`${pressed ? 'opacity-25' : ''}`}
                className="flex-1 items-center rounded-full bg-lime py-4"
                testID="leave-group-cancel"
              >
                <Text className="font-poppins-semibold text-sm leading-none text-ink">
                  Cancelar
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Sair do grupo"
                accessibilityState={{ disabled: isLeaving, busy: isLeaving }}
                disabled={isLeaving}
                onPress={onConfirm}
                className="flex-1 items-center justify-center rounded-full border-2 border-lime py-3"
                testID="leave-group-confirm"
              >
                {isLeaving ? (
                  <ActivityIndicator
                    color={theme.colors.lime}
                    testID="leave-group-loading"
                  />
                ) : (
                  <Text className="font-poppins-semibold text-sm text-lime">Sair do grupo</Text>
                )}
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
