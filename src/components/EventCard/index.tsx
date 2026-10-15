import { FC } from 'react';
import { EventCardProps } from './EventCard.types';
import { EventCardDetails } from './EventCardDetails';
import { EventCardForm } from './EventCardForm';

export type {
  EventCardCreateProps,
  EventCardDraft,
  EventCardEvent,
  EventCardMode,
  EventCardProps,
  EventCardReadProps,
  EventLocation,
  EventStatus,
} from './EventCard.types';
export { buildTimeslot } from './formatters';

export const EventCard: FC<EventCardProps> = (props) => {
  const testID = props.testID ?? 'alibe-event-card';

  if (props.mode === 'create') {
    return (
      <EventCardForm
        {...props}
        testID={testID}
      />
    );
  }

  return (
    <EventCardDetails
      {...props}
      testID={testID}
    />
  );
};
