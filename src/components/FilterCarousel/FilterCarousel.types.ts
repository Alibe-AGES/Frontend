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
  testID?: string;
}
