export interface FilterTag {
  id: string;
  label: string;
}

export interface FilterCarouselProps {
  tags: FilterTag[];
  selectedTagIds: string[];
  onToggleTag: (id: string) => void;
  onOpenFilters: () => void;
  hasActiveFilters?: boolean;
  /** Reaches the screen edges from inside the `px-6` gutter, keeping the first tag aligned to it. */
  fullBleed?: boolean;
  testID?: string;
}
