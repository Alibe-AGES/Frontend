import { API_BASE_URL } from '@/constants';
import { createAvailability, getAvailabilityStatusesByDate } from './availabilities';
import { getGroupCalendar } from './calendar';
import { getGroupMembers } from './groups';

jest.mock('./auth', () => ({
  authenticatedFetch: jest.fn((url: string, options?: RequestInit) =>
    globalThis.fetch(url, { ...options, credentials: 'include' })
  ),
}));

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
    const fetchMock = jest
      .fn<Promise<Response>, [RequestInfo | URL, RequestInit?]>()
      .mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(response),
      } as Response);
    global.fetch = fetchMock;

    await expect(createAvailability('group-1', payload)).resolves.toEqual(response);

    const [requestUrl, requestOptions] = fetchMock.mock.calls[0] ?? [];
    expect(requestUrl).toBe(API_BASE_URL + '/groups/group-1/availabilities');
    expect(requestOptions).toMatchObject({
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    expect(requestOptions).toBeDefined();

    if (!requestOptions) {
      throw new Error('Request options were not provided');
    }
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

describe('getAvailabilityStatusesByDate', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('returns all group members with their availability status for the requested date', async () => {
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

    await expect(getAvailabilityStatusesByDate('group-1', '2026-09-22')).resolves.toEqual([
      { id: 'user-1', name: 'Ana', profilePic: null, hasAvailability: true },
      { id: 'user-3', name: 'Bia', profilePic: '/bia.jpg', hasAvailability: false },
      { id: 'user-2', name: 'Clara', profilePic: null, hasAvailability: true },
    ]);
    expect(mockedGetGroupCalendar).toHaveBeenCalledWith('group-1', 9, 2026);
    expect(mockedGetGroupMembers).toHaveBeenCalledWith('group-1');
  });

  test('returns an empty list for an invalid date without making requests', async () => {
    await expect(getAvailabilityStatusesByDate('group-1', 'not-a-date')).resolves.toEqual([]);

    expect(mockedGetGroupCalendar).not.toHaveBeenCalled();
    expect(mockedGetGroupMembers).not.toHaveBeenCalled();
  });

  test('marks all members as not responding when the date is absent or nobody has availability', async () => {
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
    mockedGetGroupMembers.mockResolvedValue([
      { id: 'user-1', name: 'Ana', profilePic: null },
      { id: 'user-2', name: 'Bia', profilePic: null },
    ]);

    await expect(getAvailabilityStatusesByDate('group-1', '2026-09-22')).resolves.toEqual([
      { id: 'user-1', name: 'Ana', profilePic: null, hasAvailability: false },
      { id: 'user-2', name: 'Bia', profilePic: null, hasAvailability: false },
    ]);
    await expect(getAvailabilityStatusesByDate('group-1', '2026-09-23')).resolves.toEqual([
      { id: 'user-1', name: 'Ana', profilePic: null, hasAvailability: false },
      { id: 'user-2', name: 'Bia', profilePic: null, hasAvailability: false },
    ]);
  });
});
