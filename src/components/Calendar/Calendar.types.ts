export type DayStatus = 'available' | 'realized' | 'suggested' | 'allAvailable' | 'normal';

export type DayDot = 'pink' | 'coral';

export type LegendVariant = 'pink' | 'lime' | 'coral' | 'ink';

export interface CalendarDay {
  dateString: string;
  day: number;
  month: number;
  year: number;
  timestamp: number;
}

export interface DayMark {
  status: DayStatus;
  dot?: DayDot;
}

export interface CalendarProps {
  initialDate?: string;
  dayMarks?: Record<string, DayMark>;
  onDayPress?: (dateString: string) => void;
  onMonthChange?: (dateString: string) => void;
  showLegend?: boolean;
  testID?: string;
}
