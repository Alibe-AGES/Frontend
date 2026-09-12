import { Image } from 'expo-image';
import { useContext } from 'react';
import { Pressable, View } from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import tw from 'twrnc';

import heartIcon from '@/assets/images/nav-heart.svg';
import hourglassIcon from '@/assets/images/nav-hourglass.svg';
import searchIcon from '@/assets/images/nav-search.svg';
import swapIcon from '@/assets/images/nav-swap.svg';
import {
  NavigationBarAction,
  NavigationBarProps,
} from '@/components/NavigationBar/NavigationBar.types';
import { useDefaultNavigationBarController } from '@/components/NavigationBar/controllers/useDefaultNavigationBarController';
import { theme } from '@/theme';

interface IconItem {
  action: Exclude<NavigationBarAction, 'create'>;
  icon: typeof heartIcon;
  label: string;
  size: string;
}

const LEFT_ITEMS: IconItem[] = [
  {
    action: 'matches',
    icon: heartIcon,
    label: 'Match de rolês',
    size: 'h-[1.375rem] w-[1.5625rem]',
  },
  {
    action: 'search',
    icon: searchIcon,
    label: 'Experiências',
    size: 'h-[1.1875rem] w-[1.1875rem]',
  },
];

const RIGHT_ITEMS: IconItem[] = [
  {
    action: 'memories',
    icon: hourglassIcon,
    label: 'Memórias',
    size: 'h-[1.3125rem] w-[1.0625rem]',
  },
  {
    action: 'groups',
    icon: swapIcon,
    label: 'Meus grupos',
    size: 'h-[1.3125rem] w-[1.1875rem]',
  },
];

const BOTTOM_GAP = 24;

export const NavigationBar: React.FC<NavigationBarProps> = ({ groupId, className = '' }) => {
  const { navigate } = useDefaultNavigationBarController({ groupId });
  const insets = useContext(SafeAreaInsetsContext);

  const renderIcon = ({ action, icon, label, size }: IconItem) => (
    <Pressable
      key={action}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={16}
      onPress={() => {
        navigate(action);
      }}
      className="h-12 flex-1 items-center justify-center"
      style={({ pressed }) => tw`${pressed ? 'opacity-60' : ''}`}
      testID={`alibe-navigation-bar-${action}`}
    >
      <Image
        source={icon}
        accessible={false}
        contentFit="contain"
        tintColor={theme.colors.white}
        style={tw`${size}`}
      />
    </Pressable>
  );

  return (
    <View
      className={`w-full max-w-xl self-center px-[1.625rem] ${className}`}
      style={{ paddingBottom: Math.max(insets?.bottom ?? 0, BOTTOM_GAP) }}
      testID="alibe-navigation-bar"
    >
      <View className="pt-6">
        <View className="h-12 flex-row items-center rounded-full bg-ink px-[0.5625rem]">
          {LEFT_ITEMS.map(renderIcon)}
          <View className="w-[3.25rem]" />
          {RIGHT_ITEMS.map(renderIcon)}
        </View>

        <View
          className="absolute inset-x-0 top-0 items-center"
          pointerEvents="box-none"
        >
          <View className="h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full bg-ink">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Criar encontro"
              onPress={() => {
                navigate('create');
              }}
              className="h-[3.125rem] w-[3.125rem] items-center justify-center rounded-full bg-lime"
              style={({ pressed }) => tw`${pressed ? 'opacity-75' : ''}`}
              testID="alibe-navigation-bar-create"
            >
              <View className="h-[1.125rem] w-[1.125rem] items-center justify-center">
                <View className="absolute h-0.5 w-full bg-ink" />
                <View className="absolute h-full w-0.5 bg-ink" />
              </View>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
};
