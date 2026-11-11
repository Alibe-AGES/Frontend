import type { MemoryEventSection } from '@/hooks/useGroupMemories';
import { flattenMemorySections, parseMemoryDate } from './memories';

const SECTIONS: MemoryEventSection[] = [
  {
    eventId: 'event-1',
    date: '2026-05-08',
    eventName: 'Restaurante Giozakaya',
    address: 'Av. Teixeira Mendes 1151',
    photos: [
      { id: 'photo-1', imageUrl: 'https://cdn.alibe.com/1.jpg' },
      { id: 'photo-2', imageUrl: 'https://cdn.alibe.com/2.jpg' },
    ],
  },
  {
    eventId: 'event-2',
    date: '2026-05-01',
    eventName: 'Parque',
    photos: [{ id: 'photo-3', imageUrl: 'https://cdn.alibe.com/3.jpg' }],
  },
];

describe('flattenMemorySections', () => {
  test('keeps the gallery order, one entry per photo', () => {
    expect(flattenMemorySections(SECTIONS).map((memory) => memory.id)).toEqual([
      'photo-1',
      'photo-2',
      'photo-3',
    ]);
  });

  test('copies event data onto each photo and falls back to an empty address', () => {
    const [first, , third] = flattenMemorySections(SECTIONS);

    expect(first).toEqual({
      id: 'photo-1',
      eventId: 'event-1',
      date: '2026-05-08',
      name: 'Restaurante Giozakaya',
      address: 'Av. Teixeira Mendes 1151',
      imageUrl: 'https://cdn.alibe.com/1.jpg',
    });
    expect(third.address).toBe('');
  });

  test('returns an empty list when there are no sections', () => {
    expect(flattenMemorySections([])).toEqual([]);
  });
});

describe('parseMemoryDate', () => {
  test('parses as a local date', () => {
    const parsed = parseMemoryDate('2026-05-08');

    expect([parsed.getFullYear(), parsed.getMonth(), parsed.getDate()]).toEqual([2026, 4, 8]);
  });
});
