import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import Toast from 'react-native-toast-message';
import tw from 'twrnc';

import type { ModalFramePlacement, ModalFrameProps } from './ModalFrame.types';

export type { ModalFramePlacement, ModalFrameProps } from './ModalFrame.types';

const BACKDROP_CLASSES: Record<ModalFramePlacement, string> = {
  center: 'absolute inset-0 bg-black/50',
  bottom: 'absolute inset-0 bg-ink/40',
};

export function ModalFrame({
  visible,
  onRequestClose,
  children,
  placement = 'center',
  title,
  closeOnBackdropPress = false,
  backdropLabel = 'Fechar',
  testID = 'modal-frame',
}: ModalFrameProps) {
  const isCentered = placement === 'center';

  return (
    <Modal
      transparent
      animationType={isCentered ? 'fade' : 'slide'}
      visible={visible}
      onRequestClose={onRequestClose}
      testID={testID}
    >
      {/*
        A Modal is a separate native window, so the screen-level keyboard handling does not reach it.
        The library's KeyboardAvoidingView receives keyboard events forwarded from the modal window,
        and automaticOffset measures the real on-screen position inside it.
      */}
      <KeyboardAvoidingView
        behavior="padding"
        automaticOffset
        style={tw`flex-1 ${isCentered ? '' : 'justify-end'}`}
        testID={`${testID}-keyboard-container`}
      >
        {closeOnBackdropPress ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={backdropLabel}
            className={BACKDROP_CLASSES[placement]}
            onPress={onRequestClose}
            testID={`${testID}-backdrop`}
          />
        ) : (
          <View
            className={BACKDROP_CLASSES[placement]}
            testID={`${testID}-backdrop`}
          />
        )}

        {isCentered ? (
          <ScrollView
            style={tw`flex-1`}
            contentContainerStyle={tw`flex-grow items-center justify-center p-6`}
            keyboardShouldPersistTaps="handled"
            testID={`${testID}-scroll`}
          >
            <View
              className="w-full max-w-md gap-5 rounded-3xl bg-canvas p-6 shadow-lg"
              testID={`${testID}-panel`}
            >
              {title ? (
                <Text className="text-center font-poppins-semibold text-xl text-wine">{title}</Text>
              ) : null}
              {children}
            </View>
          </ScrollView>
        ) : (
          children
        )}
      </KeyboardAvoidingView>
      {/* Toasts must render inside the Modal window to appear above it. */}
      <Toast />
    </Modal>
  );
}
