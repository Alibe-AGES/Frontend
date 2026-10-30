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
