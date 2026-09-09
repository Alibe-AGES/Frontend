export interface TimeInputProps {
  value: string;
  onChangeTime: (time: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  onBlur?: () => void;
  testID?: string;
}
