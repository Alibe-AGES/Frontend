import { API_BASE_URL } from '@/constants';
import { ApiError } from './api';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SignUpWithEmailInput {
  name: string;
  email: string;
  password: string;
}

export interface SignUpWithEmailResponse {
  token: string | null;
  user: AuthUser;
}

export async function signUpWithEmail(
  input: SignUpWithEmailInput
): Promise<SignUpWithEmailResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/sign-up/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new ApiError(
      text || response.statusText || 'Não foi possível criar a conta',
      response.status
    );
  }

  return (await response.json()) as SignUpWithEmailResponse;
}
