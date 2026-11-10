import { Ionicons } from '@expo/vector-icons';
import { Pressable, TextInput, View } from 'react-native';

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
      className="w-full flex-row items-center gap-3 rounded-full border border-ink bg-canvas px-6"
      testID={`${testID}-field`}
    >
      <SearchIcon
        width={16}
        height={16}
      />
      <TextInput
        className="flex-1 font-poppins text-base text-ink"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.ink}
        testID={testID}
        style={{ includeFontPadding: false, textAlignVertical: 'center' }}
      />
      {value.length > 0 ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Limpar pesquisa"
          hitSlop={12}
          onPress={() => {
            onChangeText('');
          }}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          testID={`${testID}-clear`}
        >
          <Ionicons
            name="close"
            size={18}
            color={theme.colors.ink}
          />
        </Pressable>
      ) : null}
    </View>
  );
}
