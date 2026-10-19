export type PlaceCardColor = 'coral' | 'lime' | 'pink' | 'wine';

export interface PlaceCardProps {
  name: string;
  address: string;
  imageUri?: string;
  color?: PlaceCardColor;
  onClickCard?: (text: string) => void;
  onToggleFavorite?: () => void;
  isFavorite?: boolean;
  testID?: string;
}
