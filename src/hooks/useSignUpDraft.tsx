import { createContext, useContext, useRef, useState, type ReactNode } from 'react';

export interface SignUpDraft {
  email: string;
  password: string;
}

interface SignUpDraftContextValue {
  getDraft: () => SignUpDraft | null;
  setDraft: (draft: SignUpDraft | null) => void;
}

const SignUpDraftContext = createContext<SignUpDraftContextValue | null>(null);

// Ref em vez de state: trocar o rascunho não redesenha as telas durante a navegação.
export function SignUpDraftProvider({ children }: { children: ReactNode }) {
  const draftRef = useRef<SignUpDraft | null>(null);
  const [value] = useState<SignUpDraftContextValue>(() => ({
    getDraft: () => draftRef.current,
    setDraft: (draft) => {
      draftRef.current = draft;
    },
  }));

  return <SignUpDraftContext.Provider value={value}>{children}</SignUpDraftContext.Provider>;
}

export function useSignUpDraft(): SignUpDraftContextValue {
  const context = useContext(SignUpDraftContext);

  if (!context) {
    throw new Error('useSignUpDraft must be used within SignUpDraftProvider');
  }

  return context;
}
