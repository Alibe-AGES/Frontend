export const mockGetCookie = jest.fn<Promise<string>, []>(() => Promise.resolve(''));
export const mockSignInEmail = jest.fn();
export const mockUseSession = jest.fn(() => ({
  data: null,
  error: null,
  isPending: false,
  isRefetching: false,
  refetch: jest.fn(),
}));

export const authClient = {
  getCookie: mockGetCookie,
  signIn: {
    email: mockSignInEmail,
  },
  useSession: mockUseSession,
};
