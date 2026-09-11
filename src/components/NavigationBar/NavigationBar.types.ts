export type NavigationBarAction = 'matches' | 'search' | 'create' | 'memories' | 'groups';

export interface NavigationBarStrategy {
  navigate: (action: NavigationBarAction) => void;
}

export type UseNavigationBarStrategyHook = () => NavigationBarStrategy;

export interface NavigationBarProps {
  groupId: string;
  useController?: UseNavigationBarStrategyHook;
  disabled?: boolean;
  className?: string;
}
