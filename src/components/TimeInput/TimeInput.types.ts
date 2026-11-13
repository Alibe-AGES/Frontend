export interface TimeInputProps {
  value: string;
  onChangeTime: (time: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  /** Highlights the field as invalid without a message, for when a sibling field shows it. */
  invalid?: boolean;
  disabled?: boolean;
  onBlur?: () => void;
  onFocus?: () => void;
  testID?: string;
}
