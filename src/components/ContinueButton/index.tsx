import { Button, type ButtonProps } from '@/components/Button';

export type ContinueButtonProps = Omit<ButtonProps, 'title'> & {
  title?: string;
};

export function ContinueButton({ title = 'Continuar', ...props }: ContinueButtonProps) {
  return (
    <Button
      {...props}
      title={title}
    />
  );
}
