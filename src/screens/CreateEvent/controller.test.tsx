import type { EventCardDraft } from '@/components/EventCard';
import type { SelectedPhoto } from '@/components/PhotoPicker/PhotoPicker.types';
import { createEvent } from '@/server/events';
import { getGroup, getMe } from '@/server/groups';
import { act, render, waitFor } from '@testing-library/react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import CreateEventController from './controller';

interface MockScreenProps {
  groupId?: string;
  draft: EventCardDraft;
  onChangeDraft: (draft: EventCardDraft) => void;
  onSelectDate: (dateString: string) => void;
  onImageSelected: (photo: SelectedPhoto) => void;
  participants: unknown[];
  currentUserId?: string;
  isLoadingParticipants: boolean;
  isConfirmDisabled: boolean;
  isSubmitting: boolean;
  onConfirm: () => void;
}

let mockScreenProps: MockScreenProps;

jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
}));

jest.mock('@/server/events', () => ({
  createEvent: jest.fn(),
}));

jest.mock('@/server/groups', () => ({
  getGroup: jest.fn(),
  getMe: jest.fn(),
}));

jest.mock('@/screens/CreateEvent', () => ({
  CreateEventScreen: (props: MockScreenProps) => {
    mockScreenProps = props;
    return null;
  },
}));

const mockUseLocalSearchParams = jest.mocked(useLocalSearchParams);
const mockUseRouter = jest.mocked(useRouter);
const mockCreateEvent = jest.mocked(createEvent);
const mockGetGroup = jest.mocked(getGroup);
const mockGetMe = jest.mocked(getMe);
const mockToastShow = jest.mocked(Toast.show);

const COMPLETE_DRAFT: EventCardDraft = {
  name: ' Bloom Café ',
  imageUri: null,
  address: 'Av. João Wallig, 1800',
  date: '2026-10-15',
  time: '20:00',
};

async function fillDraft(draft: EventCardDraft): Promise<void> {
  await act(() => {
    mockScreenProps.onChangeDraft(draft);
  });
}

describe('CreateEventController', () => {
  const replace = jest.fn();

  beforeEach(() => {
    mockUseLocalSearchParams.mockReturnValue({ id: 'group-1' });
    mockUseRouter.mockReturnValue({ replace } as unknown as ReturnType<typeof useRouter>);
    mockGetGroup.mockResolvedValue({
      id: 'group-1',
      name: 'Hermanas',
      profilePic: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      participants: [
        { id: 'user-1', name: 'Luiza', profilePic: null },
        { id: 'user-2', name: 'Kata', profilePic: null },
      ],
    });
    mockGetMe.mockResolvedValue({ id: 'user-1', name: 'Luiza', profilePic: null });
    mockCreateEvent.mockResolvedValue({ id: 'event-1' } as Awaited<ReturnType<typeof createEvent>>);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('loads the group participants and the current user', async () => {
    await render(<CreateEventController />);

    await waitFor(() => {
      expect(mockScreenProps.participants).toHaveLength(2);
      expect(mockScreenProps.currentUserId).toBe('user-1');
      expect(mockScreenProps.isLoadingParticipants).toBe(false);
    });
    expect(mockGetGroup).toHaveBeenCalledWith('group-1');
    expect(mockScreenProps.groupId).toBe('group-1');
  });

  test('prefills the date passed from the group calendar', async () => {
    mockUseLocalSearchParams.mockReturnValue({ id: 'group-1', date: '2026-10-15' });

    await render(<CreateEventController />);

    expect(mockScreenProps.draft.date).toBe('2026-10-15');
    expect(mockScreenProps.isConfirmDisabled).toBe(true);
  });

  test('stops loading when the participants request fails', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    mockGetGroup.mockRejectedValue(new Error('offline'));

    await render(<CreateEventController />);

    await waitFor(() => {
      expect(mockScreenProps.isLoadingParticipants).toBe(false);
    });
    expect(mockScreenProps.participants).toEqual([]);
  });

  test('still lists participants when the current user cannot be loaded', async () => {
    mockGetMe.mockRejectedValue(new Error('offline'));

    await render(<CreateEventController />);

    await waitFor(() => {
      expect(mockScreenProps.participants).toHaveLength(2);
    });
    expect(mockScreenProps.currentUserId).toBeUndefined();
  });

  test('keeps confirm disabled until every required field is valid', async () => {
    await render(<CreateEventController />);
    expect(mockScreenProps.isConfirmDisabled).toBe(true);

    await fillDraft({ ...COMPLETE_DRAFT, date: '2026-02-31' });
    expect(mockScreenProps.isConfirmDisabled).toBe(true);

    await fillDraft({ ...COMPLETE_DRAFT, time: '25:00' });
    expect(mockScreenProps.isConfirmDisabled).toBe(true);

    await fillDraft({ ...COMPLETE_DRAFT, address: '   ' });
    expect(mockScreenProps.isConfirmDisabled).toBe(true);

    await fillDraft(COMPLETE_DRAFT);
    expect(mockScreenProps.isConfirmDisabled).toBe(false);
  });

  test('does not submit an incomplete draft', async () => {
    await render(<CreateEventController />);

    await act(() => {
      mockScreenProps.onConfirm();
    });

    expect(mockCreateEvent).not.toHaveBeenCalled();
  });

  test('creates the event with the API date and navigates to the confirmation', async () => {
    const photo = { uri: 'file:///bloom.jpg', fileName: 'bloom.jpg', mimeType: 'image/jpeg' };
    await render(<CreateEventController />);

    await act(() => {
      mockScreenProps.onImageSelected(photo);
    });
    await fillDraft({ ...COMPLETE_DRAFT, imageUri: photo.uri });
    await act(() => {
      mockScreenProps.onConfirm();
    });

    expect(mockCreateEvent).toHaveBeenCalledWith('group-1', {
      name: ' Bloom Café ',
      date: '2026-10-15',
      time: '20:00',
      location: 'Av. João Wallig, 1800',
      image: photo,
    });
    expect(replace).toHaveBeenCalledWith({
      pathname: '/group/[id]/event-created',
      params: { id: 'group-1', eventId: 'event-1' },
    });
    expect(mockScreenProps.isSubmitting).toBe(false);
  });

  test('shows an error toast and stays on the screen when creation fails', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    mockCreateEvent.mockRejectedValue(new Error('Bad Request'));
    await render(<CreateEventController />);

    await fillDraft(COMPLETE_DRAFT);
    await act(() => {
      mockScreenProps.onConfirm();
    });

    expect(mockToastShow).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'error',
        text2: 'Não foi possível criar o evento. Tente novamente.',
      })
    );
    expect(replace).not.toHaveBeenCalled();
    expect(mockScreenProps.isSubmitting).toBe(false);
  });

  test('does not load or submit without a group id', async () => {
    mockUseLocalSearchParams.mockReturnValue({});
    await render(<CreateEventController />);

    await fillDraft(COMPLETE_DRAFT);
    await act(() => {
      mockScreenProps.onConfirm();
    });

    expect(mockGetGroup).not.toHaveBeenCalled();
    expect(mockCreateEvent).not.toHaveBeenCalled();
    expect(mockScreenProps.isConfirmDisabled).toBe(true);
  });
});
