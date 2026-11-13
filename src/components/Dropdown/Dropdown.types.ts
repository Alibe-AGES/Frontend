import type { TriggerFrame } from './dropdown.utils';

export interface DropdownOption {
  label: string;
  value: string;
}

export interface DropdownProps {
  options: DropdownOption[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  testID?: string;
}

export interface DropdownMenuProps {
  options: DropdownOption[];
  value: string | null;
  emptyMessage: string;
  // Trigger position on screen; null while it is still being measured.
  triggerFrame: TriggerFrame | null;
  onSelect: (option: DropdownOption) => void;
  onClose: () => void;
  testID: string;
}
