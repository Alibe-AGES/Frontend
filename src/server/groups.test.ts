import { ApiError } from './api';
import { listGroups } from './groups';

declare const global: { fetch: jest.Mock };

const originalFetch = global.fetch;

const BASE_GROUP = { id: '1', name: 'Hermanas', createdAt: '2026-01-01T00:00:00.000Z' };

function mockFetchResolvedWith(groups: unknown[]): void {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(groups),
  });
}

describe('listGroups', () => {
  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  test('fetches the groups from the backend', async () => {
    mockFetchResolvedWith([]);

    await listGroups();

    expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/groups');
  });

  test('resolves a relative profilePic into a full URL', async () => {
    mockFetchResolvedWith([{ ...BASE_GROUP, profilePic: '/groups/1/profile-picture' }]);

    const groups = await listGroups();

    expect(groups[0].profilePic).toBe('http://localhost:3000/groups/1/profile-picture');
  });

  test('keeps an absolute profilePic untouched', async () => {
    mockFetchResolvedWith([{ ...BASE_GROUP, profilePic: 'https://cdn.alibe.com/hermanas.jpg' }]);

    const groups = await listGroups();

    expect(groups[0].profilePic).toBe('https://cdn.alibe.com/hermanas.jpg');
  });

  test('keeps a null profilePic as null', async () => {
    mockFetchResolvedWith([{ ...BASE_GROUP, profilePic: null }]);

    const groups = await listGroups();

    expect(groups[0].profilePic).toBeNull();
  });

  test('throws an ApiError when the response is not ok', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      text: () => Promise.resolve(''),
    });

    await expect(listGroups()).rejects.toBeInstanceOf(ApiError);
  });
});
