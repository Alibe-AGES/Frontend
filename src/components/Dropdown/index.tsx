import { useRef, useState } from 'react';
import { Pressable, Text, type View } from 'react-native';
import tw from 'twrnc';

import ChevronUpIcon from '@/assets/images/chevron-up.svg';
import { theme } from '@/theme';
import type { DropdownOption, DropdownProps } from './Dropdown.types';
import { DropdownMenu } from './DropdownMenu';
import type { TriggerFrame } from './dropdown.utils';

export type { DropdownOption, DropdownProps } from './Dropdown.types';

export function Dropdown({
  options,
  value,
  onChange,
  placeholder = 'Selecionar',
  emptyMessage = 'Nenhuma opção disponível',
  disabled = false,
  testID = 'alibe-dropdown',
}: Readonly<DropdownProps>) {
  const triggerRef = useRef<View | null>(null);
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

    setTriggerFrame(null);
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
        <DropdownMenu
          emptyMessage={emptyMessage}
          onClose={close}
          onSelect={handleSelect}
          options={options}
          testID={testID}
          triggerFrame={triggerFrame}
          value={value}
        />
      ) : null}
    </>
  );
}
