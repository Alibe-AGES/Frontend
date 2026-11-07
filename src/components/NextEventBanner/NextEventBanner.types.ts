export interface NextEventBannerEvent {
  name: string;
  timeslot: string;
}

export interface NextEventBannerProps {
  event: NextEventBannerEvent | null;
  testID?: string;
}
