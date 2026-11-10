import type { ReactNode } from 'react';

export type ScreenFrameBackground = 'canvas' | 'surface';

/**
 * - `default`: horizontal gutter plus the standard top spacing.
 * - `horizontal`: only the horizontal gutter, for screens whose artwork starts at the top.
 * - `none`: full-bleed content; the screen owns all spacing.
 */
export type ScreenFramePadding = 'default' | 'horizontal' | 'none';

export type ScreenFrameGap = 'none' | 'md' | 'lg';

/** Space a list must leave free so its first and last items clear a floating header and footer. */
export interface ScreenFrameLayout {
  readonly topInset: number;
  readonly bottomInset: number;
}

export interface ScreenFrameProps {
  /** A function receives the insets to apply when `floatingChrome` wraps a virtualized list. */
  readonly children: ReactNode | ((layout: ScreenFrameLayout) => ReactNode);
  /**
   * Renders the content inside a keyboard-aware ScrollView that keeps the focused input visible.
   * Disable it for screens that render their own virtualized list.
   */
  readonly scrollable?: boolean;
  readonly background?: ScreenFrameBackground;
  readonly padding?: ScreenFramePadding;
  /** Spacing between the direct children of the content area. */
  readonly gap?: ScreenFrameGap;
  /** Fixed content at the top of the screen, such as a back button or tabs. */
  readonly header?: ReactNode;
  /** Content pinned to the bottom of the screen, such as the NavigationBar. */
  readonly footer?: ReactNode;
  /**
   * Floats the header and footer over the content, which scrolls behind them and starts at the
   * top of the screen. A virtualized list applies the insets it receives through `children`.
   */
  readonly floatingChrome?: boolean;
  /**
   * Fades content out at the top of the screen, behind a floating header.
   * - `true`: stays hidden until the content scrolls; needs `scrollable`.
   * - `'always'`: visible from the start, for screens whose content fits without scrolling.
   * - `'header'`: opaque behind the whole header and ending just below it, for tall headers.
   */
  readonly topFade?: boolean | 'always' | 'header';
  /** Applied to the ScrollView, or to the content area when `scrollable` is false. */
  readonly testID?: string;
}
