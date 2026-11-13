import type { ReactNode } from 'react';

/**
 * - `center`: a dialog; the children are wrapped in the standard rounded panel.
 * - `bottom`: a sheet anchored to the bottom; the children provide their own surface.
 */
export type ModalFramePlacement = 'center' | 'bottom';

export interface ModalFrameProps {
  readonly visible: boolean;
  readonly onRequestClose: () => void;
  readonly children: ReactNode;
  readonly placement?: ModalFramePlacement;
  /** Heading rendered at the top of a centered dialog panel. */
  readonly title?: string;
  /** Calls `onRequestClose` when the dimmed backdrop is pressed. */
  readonly closeOnBackdropPress?: boolean;
  readonly backdropLabel?: string;
  /** Applied to the Modal; inner parts use it as a prefix (`-keyboard-container`, `-scroll`, `-panel`, `-backdrop`). */
  readonly testID?: string;
}
