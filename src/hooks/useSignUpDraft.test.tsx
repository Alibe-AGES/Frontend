import { renderHook } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { SignUpDraftProvider, useSignUpDraft } from './useSignUpDraft';

function wrapper({ children }: { children: ReactNode }) {
  return <SignUpDraftProvider>{children}</SignUpDraftProvider>;
}

describe('useSignUpDraft', () => {
  test('starts without account data', async () => {
    const { result } = await renderHook(() => useSignUpDraft(), { wrapper });

    expect(result.current.getDraft()).toBeNull();
  });

  test('keeps and clears the account data', async () => {
    const { result } = await renderHook(() => useSignUpDraft(), { wrapper });

    result.current.setDraft({ email: 'rica@alibe.com', password: 'segredo123' });

    expect(result.current.getDraft()).toEqual({
      email: 'rica@alibe.com',
      password: 'segredo123',
    });

    result.current.setDraft(null);

    expect(result.current.getDraft()).toBeNull();
  });

  test('throws when used outside the provider', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);

    await expect(renderHook(() => useSignUpDraft())).rejects.toThrow(
      'useSignUpDraft must be used within SignUpDraftProvider'
    );
  });
});
