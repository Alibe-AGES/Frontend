export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterGroup {
  key: string;
  title: string;
  options: FilterOption[];
  multiple?: boolean;
}

export interface FilterSheetValue {
  minBudget: string;
  maxBudget: string;
  selections: Record<string, string[]>;
}

export interface FilterSheetProps {
  visible: boolean;
  value: FilterSheetValue;
  groups: FilterGroup[];
  budgetTitle?: string;
  onConfirm: (value: FilterSheetValue) => void;
  onClose: () => void;
  testID?: string;
}
