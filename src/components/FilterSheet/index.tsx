import { Button } from '@/components/Button';
import { ModalFrame } from '@/components/ModalFrame';
import { TextInput } from '@/components/TextInput';
import { theme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { FilterGroup, FilterSheetProps, FilterSheetValue } from './FilterSheet.types';

export type {
  FilterGroup,
  FilterOption,
  FilterSheetProps,
  FilterSheetValue,
} from './FilterSheet.types';

export const EMPTY_FILTER_VALUE: FilterSheetValue = {
  minBudget: '',
  maxBudget: '',
  selections: {},
};

export function FilterSheet({
  visible,
  value,
  groups,
  budgetTitle,
  onConfirm,
  onClose,
  testID = 'filter-sheet',
}: FilterSheetProps) {
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState(value);

  // Closing without confirming discards the draft: it restarts from the applied value on open.
  useEffect(() => {
    if (visible) {
      setDraft(value);
    }
  }, [visible, value]);

  const toggleOption = (group: FilterGroup, optionValue: string) => {
    setDraft((current) => {
      const selected = current.selections[group.key] ?? [];
      let next: string[];

      if (selected.includes(optionValue)) {
        next = selected.filter((item) => item !== optionValue);
      } else if (group.multiple) {
        next = [...selected, optionValue];
      } else {
        next = [optionValue];
      }

      return { ...current, selections: { ...current.selections, [group.key]: next } };
    });
  };

  return (
    <ModalFrame
      visible={visible}
      onRequestClose={onClose}
      placement="bottom"
      closeOnBackdropPress
      backdropLabel="Fechar filtros"
      testID={testID}
    >
      <View
        className="max-h-[90%] rounded-t-3xl bg-ink px-6 pt-3"
        style={{ paddingBottom: Math.max(insets.bottom, 24) }}
      >
        <View className="mb-3 h-1 w-16 self-center rounded-full bg-canvas/60" />
        <View className="mb-4 flex-row items-center justify-between">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Limpar filtros"
            hitSlop={12}
            onPress={() => {
              setDraft(EMPTY_FILTER_VALUE);
            }}
            testID={`${testID}-reset`}
          >
            <Text className="font-poppins-medium text-sm text-lime underline">Limpar</Text>
          </Pressable>
          <Text className="font-poppins-medium text-xl text-white">Filtros</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fechar filtros"
            hitSlop={12}
            onPress={onClose}
            testID={`${testID}-close`}
          >
            <Ionicons
              name="close"
              size={24}
              color={theme.colors.white}
            />
          </Pressable>
        </View>

        <ScrollView
          contentContainerClassName="gap-5 pb-4"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {budgetTitle ? (
            <View className="gap-2">
              <Text className="font-poppins-semibold text-sm text-white">{budgetTitle}</Text>
              <View className="flex-row items-center gap-3">
                <View className="flex-1">
                  <TextInput
                    type="numeric"
                    value={draft.minBudget}
                    onChangeText={(minBudget) => {
                      setDraft((current) => ({ ...current, minBudget }));
                    }}
                    placeholder="R$ 0"
                    testID={`${testID}-min-budget`}
                  />
                </View>
                <Text className="font-poppins text-sm text-white">até</Text>
                <View className="flex-1">
                  <TextInput
                    type="numeric"
                    value={draft.maxBudget}
                    onChangeText={(maxBudget) => {
                      setDraft((current) => ({ ...current, maxBudget }));
                    }}
                    placeholder="R$ 0"
                    testID={`${testID}-max-budget`}
                  />
                </View>
              </View>
            </View>
          ) : null}

          {groups.map((group) => (
            <View
              key={group.key}
              className="gap-2"
            >
              <Text className="font-poppins-semibold text-sm text-white">{group.title}</Text>
              {group.options.map((option) => {
                const isSelected = (draft.selections[group.key] ?? []).includes(option.value);

                return (
                  <Pressable
                    key={option.value}
                    accessibilityRole={group.multiple ? 'checkbox' : 'radio'}
                    accessibilityState={{ checked: isSelected }}
                    accessibilityLabel={option.label}
                    className="flex-row items-center gap-3 rounded-full bg-surface px-1.5 py-1.5 active:opacity-75"
                    onPress={() => {
                      toggleOption(group, option.value);
                    }}
                    testID={`${testID}-${group.key}-${option.value}`}
                  >
                    <View
                      className={`h-6 w-6 rounded-full border-2 border-ink ${
                        isSelected ? 'bg-ink' : 'bg-surface'
                      }`}
                    />
                    <Text className="flex-1 font-poppins text-sm text-wine">{option.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </ScrollView>

        <Button
          title="Confirmar"
          variant="secondary"
          onPress={() => {
            onConfirm(draft);
          }}
          testID={`${testID}-confirm`}
        />
      </View>
    </ModalFrame>
  );
}
