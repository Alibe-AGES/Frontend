import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AvailabilityCardStrategy,
  AvailabilityInterval,
  RegisteredInterval,
  UseAvailabilityControllerParams,
} from '../Availability.types';

const END_BEFORE_START_ERROR = 'O horário de fim deve ser depois do início.';
const OVERLAPS_REGISTERED_ERROR = 'Este horário coincide com um já registrado.';
const OVERLAPS_INTERVAL_ERROR = 'Este horário coincide com outro intervalo.';

const NO_REGISTERED_INTERVALS: readonly RegisteredInterval[] = [];

const toMinutes = (time: string): number | null => {
  const match = /^(\d{2}):(\d{2})$/.exec(time);

  if (!match) {
    return null;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  return hours * 60 + minutes;
};

const createInterval = (id: string): AvailabilityInterval => ({
  id,
  startTime: '',
  endTime: '',
  error: null,
});

interface MinuteRange {
  readonly start: number;
  readonly end: number;
}

const toRange = (startTime: string, endTime: string): MinuteRange | null => {
  const start = toMinutes(startTime);
  const end = toMinutes(endTime);

  return start === null || end === null ? null : { start, end };
};

// Ranges that only touch (14:00–20:00 and 20:00–22:00) do not overlap.
const overlaps = (first: MinuteRange, second: MinuteRange) =>
  first.start < second.end && second.start < first.end;

// Each interval is a separate slot of the day, so it must not share any time with a saved
// interval or with an interval listed before it; the later one carries the error.
const validateAll = (
  drafts: AvailabilityInterval[],
  registeredIntervals: readonly RegisteredInterval[]
): AvailabilityInterval[] => {
  const registered = registeredIntervals
    .map(([start, end]) => toRange(start, end))
    .filter((range): range is MinuteRange => range !== null);
  const previous: MinuteRange[] = [];

  return drafts.map((interval) => {
    const range = toRange(interval.startTime, interval.endTime);
    let error: string | null = null;

    if (range && range.end <= range.start) {
      error = END_BEFORE_START_ERROR;
    } else if (range && registered.some((saved) => overlaps(range, saved))) {
      error = OVERLAPS_REGISTERED_ERROR;
    } else if (range && previous.some((earlier) => overlaps(range, earlier))) {
      error = OVERLAPS_INTERVAL_ERROR;
    }

    if (range && range.end > range.start) {
      previous.push(range);
    }

    return { ...interval, error };
  });
};

export const useDefaultAvailabilityController = ({
  onIntervalsChange,
  registeredIntervals = NO_REGISTERED_INTERVALS,
}: UseAvailabilityControllerParams = {}): AvailabilityCardStrategy => {
  const nextId = useRef(0);
  const [drafts, setDrafts] = useState<AvailabilityInterval[]>(() => [
    createInterval('interval-0'),
  ]);

  // Callers often pass a fresh array on every render, so the memo follows its contents instead.
  const registeredKey = JSON.stringify(registeredIntervals);

  // Errors are derived on every change, so they also update when the registered intervals arrive.
  const intervals = useMemo(() => {
    const registered = JSON.parse(registeredKey) as RegisteredInterval[];

    return validateAll(drafts, registered);
  }, [drafts, registeredKey]);

  useEffect(() => {
    onIntervalsChange?.(intervals);
  }, [intervals, onIntervalsChange]);

  const addInterval = useCallback(() => {
    nextId.current += 1;
    setDrafts((current) => [...current, createInterval(`interval-${nextId.current.toString()}`)]);
  }, []);

  const removeInterval = useCallback((id: string) => {
    setDrafts((current) =>
      current.length > 1 ? current.filter((interval) => interval.id !== id) : current
    );
  }, []);

  const updateStartTime = useCallback((id: string, value: string) => {
    setDrafts((current) =>
      current.map((interval) => (interval.id === id ? { ...interval, startTime: value } : interval))
    );
  }, []);

  const updateEndTime = useCallback((id: string, value: string) => {
    setDrafts((current) =>
      current.map((interval) => (interval.id === id ? { ...interval, endTime: value } : interval))
    );
  }, []);

  return { intervals, addInterval, removeInterval, updateStartTime, updateEndTime };
};
