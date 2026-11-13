import { API_BASE_URL } from '@/constants';
import { createAvailability, getAvailabilitiesByDate } from './availabilities';

jest.mock('./auth', () => ({
  authenticatedFetch: jest.fn((url: string, options?: RequestInit) =>
    globalThis.fetch(url, { ...options, credentials: 'include' })
  ),
}));

declare const global: { fetch: jest.Mock };

const originalFetch = global.fetch;

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

describe('getAvailabilitiesByDate', () => {
  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  test('requests the day availabilities and resolves relative user images', async () => {
    const fetchMock = jest
      .fn<Promise<Response>, [RequestInfo | URL, RequestInit?]>()
      .mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            date: '2026-09-05',
            users: [
              {
                id: 'user-1',
                name: 'Ana Beatriz Silva',
                image: '/users/user-1/profile-picture',
                isCurrentUser: true,
                availableAllDay: false,
                intervals: [['14:00', '20:00']],
              },
              {
                id: 'user-2',
                name: 'Bia',
                image: null,
                isCurrentUser: false,
                availableAllDay: true,
                intervals: [],
              },
            ],
          }),
      } as Response);
    global.fetch = fetchMock;

    await expect(getAvailabilitiesByDate('group-1', '2026-09-05')).resolves.toEqual({
      date: '2026-09-05',
      users: [
        {
          id: 'user-1',
          name: 'Ana Beatriz Silva',
          image: `${API_BASE_URL}/users/user-1/profile-picture`,
          isCurrentUser: true,
          availableAllDay: false,
          intervals: [['14:00', '20:00']],
        },
        {
          id: 'user-2',
          name: 'Bia',
          image: null,
          isCurrentUser: false,
          availableAllDay: true,
          intervals: [],
        },
      ],
    });
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      `${API_BASE_URL}/groups/group-1/availabilities?date=2026-09-05`
    );
  });

  test('throws an ApiError when loading availabilities fails', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
      text: () => Promise.resolve(''),
    });

    await expect(getAvailabilitiesByDate('group-1', '2026-09-05')).rejects.toMatchObject({
      name: 'ApiError',
      message: 'Forbidden',
      status: 403,
    });
  });
});
