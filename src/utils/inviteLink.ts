export function isInviteExpired(expiresAt: string, now: Date = new Date()): boolean {
  const expiration = new Date(expiresAt).getTime();

  return Number.isNaN(expiration) || expiration <= now.getTime();
}
