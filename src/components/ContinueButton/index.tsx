import { Button } from '@/components/Button';

export interface ContinueButtonProps {
  onPress?: () => void;
  disabled?: boolean;
}

export function ContinueButton({ onPress, disabled = false }: ContinueButtonProps) {
  return (
    <Button
      title="Continuar"
      onPress={onPress}
      disabled={disabled}
    />
  );
}
