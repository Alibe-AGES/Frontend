export type NavigationBarAction =
  'matches' | 'search' | 'create' | 'memories' | 'groups' | 'profile';

export interface NavigationBarProps {
  groupId: string;
  className?: string;
}
