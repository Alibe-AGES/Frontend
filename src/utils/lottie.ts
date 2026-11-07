const PAINT_TYPES = new Set(['fl', 'st']);

interface LottiePaint {
  ty: string;
  c: { k: number[] };
}

function isPaint(node: object): node is LottiePaint {
  if (!('ty' in node) || !('c' in node)) return false;
  const { ty, c } = node;
  return (
    typeof ty === 'string' &&
    PAINT_TYPES.has(ty) &&
    typeof c === 'object' &&
    c !== null &&
    'k' in c &&
    Array.isArray(c.k)
  );
}

function toHex(rgba: number[]) {
  const channels = rgba.slice(0, 3).map((channel) => {
    return Math.round(channel * 255)
      .toString(16)
      .padStart(2, '0');
  });
  return `#${channels.join('').toUpperCase()}`;
}

function toRgb(hex: string) {
  return [1, 3, 5].map((start) => Number.parseInt(hex.slice(start, start + 2), 16) / 255);
}

/**
 * Returns a copy of a Lottie animation with its fills and strokes recolored, so one file can
 * serve several palettes on every platform. Each color is replaced once, so a palette may swap
 * colors between shapes. `colors` maps uppercase `#RRGGBB` values.
 */
export function recolorLottie<T>(animation: T, colors: Record<string, string>): T {
  const replace = (node: unknown): unknown => {
    if (Array.isArray(node)) return node.map(replace);
    if (typeof node !== 'object' || node === null) return node;

    const copy = Object.fromEntries(
      Object.entries(node).map(([key, value]) => [key, replace(value)])
    );
    if (isPaint(copy)) {
      const color = colors[toHex(copy.c.k)];
      if (color) copy.c = { ...copy.c, k: [...toRgb(color), ...copy.c.k.slice(3)] };
    }
    return copy;
  };

  return replace(animation) as T;
}
