export interface AvailabilityInterval {
  id: string;
  startTime: string;
  endTime: string;
  error?: string | null;
}

/** An `HH:MM` start and end pair the user already saved for the day. */
export type RegisteredInterval = readonly [string, string];

export interface AvailabilityCardStrategy {
  intervals: AvailabilityInterval[];
  addInterval: () => void;
  removeInterval: (id: string) => void;
  updateStartTime: (id: string, value: string) => void;
  updateEndTime: (id: string, value: string) => void;
}

export interface UseAvailabilityControllerParams {
  onIntervalsChange?: (intervals: AvailabilityInterval[]) => void;
  /** Intervals inside these ranges are flagged with an error, since they are already saved. */
  registeredIntervals?: readonly RegisteredInterval[];
}

export type UseAvailabilityControllerHook = (
  params?: UseAvailabilityControllerParams
) => AvailabilityCardStrategy;

export interface AvailabilityCardProps {
  title?: string;
  label?: string;
  useController?: UseAvailabilityControllerHook;
  onIntervalsChange?: (intervals: AvailabilityInterval[]) => void;
  registeredIntervals?: readonly RegisteredInterval[];
  /** Shows the "all day" checkbox; while checked, the interval fields are hidden. */
  allDay?: boolean;
  onAllDayChange?: (allDay: boolean) => void;
  allDayDisabled?: boolean;
  className?: string;
  testID?: string;
}
