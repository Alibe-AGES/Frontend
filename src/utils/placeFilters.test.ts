import { EMPTY_FILTER_VALUE } from '@/components/FilterSheet';
import { MOCK_PLACES } from '@/server/mock/places';
import { matchesPlaceFilters, PlaceFilterCriteria } from './placeFilters';

const base: PlaceFilterCriteria = { query: '', tagIds: [], sheet: EMPTY_FILTER_VALUE };

const names = (criteria: Partial<PlaceFilterCriteria>) =>
  MOCK_PLACES.filter((place) => matchesPlaceFilters(place, { ...base, ...criteria })).map(
    (place) => place.name
  );

describe('matchesPlaceFilters', () => {
  test('keeps every place without criteria', () => {
    expect(names({})).toHaveLength(MOCK_PLACES.length);
  });

  test('matches the query ignoring accents and case', () => {
    expect(names({ query: 'ESTUDIO' })).toEqual(['Estúdio de Yoga']);
  });

  test('filters by category tags', () => {
    expect(names({ tagIds: ['bar'] })).toEqual(['Sunset Rooftop']);
  });

  test('filters by maximum distance, ignoring "any"', () => {
    const sheet = (value: string) => ({ ...base.sheet, selections: { distance: [value] } });

    expect(names({ sheet: sheet('2') })).toEqual(['Bloom Café', 'Estúdio de Yoga']);
    expect(names({ sheet: sheet('any') })).toHaveLength(MOCK_PLACES.length);
  });

  test('filters multi-select groups by any matching value', () => {
    const sheet = { ...base.sheet, selections: { period: ['morning'], environment: ['outdoor'] } };

    expect(names({ sheet })).toEqual(['Estúdio de Yoga']);
  });

  test('filters by budget range', () => {
    const sheet = { ...base.sheet, minBudget: '100', maxBudget: '120' };

    expect(names({ sheet })).toEqual(['Pampa Grill Steakhouse', 'Aula de Cerâmica']);
  });

  test('combines criteria', () => {
    const sheet = { ...base.sheet, maxBudget: '60' };

    expect(names({ query: 'a', tagIds: ['class'], sheet })).toEqual(['Estúdio de Yoga']);
  });
});
