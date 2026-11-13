import { Button, type ButtonProps } from '@/components/Button';

export type ContinueButtonProps = Omit<ButtonProps, 'title' | 'variant'>;

export function ContinueButton({ testID = 'continue-button', ...props }: ContinueButtonProps) {
  return (
    <Button
      {...props}
      title="Continuar"
      variant="tertiary"
      testID={testID}
    />
  );
}
