import { authClient } from '@/server/auth-client';
import { authenticatedFetch } from './authenticated-fetch';

declare const global: { fetch: jest.Mock };

const originalFetch = global.fetch;
const mockGetCookie = authClient.getCookie as jest.Mock;

afterEach(() => {
  global.fetch = originalFetch;
  jest.clearAllMocks();
});

test('adds the persisted Better Auth cookie to native API requests', async () => {
  mockGetCookie.mockResolvedValue('better-auth.session_token=session-token');
  const fetchMock = jest
    .fn<Promise<Response>, [RequestInfo | URL, RequestInit?]>()
    .mockResolvedValue({ ok: true } as Response);
  global.fetch = fetchMock;

  await authenticatedFetch('http://localhost:3000/groups');

  const requestInit = fetchMock.mock.calls[0]?.[1];
  expect(requestInit).toBeDefined();
  if (!requestInit) {
    throw new Error('Request init was not provided');
  }
  const headers = requestInit.headers as Headers;

  expect(headers.get('Cookie')).toBe('better-auth.session_token=session-token');
  expect(requestInit.credentials).toBe('omit');
});

test('preserves request headers while adding authentication', async () => {
  mockGetCookie.mockResolvedValue('better-auth.session_token=session-token');
  const fetchMock = jest
    .fn<Promise<Response>, [RequestInfo | URL, RequestInit?]>()
    .mockResolvedValue({ ok: true } as Response);
  global.fetch = fetchMock;

  await authenticatedFetch('http://localhost:3000/groups', {
    headers: { 'Content-Type': 'application/json' },
  });

  const requestInit = fetchMock.mock.calls[0]?.[1];
  expect(requestInit).toBeDefined();
  if (!requestInit) {
    throw new Error('Request init was not provided');
  }

  const headers = requestInit.headers as Headers;
  expect(headers.get('Content-Type')).toBe('application/json');
  expect(headers.get('Cookie')).toBe('better-auth.session_token=session-token');
});
