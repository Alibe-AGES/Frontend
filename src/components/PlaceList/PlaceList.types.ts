import { ReactElement } from 'react';

import { PlaceCardColor } from '@/components/PlaceCard/PlaceCard.types';

export interface Place {
  id: string;
  name: string;
  address: string;
  photoUri?: string;
  category?: string;
  distanceKm?: number;
  periods?: string[];
  environments?: string[];
  idealFor?: string[];
  averagePrice?: number;
}

export interface PlaceListProps {
  places: Place[];
  filter?: (place: Place) => boolean;
  pageSize?: number;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onPlacePress?: (id: string) => void;
  header?: ReactElement;
  contentContainerClassName?: string;
  testID?: string;
}

export type { PlaceCardColor };
