import type { ReactNode } from 'react';

export type ScreenFrameBackground = 'canvas' | 'surface';

/**
 * - `default`: horizontal gutter plus the standard top spacing.
 * - `horizontal`: only the horizontal gutter, for screens whose artwork starts at the top.
 * - `none`: full-bleed content; the screen owns all spacing.
 */
export type ScreenFramePadding = 'default' | 'horizontal' | 'none';

export type ScreenFrameGap = 'none' | 'md' | 'lg';

export interface ScreenFrameProps {
  readonly children: ReactNode;
  /**
   * Renders the content inside a keyboard-aware ScrollView that keeps the focused input visible.
   * Disable it for screens that render their own virtualized list.
   */
  readonly scrollable?: boolean;
  readonly background?: ScreenFrameBackground;
  readonly padding?: ScreenFramePadding;
  /** Spacing between the direct children of the content area. */
  readonly gap?: ScreenFrameGap;
  /** Fixed content above the scrollable area, such as a back button or tabs. */
  readonly header?: ReactNode;
  /** Content pinned to the bottom of the screen, such as the NavigationBar. */
  readonly footer?: ReactNode;
  /** Applied to the ScrollView, or to the content area when `scrollable` is false. */
  readonly testID?: string;
}
