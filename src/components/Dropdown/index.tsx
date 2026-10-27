import { useRef, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import tw from 'twrnc';

import ChevronUpIcon from '@/assets/images/chevron-up.svg';
import { theme } from '@/theme';
import type { DropdownOption, DropdownProps } from './Dropdown.types';

export type { DropdownOption, DropdownProps } from './Dropdown.types';

interface TriggerFrame {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function Dropdown({
  options,
  value,
  onChange,
  placeholder = 'Selecionar',
  emptyMessage = 'Nenhuma opção disponível',
  disabled = false,
  testID = 'alibe-dropdown',
}: DropdownProps) {
  const triggerRef = useRef<View>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [triggerFrame, setTriggerFrame] = useState<TriggerFrame | null>(null);
  const selectedOption = options.find((option) => option.value === value);
  const isExpanded = isOpen && !disabled;

  const close = () => {
    setIsOpen(false);
  };

  const handleTriggerPress = () => {
    if (isOpen) {
      close();
      return;
    }

    setIsOpen(true);
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setTriggerFrame({ x, y, width, height });
    });
  };

  const handleSelect = (option: DropdownOption) => {
    onChange(option.value);
    close();
  };

  return (
    <>
      <Pressable
        ref={triggerRef}
        accessibilityLabel={selectedOption?.label ?? placeholder}
        accessibilityRole="combobox"
        accessibilityState={{ disabled, expanded: isExpanded }}
        className={`flex-row items-center gap-2 self-center px-4 py-3 ${disabled ? 'opacity-50' : 'opacity-100'}`}
        disabled={disabled}
        onPress={handleTriggerPress}
        style={({ pressed }) => tw`${pressed ? 'opacity-75' : ''}`}
        testID={testID}
      >
        <Text className="font-poppins text-sm text-wine">
          {selectedOption?.label ?? placeholder}
        </Text>
        <ChevronUpIcon
          color={theme.colors.wine}
          height={12}
          style={{ transform: [{ rotate: isExpanded ? '0deg' : '180deg' }] }}
          width={12}
        />
      </Pressable>
      {isExpanded ? (
        // A modal lets the menu overlap content outside the parent card and close on outside taps.
        <Modal
          animationType="none"
          onRequestClose={close}
          statusBarTranslucent
          transparent
          visible
        >
          <Pressable
            accessibilityLabel="Fechar lista"
            className="absolute inset-0"
            onPress={close}
            testID={`${testID}-backdrop`}
          />
          <View
            accessibilityRole="menu"
            className="absolute mt-1 gap-1 rounded-2xl bg-white p-2 shadow-md"
            style={{
              top: triggerFrame ? triggerFrame.y + triggerFrame.height : 0,
              left: triggerFrame?.x ?? 0,
              minWidth: triggerFrame?.width ?? 0,
              opacity: triggerFrame ? 1 : 0,
            }}
            testID={`${testID}-menu`}
          >
            {options.length === 0 ? (
              <Text className="px-3 py-2 font-poppins text-sm text-wine-soft">{emptyMessage}</Text>
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
                    handleSelect(option);
                  }}
                  style={({ pressed }) => tw`${pressed ? 'opacity-75' : ''}`}
                  testID={`${testID}-option-${option.value}`}
                >
                  <Text className="font-poppins text-sm text-wine">{option.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </Modal>
      ) : null}
    </>
  );
}
