import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AvailabilityCardStrategy,
  AvailabilityInterval,
  UseAvailabilityControllerParams,
} from '../Availiability.types';

const END_BEFORE_START_ERROR = 'O horário de fim deve ser depois do início.';

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

export const useDefaultAvailabilityController = ({
  onIntervalsChange,
}: UseAvailabilityControllerParams = {}): AvailabilityCardStrategy => {
  const nextId = useRef(0);
  const [intervals, setIntervals] = useState<AvailabilityInterval[]>(() => [
    createInterval('interval-0'),
  ]);

  useEffect(() => {
    onIntervalsChange?.(intervals);
  }, [intervals, onIntervalsChange]);

  const validate = useCallback((startTime: string, endTime: string): string | null => {
    const start = toMinutes(startTime);
    const end = toMinutes(endTime);

    if (start === null || end === null) {
      return null;
    }

    return end < start ? END_BEFORE_START_ERROR : null;
  }, []);

  const addInterval = useCallback(() => {
    nextId.current += 1;
    setIntervals((current) => [
      ...current,
      createInterval(`interval-${nextId.current.toString()}`),
    ]);
  }, []);

  const removeInterval = useCallback((id: string) => {
    setIntervals((current) =>
      current.length > 1 ? current.filter((interval) => interval.id !== id) : current
    );
  }, []);

  const updateStartTime = useCallback(
    (id: string, value: string) => {
      setIntervals((current) =>
        current.map((interval) =>
          interval.id === id
            ? { ...interval, startTime: value, error: validate(value, interval.endTime) }
            : interval
        )
      );
    },
    [validate]
  );

  const updateEndTime = useCallback(
    (id: string, value: string) => {
      setIntervals((current) =>
        current.map((interval) =>
          interval.id === id
            ? { ...interval, endTime: value, error: validate(interval.startTime, value) }
            : interval
        )
      );
    },
    [validate]
  );

  return { intervals, addInterval, removeInterval, updateStartTime, updateEndTime };
};
