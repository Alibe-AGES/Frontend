import type { PlaceDetails } from '@/server/places';
import { buildPlaceProposalInput, buildProposalDescription } from './proposals';

const place: PlaceDetails = {
  externalId: 'google-1',
  name: ' Bloom Café ',
  imageUrl: 'https://example.com/cafe.jpg',
  description: null,
  address: ' Rua das Flores, 10 ',
  rating: 4.5,
  priceRange: { start: 20, end: null, currencyCode: 'BRL' },
  phoneNumber: '(51) 3333-4444',
  website: null,
  openingHours: [' Monday: 09:00-18:00 ', ''],
};

describe('buildProposalDescription', () => {
  test('keeps only the filled details, trimmed', () => {
    expect(
      buildProposalDescription({
        phoneNumber: ' 123 ',
        website: '  ',
        openingHours: [' Mon ', ''],
        priceStart: 0,
      })
    ).toBe(JSON.stringify({ phoneNumber: '123', openingHours: ['Mon'], priceStart: 0 }));
  });

  test('returns undefined when there is nothing to describe', () => {
    expect(buildProposalDescription({ openingHours: [] })).toBeUndefined();
  });
});

describe('buildPlaceProposalInput', () => {
  test('sends a Google place only by externalId and its photo', () => {
    expect(buildPlaceProposalInput(place, 'google-1', false)).toEqual({
      externalId: 'google-1',
      imageUrl: 'https://example.com/cafe.jpg',
    });
  });

  test('sends a saved location only by id', () => {
    expect(buildPlaceProposalInput(place, 'location-1', true)).toEqual({
      locationId: 'location-1',
    });
  });

  test('falls back to a manual place when there is no id to reuse', () => {
    expect(
      buildPlaceProposalInput({ ...place, externalId: null, address: '  ' }, 'unknown', false)
    ).toEqual({
      name: 'Bloom Café',
      description: JSON.stringify({
        phoneNumber: '(51) 3333-4444',
        openingHours: ['Monday: 09:00-18:00'],
        priceStart: 20,
      }),
    });
  });
});
