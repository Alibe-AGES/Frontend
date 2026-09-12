export type NavigationBarAction = 'matches' | 'search' | 'create' | 'memories' | 'groups';

export interface NavigationBarProps {
  groupId: string;
  disabled?: boolean;
  className?: string;
}
