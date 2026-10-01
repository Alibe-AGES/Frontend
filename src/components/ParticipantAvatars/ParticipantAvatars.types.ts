export interface Participant {
  id: string;
  name: string;
  profilePic: string | null;
}

export interface ParticipantAvatarsProps {
  participants: Participant[];
  // The current user is labelled "Eu" and listed first.
  currentUserId?: string;
  emptyMessage?: string;
  testID?: string;
}
