import { ReactElement } from 'react';

export interface Place {
  id: string;
  name: string;
  address: string;
  photoUri?: string;
  photoHeaders?: Record<string, string>;
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
  hasMore?: boolean;
  isLoading?: boolean;
  isLoadingMore?: boolean;
  error?: string | null;
  loadMoreError?: string | null;
  onRetry?: () => void;
  onLoadMore?: () => void;
  onPlacePress?: (id: string) => void;
  header?: ReactElement;
  footer?: ReactElement;
  contentContainerClassName?: string;
  testID?: string;
}

export type { PlaceCardColor } from '@/components/PlaceCard/PlaceCard.types';
