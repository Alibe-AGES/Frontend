import type { FilterSheetValue } from '@/components/FilterSheet/FilterSheet.types';
import type { Place } from '@/components/PlaceList/PlaceList.types';

export interface PlaceFilterCriteria {
  query: string;
  tagIds: string[];
  sheet: FilterSheetValue;
}

function normalize(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

function selected(sheet: FilterSheetValue, key: string): string[] {
  return key in sheet.selections ? sheet.selections[key] : [];
}

function matchesAny(values: string[], placeValues: string[] | undefined): boolean {
  return values.length === 0 || values.some((value) => placeValues?.includes(value));
}

// A place passes when it satisfies every active criterion; unset criteria are ignored.
export function matchesPlaceFilters(place: Place, criteria: PlaceFilterCriteria): boolean {
  const { query, tagIds, sheet } = criteria;
  const text = normalize(query.trim());

  if (text && !normalize(`${place.name} ${place.address}`).includes(text)) {
    return false;
  }

  if (tagIds.length > 0 && !(place.category && tagIds.includes(place.category))) {
    return false;
  }

  const [distance] = selected(sheet, 'distance');
  if (distance && distance !== 'any') {
    if (place.distanceKm === undefined || place.distanceKm > Number(distance)) {
      return false;
    }
  }

  if (
    !matchesAny(selected(sheet, 'period'), place.periods) ||
    !matchesAny(selected(sheet, 'environment'), place.environments) ||
    !matchesAny(selected(sheet, 'idealFor'), place.idealFor)
  ) {
    return false;
  }

  const min = sheet.minBudget ? Number(sheet.minBudget) : undefined;
  const max = sheet.maxBudget ? Number(sheet.maxBudget) : undefined;
  if (min !== undefined || max !== undefined) {
    if (place.averagePrice === undefined) return false;
    if (min !== undefined && place.averagePrice < min) return false;
    if (max !== undefined && place.averagePrice > max) return false;
  }

  return true;
}
