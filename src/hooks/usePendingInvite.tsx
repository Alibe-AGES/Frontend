import { createContext, useContext, useRef, useState, type ReactNode } from 'react';

interface PendingInviteContextValue {
  getPendingInvite: () => string | null;
  setPendingInvite: (token: string | null) => void;
}

const PendingInviteContext = createContext<PendingInviteContextValue | null>(null);

// Guarda o convite aberto sem sessão até o login ou cadastro terminar.
export function PendingInviteProvider({ children }: { children: ReactNode }) {
  const tokenRef = useRef<string | null>(null);
  const [value] = useState<PendingInviteContextValue>(() => ({
    getPendingInvite: () => tokenRef.current,
    setPendingInvite: (token) => {
      tokenRef.current = token;
    },
  }));

  return <PendingInviteContext.Provider value={value}>{children}</PendingInviteContext.Provider>;
}

export function usePendingInvite(): PendingInviteContextValue {
  const context = useContext(PendingInviteContext);

  if (!context) {
    throw new Error('usePendingInvite must be used within PendingInviteProvider');
  }

  return context;
}
