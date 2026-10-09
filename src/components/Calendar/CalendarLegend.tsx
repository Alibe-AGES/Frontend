import { Text, View } from 'react-native';

type LegendSymbol = 'event' | 'suggestion' | 'available' | 'allAvailable' | 'realized';

interface LegendItemProps {
  label: string;
  symbol: LegendSymbol;
}

function LegendItem({ label, symbol }: LegendItemProps) {
  const symbolClass = {
    event: 'rounded-sm bg-pink',
    suggestion: 'rounded-full bg-pink',
    available: 'rounded-full bg-coral',
    allAvailable: 'rounded-sm bg-coral',
    realized: 'rounded-sm bg-ink',
  }[symbol];

  return (
    <View className="flex-row items-center gap-2">
      <View className={`h-4 w-4 items-center justify-center ${symbolClass}`}>
        {symbol === 'event' ? <Text className="text-xs text-canvas">☆</Text> : null}
      </View>
      <Text className="text-inkSoft text-sm font-medium">{label}</Text>
    </View>
  );
}

export function CalendarLegend() {
  return (
    <View className="mt-4 gap-1">
      <LegendItem
        label="Encontro marcado"
        symbol="event"
      />
      <LegendItem
        label="Sugestão de encontro"
        symbol="suggestion"
      />
      <LegendItem
        label="Alguém disponível"
        symbol="available"
      />
      <LegendItem
        label="Todos estão disponíveis"
        symbol="allAvailable"
      />
      <LegendItem
        label="Encontros realizados"
        symbol="realized"
      />
    </View>
  );
}
