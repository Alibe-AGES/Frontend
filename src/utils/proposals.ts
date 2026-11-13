import type { CreateProposalInput } from '@/server/events';
import type { PlaceDetails } from '@/server/places';

export interface ProposalPlaceDetails {
  phoneNumber?: string;
  website?: string;
  openingHours?: string[];
  priceStart?: number;
  priceEnd?: number;
}

/** The backend stores a place's extra details as JSON in the proposal description. */
export function buildProposalDescription(details: ProposalPlaceDetails): string | undefined {
  const phoneNumber = details.phoneNumber?.trim();
  const website = details.website?.trim();
  const openingHours = (details.openingHours ?? []).map((line) => line.trim()).filter(Boolean);

  const description = {
    ...(phoneNumber ? { phoneNumber } : {}),
    ...(website ? { website } : {}),
    ...(openingHours.length > 0 ? { openingHours } : {}),
    ...(details.priceStart === undefined ? {} : { priceStart: details.priceStart }),
    ...(details.priceEnd === undefined ? {} : { priceEnd: details.priceEnd }),
  };

  return Object.keys(description).length > 0 ? JSON.stringify(description) : undefined;
}

/**
 * Builds the proposal for a place opened from the experiences list. The backend loads everything
 * else itself: a saved place by its id, a Google place by its externalId. The Google photo is
 * the only detail it can't fetch, so it goes along. A place without either id is sent as manual.
 */
export function buildPlaceProposalInput(
  details: PlaceDetails,
  placeId: string,
  isStoredLocation: boolean
): CreateProposalInput {
  if (isStoredLocation) return { locationId: placeId };

  if (details.externalId) {
    return {
      externalId: details.externalId,
      ...(details.imageUrl ? { imageUrl: details.imageUrl } : {}),
    };
  }

  const description = buildProposalDescription({
    phoneNumber: details.phoneNumber ?? undefined,
    website: details.website ?? undefined,
    openingHours: details.openingHours,
    priceStart: details.priceRange?.start ?? undefined,
    priceEnd: details.priceRange?.end ?? undefined,
  });

  return {
    name: details.name.trim(),
    ...(details.address?.trim() ? { address: details.address.trim() } : {}),
    ...(description ? { description } : {}),
  };
}
