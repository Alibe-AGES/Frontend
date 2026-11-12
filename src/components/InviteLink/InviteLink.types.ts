export interface InviteLinkProps {
  variant: 'primary' | 'secondary';
  link?: string | null;
  expiresAt?: string | null;
  disabled?: boolean;
  onCopy?: (link: string) => void;
  onCopyError?: (error: unknown) => void;
  onExpired?: () => void;
  testID?: string;
}
