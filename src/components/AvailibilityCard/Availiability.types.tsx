import { UseBackStrategyHook } from '@/components/BackButton/BackButton.types';
import { Href } from 'expo-router';

export interface AvailabilityInterval {
  id: string;
  startTime: string;
  endTime: string;
  error?: string | null;
}

export interface AvailabilityCardStrategy {
  intervals: AvailabilityInterval[];
  addInterval: () => void;
  removeInterval: (id: string) => void;
  updateStartTime: (id: string, value: string) => void;
  updateEndTime: (id: string, value: string) => void;
}

export interface UseAvailabilityControllerParams {
  onIntervalsChange?: (intervals: AvailabilityInterval[]) => void;
}

export type UseAvailabilityControllerHook = (
  params?: UseAvailabilityControllerParams
) => AvailabilityCardStrategy;

export interface AvailabilityCardProps {
  title?: string;
  label?: string;
  useController?: UseAvailabilityControllerHook;
  useCloseController?: UseBackStrategyHook;
  fallbackHref?: Href;
  onIntervalsChange?: (intervals: AvailabilityInterval[]) => void;
  className?: string;
  testID?: string;
}
