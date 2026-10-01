import { API_BASE_URL } from '@/constants';
import { ApiError } from './api';
import { signUpWithEmail } from './auth';

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
