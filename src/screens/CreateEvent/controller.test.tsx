import type { EventCardDraft } from '@/components/EventCard';
import type { SelectedPhoto } from '@/components/PhotoPicker/PhotoPicker.types';
import { API_BASE_URL } from '@/constants';
import type { CreateEventTab } from '@/screens/CreateEvent';
import { createEvent, createProposal } from '@/server/events';
import { getGroup, getMe } from '@/server/groups';
import { act, render, waitFor } from '@testing-library/react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import CreateEventController from './controller';

interface MockScreenProps {
  groupId?: string;
  openDatePickerOnMount?: boolean;
  activeTab?: CreateEventTab;
  isLocationReadOnly?: boolean;
  onSelectTab?: (tab: CreateEventTab) => void;
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
  createProposal: jest.fn(),
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
const mockCreateProposal = jest.mocked(createProposal);
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
  act(() => {
    mockScreenProps.onChangeDraft(draft);
  });
  await Promise.resolve();
}

async function renderController() {
  const result = render(<CreateEventController />);
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
  return result;
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
      ownerId: null,
      participants: [
        { id: 'user-1', name: 'Luiza', profilePic: null },
        { id: 'user-2', name: 'Kata', profilePic: null },
      ],
    });
    mockGetMe.mockResolvedValue({ id: 'user-1', name: 'Luiza', profilePic: null });
    mockCreateEvent.mockResolvedValue({ id: 'event-1' } as Awaited<ReturnType<typeof createEvent>>);
    mockCreateProposal.mockResolvedValue({
      id: 'proposal-1',
    } as Awaited<ReturnType<typeof createProposal>>);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('loads the group participants and the current user', async () => {
    await renderController();

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

    await renderController();

    expect(mockScreenProps.draft.date).toBe('2026-10-15');
    expect(mockScreenProps.isConfirmDisabled).toBe(true);
  });

  test('stops loading when the participants request fails', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    mockGetGroup.mockRejectedValue(new Error('offline'));

    await renderController();

    await waitFor(() => {
      expect(mockScreenProps.isLoadingParticipants).toBe(false);
    });
    expect(mockScreenProps.participants).toEqual([]);
  });

  test('still lists participants when the current user cannot be loaded', async () => {
    mockGetMe.mockRejectedValue(new Error('offline'));

    await renderController();

    await waitFor(() => {
      expect(mockScreenProps.participants).toHaveLength(2);
    });
    expect(mockScreenProps.currentUserId).toBeUndefined();
  });

  test('keeps confirm disabled until every required field is valid', async () => {
    await renderController();
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
    await renderController();

    act(() => {
      mockScreenProps.onConfirm();
    });
    await Promise.resolve();

    expect(mockCreateEvent).not.toHaveBeenCalled();
  });

  test('creates the event with the API date and navigates to the confirmation', async () => {
    const photo = { uri: 'file:///bloom.jpg', fileName: 'bloom.jpg', mimeType: 'image/jpeg' };
    await Promise.resolve(render(<CreateEventController />));

    act(() => {
      mockScreenProps.onImageSelected(photo);
    });
    await Promise.resolve();
    await fillDraft({ ...COMPLETE_DRAFT, imageUri: photo.uri });
    await act(async () => {
      mockScreenProps.onConfirm();
      await Promise.resolve();
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

  test('creates an event using the location and proposal from a completed match', async () => {
    mockUseLocalSearchParams.mockReturnValue({
      id: 'group-1',
      matchedSuggestionId: 'proposal-1',
      locationId: 'location-1',
      imageUrl: '/api/locations/location-1/image',
      name: 'Bloom Café',
      address: 'Rua Padre Chagas, 320',
    });
    await Promise.resolve(render(<CreateEventController />));

    expect(mockScreenProps.draft).toMatchObject({
      name: 'Bloom Café',
      address: 'Rua Padre Chagas, 320',
      imageUri: `${API_BASE_URL}/api/locations/location-1/image`,
    });
    expect(mockScreenProps.isLocationReadOnly).toBe(true);

    await fillDraft({
      ...mockScreenProps.draft,
      date: '2026-10-15',
      time: '20:00',
    });
    act(() => {
      mockScreenProps.onConfirm();
    });
    await Promise.resolve();

    expect(mockCreateEvent).toHaveBeenCalledWith('group-1', {
      name: 'Bloom Café',
      date: '2026-10-15',
      time: '20:00',
      locationId: 'location-1',
    });
    expect(mockCreateProposal).not.toHaveBeenCalled();
  });

  test('shows an error toast and stays on the screen when creation fails', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    mockCreateEvent.mockRejectedValue(new Error('Bad Request'));
    await Promise.resolve(render(<CreateEventController />));

    await fillDraft(COMPLETE_DRAFT);
    await act(async () => {
      mockScreenProps.onConfirm();
      await Promise.resolve();
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
    await Promise.resolve(render(<CreateEventController />));

    await fillDraft(COMPLETE_DRAFT);
    act(() => {
      mockScreenProps.onConfirm();
    });
    await Promise.resolve();

    expect(mockGetGroup).not.toHaveBeenCalled();
    expect(mockCreateEvent).not.toHaveBeenCalled();
    expect(mockScreenProps.isConfirmDisabled).toBe(true);
  });

  test('switches to the suggestion tab and creates a location suggestion without event fields', async () => {
    await Promise.resolve(render(<CreateEventController />));

    expect(mockScreenProps.activeTab).toBe('event');

    act(() => {
      mockScreenProps.onSelectTab?.('suggestion');
    });
    await Promise.resolve();

    expect(mockScreenProps.activeTab).toBe('suggestion');

    await fillDraft(COMPLETE_DRAFT);
    act(() => {
      mockScreenProps.onConfirm();
    });
    await Promise.resolve();

    expect(mockCreateProposal).toHaveBeenCalledWith('group-1', {
      name: 'Bloom Café',
      address: 'Av. João Wallig, 1800',
    });
    expect(mockCreateEvent).not.toHaveBeenCalled();
    expect(replace).toHaveBeenCalledWith({
      pathname: '/group/[id]/experiences/new',
      params: { id: 'group-1' },
    });
  });

  test('requires manual proposal name and address, then submits only those fields', async () => {
    mockUseLocalSearchParams.mockReturnValue({ id: 'group-1', tab: 'suggestion' });
    await Promise.resolve(render(<CreateEventController />));
    await fillDraft({
      ...mockScreenProps.draft,
      name: '',
      address: 'Rua das Flores, 123',
    });

    expect(mockScreenProps.isConfirmDisabled).toBe(true);
    await fillDraft({
      ...mockScreenProps.draft,
      name: 'Um café tranquilo para conversar',
      address: '',
    });
    expect(mockScreenProps.isConfirmDisabled).toBe(true);
    await fillDraft({
      ...mockScreenProps.draft,
      address: 'Rua das Flores, 123',
    });
    expect(mockScreenProps.isConfirmDisabled).toBe(false);
    act(() => {
      mockScreenProps.onConfirm();
    });
    await Promise.resolve();

    expect(mockCreateProposal).toHaveBeenCalledWith('group-1', {
      name: 'Um café tranquilo para conversar',
      address: 'Rua das Flores, 123',
    });
    expect(replace).toHaveBeenCalledWith({
      pathname: '/group/[id]/experiences/new',
      params: { id: 'group-1' },
    });
  });

  test('sends the picked image with a manual suggestion', async () => {
    const photo: SelectedPhoto = {
      uri: 'file:///picked.jpg',
      fileName: 'picked.jpg',
      mimeType: 'image/jpeg',
    };
    mockUseLocalSearchParams.mockReturnValue({ id: 'group-1', tab: 'suggestion' });
    await renderController();

    act(() => {
      mockScreenProps.onImageSelected(photo);
    });
    await fillDraft(COMPLETE_DRAFT);
    await act(async () => {
      mockScreenProps.onConfirm();
      await Promise.resolve();
    });

    expect(mockCreateProposal).toHaveBeenCalledWith('group-1', {
      name: 'Bloom Café',
      address: 'Av. João Wallig, 1800',
      image: photo,
    });
  });

  test('keeps a matched place on the event tab and ignores the suggestion tab', async () => {
    mockUseLocalSearchParams.mockReturnValue({
      id: 'group-1',
      tab: 'suggestion',
      locationId: 'cc33027e-cfb6-4611-b104-158ba673d98d',
      address: 'Rua Padre Chagas, 320',
      name: 'Bloom Café',
    });
    await renderController();

    expect(mockScreenProps.activeTab).toBe('event');
    expect(mockScreenProps.isLocationReadOnly).toBe(true);

    act(() => {
      mockScreenProps.onSelectTab?.('suggestion');
    });
    await Promise.resolve();

    expect(mockScreenProps.activeTab).toBe('event');
  });

  test.each(['manual'] as const)(
    'switches from a %s suggestion to event mode after route params change',
    async () => {
      mockUseLocalSearchParams.mockReturnValue({
        id: 'group-1',
        tab: 'suggestion',
        name: 'Old suggestion title',
        address: 'Old suggestion address',
      });
      const { rerender } = await renderController();
      expect(mockScreenProps.activeTab).toBe('suggestion');

      mockUseLocalSearchParams.mockReturnValue({
        id: 'group-1',
        locationId: 'matched-location-1',
        imageUrl: '/api/locations/matched-location-1/image',
        name: 'Matched place',
        address: 'Matched address',
      });
      await act(async () => {
        rerender(<CreateEventController />);
        await Promise.resolve();
      });

      expect(mockScreenProps.activeTab).toBe('event');
      expect(mockScreenProps.isLocationReadOnly).toBe(true);
      expect(mockScreenProps.draft).toMatchObject({
        name: 'Matched place',
        address: 'Matched address',
        imageUri: `${API_BASE_URL}/api/locations/matched-location-1/image`,
        date: '',
        time: '',
      });

      await fillDraft({ ...mockScreenProps.draft, date: '2026-10-15', time: '20:00' });
      await act(async () => {
        mockScreenProps.onConfirm();
        await Promise.resolve();
      });

      expect(mockCreateEvent).toHaveBeenCalledWith('group-1', {
        name: 'Matched place',
        date: '2026-10-15',
        time: '20:00',
        locationId: 'matched-location-1',
      });
      expect(mockCreateProposal).not.toHaveBeenCalled();
    }
  );

  test('opens the match screen when the suggestion matches right away', async () => {
    mockCreateProposal.mockResolvedValueOnce({
      id: 'proposal-match',
      matched: true,
      location: {
        id: 'location-1',
        name: 'Bloom Café',
        address: 'Rua Padre Chagas, 320',
        description: null,
        imageUrl: '/api/locations/location-1/image',
      },
    } as Awaited<ReturnType<typeof createProposal>>);
    await Promise.resolve(render(<CreateEventController />));
    act(() => {
      mockScreenProps.onSelectTab?.('suggestion');
    });
    await Promise.resolve();
    await fillDraft(COMPLETE_DRAFT);

    await act(async () => {
      mockScreenProps.onConfirm();
      await Promise.resolve();
    });

    expect(replace).toHaveBeenCalledWith({
      pathname: '/group/[id]/match',
      params: {
        id: 'group-1',
        matchedSuggestionId: 'proposal-match',
        locationId: 'location-1',
        name: 'Bloom Café',
        address: 'Rua Padre Chagas, 320',
        imageUrl: '/api/locations/location-1/image',
      },
    });
    expect(mockCreateEvent).not.toHaveBeenCalled();
  });

  test('shows a suggestion-specific error toast when proposal creation fails', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    mockCreateProposal.mockRejectedValue(new Error('Location not found'));
    await Promise.resolve(render(<CreateEventController />));

    act(() => {
      mockScreenProps.onSelectTab?.('suggestion');
    });
    await Promise.resolve();
    await fillDraft(COMPLETE_DRAFT);
    await act(async () => {
      mockScreenProps.onConfirm();
      await Promise.resolve();
    });

    expect(mockToastShow).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'error',
        text2: 'Não foi possível criar a sugestão. Tente novamente.',
      })
    );
    expect(replace).not.toHaveBeenCalled();
    expect(mockScreenProps.isSubmitting).toBe(false);
  });
});
