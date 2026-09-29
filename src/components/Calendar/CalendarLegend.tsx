import { Text, View } from 'react-native';

import { LegendVariant } from '@/components/Calendar/Calendar.types';

interface LegendItemProps {
  label: string;
  variant: LegendVariant;
}

const legendClasses: Record<LegendVariant, string> = {
  pink: 'bg-pink',
  lime: 'bg-lime',
  coral: 'bg-coral',
  ink: 'bg-ink',
};

function LegendItem({ label, variant }: LegendItemProps) {
  return (
    <View className="flex-row items-center gap-2">
      <View className={`h-5 w-5 rounded-full ${legendClasses[variant]}`} />
      <Text className="text-inkSoft text-sm font-medium">{label}</Text>
    </View>
  );
}

export function CalendarLegend() {
  return (
    <View className="mt-4 gap-2">
      <LegendItem
        label="Sugestão de encontro"
        variant="pink"
      />
      <LegendItem
        label="Alguém disponível"
        variant="lime"
      />
      <LegendItem
        label="Todos estão disponíveis"
        variant="coral"
      />
      <LegendItem
        label="Encontros realizados"
        variant="ink"
      />

      <View className="flex-row items-center gap-2">
        <View className="h-5 w-5 items-center justify-center rounded bg-pink">
          <Text className="text-sm text-canvas">☆</Text>
        </View>
        <Text className="text-inkSoft text-sm font-medium">Encontro marcado</Text>
      </View>
    </View>
  );
}
