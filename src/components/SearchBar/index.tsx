import { TextInput, View } from 'react-native';

import SearchIcon from '@/assets/images/search.svg';
import { theme } from '@/theme';
import { SearchBarProps } from './SearchBar.types';

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Pesquisar...',
  testID = 'alibe-search-bar',
}: SearchBarProps) {
  return (
    <View
      className="w-full flex-row items-center gap-3 rounded-full border border-ink bg-canvas px-6 py-3"
      testID={`${testID}-field`}
    >
      <SearchIcon
        width={16}
        height={16}
      />
      <TextInput
        className="flex-1 font-poppins text-base text-ink outline-none"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.ink}
        testID={testID}
      />
    </View>
  );
}
