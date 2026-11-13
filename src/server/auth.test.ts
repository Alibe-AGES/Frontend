import { API_BASE_URL } from '@/constants';
import { ApiError } from './api';

const mockSignOut = jest.fn();

jest.mock('./auth-client', () => ({
  authClient: {
    get signOut() {
      return mockSignOut;
    },
  },
}));
jest.mock('./authenticated-fetch', () => ({ authenticatedFetch: jest.fn() }));

import { signOut, signUpWithEmail } from './auth';

declare const global: { fetch: jest.Mock };

const originalFetch = global.fetch;

const USER = {
  id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  name: 'Ana Beatriz Silva',
  email: 'ana.silva@example.com',
  emailVerified: false,
  image: null,
  createdAt: '2026-10-01T02:54:52.934Z',
  updatedAt: '2026-10-01T02:54:52.934Z',
};

function mockFetchResolvedWith(body: unknown): void {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(body),
  });
}

function mockFetchRejectedWith(status: number, text: string): void {
  global.fetch = jest.fn().mockResolvedValue({
    ok: false,
    status,
    statusText: 'Error',
    text: () => Promise.resolve(text),
  });
}

afterEach(() => {
  global.fetch = originalFetch;
  jest.restoreAllMocks();
  jest.clearAllMocks();
});

describe('signUpWithEmail', () => {
  const input = { name: USER.name, email: USER.email, password: 'senha-segura' };

  test('sends name, email and password as JSON', async () => {
    mockFetchResolvedWith({ token: null, user: USER });

    const response = await signUpWithEmail(input);

    expect(global.fetch).toHaveBeenCalledWith(API_BASE_URL + '/api/auth/sign-up/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    expect(response).toEqual({ token: null, user: USER });
  });

  test('throws an ApiError when sign up fails', async () => {
    mockFetchRejectedWith(422, 'User already exists');

    await expect(signUpWithEmail(input)).rejects.toBeInstanceOf(ApiError);
  });
});

describe('signOut', () => {
  test('calls authClient.signOut and returns success', async () => {
    mockSignOut.mockResolvedValue({ data: { success: true }, error: null });

    const response = await signOut();

    expect(mockSignOut).toHaveBeenCalledTimes(1);
    expect(response).toEqual({ success: true });
  });

  test('throws an ApiError when authClient.signOut returns an error', async () => {
    mockSignOut.mockResolvedValue({
      data: null,
      error: { message: 'Failed to sign out', status: 500 },
    });

    await expect(signOut()).rejects.toBeInstanceOf(ApiError);
  });
});
