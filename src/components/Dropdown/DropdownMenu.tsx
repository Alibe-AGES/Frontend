import { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import tw from 'twrnc';

import type { DropdownMenuProps } from './Dropdown.types';
import { getMenuLeft, getMenuMaxWidth, getMenuPlacement } from './dropdown.utils';

export function DropdownMenu({
  options,
  value,
  emptyMessage,
  triggerFrame,
  onSelect,
  onClose,
  testID,
}: Readonly<DropdownMenuProps>) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const [contentHeight, setContentHeight] = useState<number | null>(null);
  const [menuWidth, setMenuWidth] = useState<number | null>(null);

  const placement = getMenuPlacement(
    triggerFrame ?? { x: 0, y: 0, width: 0, height: 0 },
    contentHeight ?? 0,
    { height: windowHeight, topInset: insets.top, bottomInset: insets.bottom }
  );
  const opensUpward = placement.direction === 'up';
  // Stays invisible until every measurement arrives, so the menu never flashes in the wrong spot.
  const isMeasured = triggerFrame !== null && contentHeight !== null && menuWidth !== null;
  const maxWidth = getMenuMaxWidth(windowWidth);
  // Measured at the left edge first, so the screen width alone limits its natural width.
  const left =
    triggerFrame !== null && menuWidth !== null
      ? getMenuLeft(triggerFrame, menuWidth, windowWidth)
      : 0;

  // A modal lets the menu overlap content outside the parent card and close on outside taps.
  return (
    <Modal
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible
    >
      <Pressable
        accessibilityLabel="Fechar lista"
        className="absolute inset-0"
        onPress={onClose}
        testID={`${testID}-backdrop`}
      />
      <View
        accessibilityRole="menu"
        className={`absolute rounded-2xl bg-white shadow-md ${opensUpward ? 'mb-1' : 'mt-1'}`}
        onLayout={(event) => {
          setMenuWidth(event.nativeEvent.layout.width);
        }}
        style={{
          ...(opensUpward ? { bottom: placement.offset } : { top: placement.offset }),
          // A menu wider than the trigger (a long option or the empty message) stays centered under it.
          left,
          // At least as wide as the trigger, up to the cap: a longer label is cut with an ellipsis
          // instead of widening the menu.
          minWidth: Math.min(triggerFrame?.width ?? 0, maxWidth),
          maxWidth,
          maxHeight: placement.maxHeight,
          opacity: isMeasured ? 1 : 0,
        }}
        testID={`${testID}-menu`}
      >
        <ScrollView
          bounces={false}
          className="max-h-60"
          contentContainerClassName="gap-1 p-2"
          onContentSizeChange={(_width, height) => {
            setContentHeight(height);
          }}
          testID={`${testID}-options`}
        >
          {options.length === 0 ? (
            <Text
              className="px-3 py-2 font-poppins text-sm text-wine-soft"
              numberOfLines={1}
            >
              {emptyMessage}
            </Text>
          ) : null}
          {options.map((option) => {
            const isSelected = option.value === value;

            return (
              <Pressable
                key={option.value}
                accessibilityRole="menuitem"
                accessibilityState={{ selected: isSelected }}
                className={`rounded-lg px-3 py-2 ${isSelected ? 'bg-canvas' : 'bg-white'}`}
                onPress={() => {
                  onSelect(option);
                }}
                style={({ pressed }) => tw`${pressed ? 'opacity-75' : ''}`}
                testID={`${testID}-option-${option.value}`}
              >
                <Text
                  className="font-poppins text-sm text-wine"
                  numberOfLines={1}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );
}
