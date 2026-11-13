export interface UserProfile {
  id: string;
  name: string;
  photoUri: string | null;
  created_at: string;
  completedEventsCount: number;
  pendingEventsCount: number;
}

export interface UpdateUserProfilePayload {
  name?: string;
  photo?: { uri: string; fileName?: string | null; mimeType?: string | null } | null;
}

const MOCK_DELAY_MS = 800;

const mockDatabase: Record<string, UserProfile> = {
  '11111111-1111-4111-8111-111111111111': {
    id: '11111111-1111-4111-8111-111111111111',
    name: 'Ana Beatriz Silva',
    photoUri: null,
    created_at: new Date('2026-09-14').toLocaleDateString('pt-Br', {
      month: 'long',
      year: 'numeric',
    }),
    completedEventsCount: 12,
    pendingEventsCount: 2,
  },
  '33333333-3333-4333-8333-333333333333': {
    id: '33333333-3333-4333-8333-333333333333',
    name: 'Camila Oliveira',
    photoUri: null,
    created_at: new Date('2025-08-15').toLocaleDateString('pt-Br', {
      month: 'long',
      year: 'numeric',
    }),
    completedEventsCount: 24,
    pendingEventsCount: 5,
  },
  '55555555-5555-4555-8555-555555555555': {
    id: '55555555-5555-4555-8555-555555555555',
    name: 'Eduarda Costa',
    created_at: new Date('2026-07-08').toLocaleDateString('pt-Br', {
      month: 'long',
      year: 'numeric',
    }),
    photoUri: null,
    completedEventsCount: 8,
    pendingEventsCount: 0,
  },
  '88888888-8888-4888-8888-888888888888': {
    id: '88888888-8888-4888-8888-888888888888',
    name: 'Gustavo Pereira',
    created_at: new Date('2026-05-30').toLocaleDateString('pt-Br', {
      month: 'long',
      year: 'numeric',
    }),
    photoUri: null,
    completedEventsCount: 3,
    pendingEventsCount: 1,
  },
  '99999999-9999-4999-8999-999999999999': {
    id: '99999999-9999-4999-8999-999999999999',
    name: 'Fernanda',
    created_at: new Date('2026-01-23').toLocaleDateString('pt-Br', {
      month: 'long',
      year: 'numeric',
    }),
    photoUri: null,
    completedEventsCount: 0,
    pendingEventsCount: 0,
  },
  'user-1': {
    id: 'user-1',
    name: 'Ellen Miranda',
    created_at: new Date('2026-09-21').toLocaleDateString('pt-Br', {
      month: 'long',
      year: 'numeric',
    }),
    photoUri: null,
    completedEventsCount: 0,
    pendingEventsCount: 0,
  },
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const getUserProfile = async (userId: string): Promise<UserProfile> => {
  await delay(MOCK_DELAY_MS);

  const user = mockDatabase[userId];
  //não é sempre verdadeiro e precisa pra validar os cenários
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (user) {
    return user;
  }

  return {
    id: userId,
    name: 'Usuário não encontrado',
    photoUri: null,
    created_at: '',
    completedEventsCount: 0,
    pendingEventsCount: 0,
  };
};

export const updateUserProfile = async (
  userId: string,
  payload: UpdateUserProfilePayload
): Promise<UserProfile> => {
  await delay(MOCK_DELAY_MS);

  const current =
    mockDatabase[userId] ??
    ({
      id: userId,
      name: 'Usuário não encontrado',
      photoUri: null,
      created_at: '',
      completedEventsCount: 0,
      pendingEventsCount: 0,
    } satisfies UserProfile);

  const updated: UserProfile = {
    ...current,
    name: payload.name ?? current.name,
    photoUri: payload.photo?.uri ?? current.photoUri,
  };

  mockDatabase[userId] = updated;

  return updated;
};
