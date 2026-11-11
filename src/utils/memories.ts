import type { MemoryEventSection } from '@/hooks/useGroupMemories';

export interface CarouselMemory {
  id: string;
  eventId: string;
  date: string;
  name: string;
  address: string;
  imageUrl: string;
}

// The carousel walks the whole gallery in the same order the gallery shows it.
export function flattenMemorySections(sections: MemoryEventSection[]): CarouselMemory[] {
  return sections.flatMap((section) =>
    section.photos.map((photo) => ({
      id: photo.id,
      eventId: section.eventId,
      date: section.date,
      name: section.eventName,
      address: section.address ?? '',
      imageUrl: photo.imageUrl,
    }))
  );
}

// Parses a `YYYY-MM-DD` string as a local date, avoiding the UTC shift of `new Date(string)`.
export function parseMemoryDate(dateString: string): Date {
  const [year = 0, month = 1, day = 1] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}
