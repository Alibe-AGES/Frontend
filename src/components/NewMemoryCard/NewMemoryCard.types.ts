import type { DropdownOption } from '@/components/Dropdown';
import type { SelectedPhoto, UsePhotoPickerHook } from '@/components/PhotoPicker/PhotoPicker.types';

export interface NewMemoryCardProps {
  events: DropdownOption[];
  selectedEventId: string | null;
  onSelectEvent: (eventId: string) => void;
  onPhotoSelected?: (photo: SelectedPhoto) => void;
  // The close button only shows up when this is provided.
  onClose?: () => void;
  // Swaps how the photo is picked; defaults to the device gallery.
  usePhotoController?: UsePhotoPickerHook;
  testID?: string;
}
