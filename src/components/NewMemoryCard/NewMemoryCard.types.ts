import type { DropdownOption } from '@/components/Dropdown';
import type { SelectedPhoto, UsePhotoPickerHook } from '@/components/PhotoPicker/PhotoPicker.types';

export interface NewMemoryCardProps {
  events: DropdownOption[];
  selectedEventId: string | null;
  // Blocks the dropdown while the event list is still on its way.
  isLoadingEvents?: boolean;
  onSelectEvent: (eventId: string) => void;
  // Shown in the open dropdown when there are no events; keep it to one short line.
  emptyEventsMessage?: string;
  // Explains which events the list holds; an info button next to the dropdown shows it.
  eventsHint?: string;
  onPhotoSelected?: (photo: SelectedPhoto) => void;
  // The close button only shows up when this is provided.
  onClose?: () => void;
  // Swaps how the photo is picked; defaults to the device gallery.
  usePhotoController?: UsePhotoPickerHook;
  testID?: string;
}
