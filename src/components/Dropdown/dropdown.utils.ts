export interface TriggerFrame {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ScreenArea {
  height: number;
  topInset: number;
  bottomInset: number;
}

export type MenuDirection = 'down' | 'up';

export interface MenuPlacement {
  direction: MenuDirection;
  // Distance from the top (down) or bottom (up) of the screen to the menu edge next to the trigger.
  offset: number;
  maxHeight: number;
}

// Space kept between the menu and the screen edge, in density-independent units.
const SCREEN_EDGE_MARGIN = 8;

// Widest the menu gets, in density-independent units; longer labels end with an ellipsis.
const MENU_MAX_WIDTH = 220;

// Caps the menu at MENU_MAX_WIDTH, or at the screen minus a margin on each side on narrow screens.
export function getMenuMaxWidth(screenWidth: number): number {
  return Math.max(Math.min(MENU_MAX_WIDTH, screenWidth - SCREEN_EDGE_MARGIN * 2), 0);
}

// Centers the menu under the trigger, then shifts it back inside the screen when it would cross an edge.
export function getMenuLeft(trigger: TriggerFrame, menuWidth: number, screenWidth: number): number {
  const centered = trigger.x + (trigger.width - menuWidth) / 2;
  const rightmost = screenWidth - SCREEN_EDGE_MARGIN - menuWidth;

  return Math.max(Math.min(centered, rightmost), SCREEN_EDGE_MARGIN);
}

// Opens the menu below the trigger, or above it when there is more room there, and caps its
// height so it never runs past the screen edges.
export function getMenuPlacement(
  trigger: TriggerFrame,
  contentHeight: number,
  screen: ScreenArea
): MenuPlacement {
  const triggerBottom = trigger.y + trigger.height;
  const spaceBelow = screen.height - screen.bottomInset - triggerBottom - SCREEN_EDGE_MARGIN;
  const spaceAbove = trigger.y - screen.topInset - SCREEN_EDGE_MARGIN;

  if (contentHeight > spaceBelow && spaceAbove > spaceBelow) {
    return {
      direction: 'up',
      offset: screen.height - trigger.y,
      maxHeight: Math.max(spaceAbove, 0),
    };
  }

  return {
    direction: 'down',
    offset: triggerBottom,
    maxHeight: Math.max(spaceBelow, 0),
  };
}
