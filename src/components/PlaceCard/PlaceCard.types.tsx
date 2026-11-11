export type PlaceCardColor = 'coral' | 'lime' | 'pink' | 'wine';

export interface PlaceCardProps {
  name: string;
  address: string;
  imageUri?: string;
  imageHeaders?: Record<string, string>;
  color?: PlaceCardColor;
  onClickCard?: (text: string) => void;
  // TODO: Restore these props when backend favorite integration is ready.
  // onToggleFavorite?: () => void;
  // isFavorite?: boolean;
  testID?: string;
}
