export type AuthRedirect = '/auth' | '/groups' | null;

export function getAuthRedirect(
  currentSegment: string | undefined,
  hasSession: boolean,
  isPending: boolean,
  isInitialCheck = false
): AuthRedirect {
  if (isPending) {
    return null;
  }

  if (isInitialCheck) {
    return hasSession ? '/groups' : '/auth';
  }

  const isAuthRoute = currentSegment === '(auth)';
  const isProfileSetupRoute = currentSegment === '(profile)';
  const isInitialRoute = currentSegment === undefined || currentSegment === 'index';

  if (!hasSession && !isAuthRoute && !isProfileSetupRoute) {
    return '/auth';
  }

  if (hasSession && (isAuthRoute || isInitialRoute)) {
    return '/groups';
  }

  return null;
}
