import { renderHook } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { PendingInviteProvider, usePendingInvite } from './usePendingInvite';

function wrapper({ children }: { children: ReactNode }) {
  return <PendingInviteProvider>{children}</PendingInviteProvider>;
}

describe('usePendingInvite', () => {
  test('starts without a pending invite', async () => {
    const { result } = await renderHook(() => usePendingInvite(), { wrapper });

    expect(result.current.getPendingInvite()).toBeNull();
  });

  test('keeps and clears the pending invite', async () => {
    const { result } = await renderHook(() => usePendingInvite(), { wrapper });

    result.current.setPendingInvite('invite-token');

    expect(result.current.getPendingInvite()).toBe('invite-token');

    result.current.setPendingInvite(null);

    expect(result.current.getPendingInvite()).toBeNull();
  });

  test('throws when used outside the provider', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);

    await expect(renderHook(() => usePendingInvite())).rejects.toThrow(
      'usePendingInvite must be used within PendingInviteProvider'
    );
  });
});
