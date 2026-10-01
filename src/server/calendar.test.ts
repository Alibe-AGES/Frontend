import { API_BASE_URL } from '@/constants';
import { getGroupCalendar } from './calendar';

declare const global: { fetch: jest.Mock };

const originalFetch = global.fetch;

describe('getGroupCalendar', () => {
  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  test('fetches a group calendar for the requested month and year', async () => {
    const calendar = [
      {
        date: '2026-09-22',
        scheduledEventIds: [],
        proposalIds: [],
        availableUserIds: ['user-1'],
        completedEventIds: [],
        allUsersAvailable: false,
      },
    ];
    const fetchMock = jest
      .fn<Promise<Response>, [RequestInfo | URL, RequestInit?]>()
      .mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(calendar),
      } as Response);
    global.fetch = fetchMock;

    await expect(getGroupCalendar('group-1', 9, 2026)).resolves.toEqual(calendar);

    const [requestUrl, requestOptions] = fetchMock.mock.calls[0] ?? [];
    expect(requestUrl).toBe(API_BASE_URL + '/groups/group-1/calendar?month=9&year=2026');
    expect(requestOptions).toMatchObject({ credentials: 'omit' });
    expect(requestOptions?.headers).toBeInstanceOf(Headers);
  });

  test('throws an ApiError using the response text', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 503,
      statusText: 'Service Unavailable',
      text: () => Promise.resolve('Calendar unavailable'),
    });

    await expect(getGroupCalendar('group-1', 9, 2026)).rejects.toMatchObject({
      name: 'ApiError',
      message: 'Calendar unavailable',
      status: 503,
    });
  });

  test('falls back to the status text when the error body is empty', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      text: () => Promise.resolve(''),
    });

    await expect(getGroupCalendar('group-1', 9, 2026)).rejects.toMatchObject({
      message: 'Internal Server Error',
      status: 500,
    });
  });
});
