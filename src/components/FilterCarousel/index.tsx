import { theme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Pressable, ScrollView, Text } from 'react-native';
import type { FilterCarouselProps } from './FilterCarousel.types';

export type { FilterCarouselProps, FilterTag } from './FilterCarousel.types';

export function FilterCarousel({
  tags,
  selectedTagIds,
  onToggleTag,
  onOpenFilters,
  hasActiveFilters = false,
  testID = 'filter-carousel',
}: FilterCarouselProps) {
  const scrollRef = useRef<ScrollView>(null);
  // Selected tags come first, keeping the original order within each group.
  const orderedTags = [
    ...tags.filter((tag) => selectedTagIds.includes(tag.id)),
    ...tags.filter((tag) => !selectedTagIds.includes(tag.id)),
  ];

  useEffect(() => {
    scrollRef.current?.scrollTo({ x: 0, animated: true });
  }, [selectedTagIds]);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="items-center gap-2"
      testID={testID}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Abrir filtros"
        accessibilityState={{ selected: hasActiveFilters }}
        className={`h-9 w-9 items-center justify-center rounded-full active:opacity-75 ${
          hasActiveFilters ? 'bg-ink' : 'bg-lime'
        }`}
        onPress={onOpenFilters}
        testID={`${testID}-open-filters`}
      >
        <Ionicons
          name="options-outline"
          size={18}
          color={hasActiveFilters ? theme.colors.lime : theme.colors.ink}
        />
      </Pressable>
      {orderedTags.map((tag) => {
        const isSelected = selectedTagIds.includes(tag.id);

        return (
          <Pressable
            key={tag.id}
            accessibilityRole="button"
            accessibilityLabel={tag.label}
            accessibilityState={{ selected: isSelected }}
            className={`rounded-full px-4 py-2 active:opacity-75 ${
              isSelected ? 'bg-ink' : 'bg-lime'
            }`}
            onPress={() => {
              onToggleTag(tag.id);
            }}
            testID={`${testID}-tag-${tag.id}`}
          >
            <Text className={`font-poppins text-xs ${isSelected ? 'text-lime' : 'text-ink'}`}>
              {tag.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
