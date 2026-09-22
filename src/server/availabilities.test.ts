import { API_BASE_URL } from '@/constants';
import { createAvailability, getAvailabilitiesByDate } from './availabilities';
import { getGroupCalendar } from './calendar';
import { getGroupMembers } from './groups';

jest.mock('./calendar', () => ({
  getGroupCalendar: jest.fn(),
}));

jest.mock('./groups', () => ({
  getGroupMembers: jest.fn(),
}));

declare const global: { fetch: jest.Mock };

const originalFetch = global.fetch;
const mockedGetGroupCalendar = jest.mocked(getGroupCalendar);
const mockedGetGroupMembers = jest.mocked(getGroupMembers);

describe('createAvailability', () => {
  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  test('posts the availability payload as JSON', async () => {
    const payload = {
      date: '2026-09-22',
      intervals: [{ startTime: '09:00', endTime: '10:00' }],
    };
    const response = [
      {
        id: 'availability-1',
        groupId: 'group-1',
        userId: 'user-1',
        date: payload.date,
        startTime: '09:00',
        endTime: '10:00',
      },
    ];
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(response),
    });

    await expect(createAvailability('group-1', payload)).resolves.toEqual(response);
    expect(global.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/groups/group-1/availabilities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  });

  test('throws an ApiError when saving availability fails', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 422,
      statusText: 'Unprocessable Entity',
      text: () => Promise.resolve('Invalid interval'),
    });

    await expect(
      createAvailability('group-1', { date: '2026-09-22', intervals: [] })
    ).rejects.toMatchObject({
      name: 'ApiError',
      message: 'Invalid interval',
      status: 422,
    });
  });
});

describe('getAvailabilitiesByDate', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('returns available members for the requested date', async () => {
    mockedGetGroupCalendar.mockResolvedValue([
      {
        date: '2026-09-22',
        scheduledEventIds: [],
        proposalIds: [],
        availableUserIds: ['user-2', 'user-1'],
        completedEventIds: [],
        allUsersAvailable: false,
      },
    ]);
    mockedGetGroupMembers.mockResolvedValue([
      { id: 'user-1', name: 'Ana', profilePic: null },
      { id: 'user-3', name: 'Bia', profilePic: '/bia.jpg' },
      { id: 'user-2', name: 'Clara', profilePic: null },
    ]);

    await expect(getAvailabilitiesByDate('group-1', '2026-09-22')).resolves.toEqual([
      { id: 'user-1', name: 'Ana', profilePic: null },
      { id: 'user-2', name: 'Clara', profilePic: null },
    ]);
    expect(mockedGetGroupCalendar).toHaveBeenCalledWith('group-1', 9, 2026);
    expect(mockedGetGroupMembers).toHaveBeenCalledWith('group-1');
  });

  test('returns an empty list for an invalid date without making requests', async () => {
    await expect(getAvailabilitiesByDate('group-1', 'not-a-date')).resolves.toEqual([]);

    expect(mockedGetGroupCalendar).not.toHaveBeenCalled();
    expect(mockedGetGroupMembers).not.toHaveBeenCalled();
  });

  test('returns an empty list when the date is absent or has no available users', async () => {
    mockedGetGroupCalendar.mockResolvedValue([
      {
        date: '2026-09-21',
        scheduledEventIds: [],
        proposalIds: [],
        availableUserIds: ['user-1'],
        completedEventIds: [],
        allUsersAvailable: false,
      },
      {
        date: '2026-09-22',
        scheduledEventIds: [],
        proposalIds: [],
        availableUserIds: [],
        completedEventIds: [],
        allUsersAvailable: false,
      },
    ]);
    mockedGetGroupMembers.mockResolvedValue([]);

    await expect(getAvailabilitiesByDate('group-1', '2026-09-22')).resolves.toEqual([]);
    await expect(getAvailabilitiesByDate('group-1', '2026-09-23')).resolves.toEqual([]);
  });
});
