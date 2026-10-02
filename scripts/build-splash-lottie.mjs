// Builds the splash ribbon Lottie files from the outlined ribbon SVGs.
// Each SVG ribbon is a filled outline; we recover its centerline, chain the
// pieces end to end and draw them with an animated trim path.
// Usage: node scripts/build-splash-lottie.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const FRAME_RATE = 60;
const SEAM_OVERLAP = 5;
const TOTAL_FRAMES = 100;

const RIBBONS = [
  {
    source: 'assets/images/splash-detail-top.svg',
    output: 'assets/animations/splash-ribbon-top.json',
    startFrame: 0,
    endFrame: 90,
  },
  {
    source: 'assets/images/splash-detail-bottom.svg',
    output: 'assets/animations/splash-ribbon-bottom.json',
    startFrame: 10,
    endFrame: 100,
  },
];

const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const scale = (a, k) => [a[0] * k, a[1] * k];
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const round = (value) => Math.round(value * 100) / 100;

function parsePath(d) {
  const tokens = d.match(/[MCLZ]|-?\d*\.?\d+(?:e-?\d+)?/gi);
  const segments = [];
  let index = 0;
  let current = null;
  let start = null;
  let command = null;
  const next = () => Number(tokens[index++]);
  const point = () => [next(), next()];

  while (index < tokens.length) {
    if (/[MCLZ]/i.test(tokens[index])) command = tokens[index++].toUpperCase();
    if (command === 'M') {
      current = point();
      start = current;
      command = 'L';
    } else if (command === 'L') {
      const end = point();
      segments.push({ type: 'L', points: [current, end] });
      current = end;
    } else if (command === 'C') {
      const controls = [point(), point(), point()];
      segments.push({ type: 'C', points: [current, ...controls] });
      current = controls[2];
    } else if (command === 'Z') {
      if (dist(current, start) > 1e-6) segments.push({ type: 'L', points: [current, start] });
      current = start;
    }
  }
  return segments;
}

function pointAt(segment, t) {
  const [p0, p1, p2, p3] = segment.points;
  if (segment.type === 'L') return add(p0, scale(sub(p1, p0), t));
  const mt = 1 - t;
  return [0, 1].map(
    (axis) =>
      mt * mt * mt * p0[axis] +
      3 * mt * mt * t * p1[axis] +
      3 * mt * t * t * p2[axis] +
      t * t * t * p3[axis]
  );
}

function resample(points, spacing) {
  const result = [points[0]];
  let carried = 0;
  for (let i = 1; i < points.length; i++) {
    let from = points[i - 1];
    const to = points[i];
    let length = dist(from, to);
    while (carried + length >= spacing) {
      const t = (spacing - carried) / length;
      from = add(from, scale(sub(to, from), t));
      result.push(from);
      length = dist(from, to);
      carried = 0;
    }
    carried += length;
  }
  const last = points[points.length - 1];
  if (dist(result[result.length - 1], last) > spacing / 4) result.push(last);
  else result[result.length - 1] = last;
  return result;
}

function sampleEdge(segments) {
  const points = [segments[0].points[0]];
  for (const segment of segments) {
    for (let step = 1; step <= 120; step++) points.push(pointAt(segment, step / 120));
  }
  return resample(points, 1);
}

const segmentLength = (segment) =>
  dist(segment.points[0], segment.points[segment.points.length - 1]);

// The outline of a stroked ribbon is: edge A, end cap, edge B, end cap.
function centerline(segments) {
  const caps = segments
    .map((segment, index) => ({ segment, index }))
    .filter(({ segment }) => segment.type === 'L' && segmentLength(segment) > 10);
  if (caps.length !== 2) throw new Error(`Expected 2 end caps, found ${caps.length}`);

  const [first, second] = caps.map(({ index }) => index);
  const edgeA = sampleEdge(segments.slice(first + 1, second));
  const edgeB = sampleEdge([...segments.slice(second + 1), ...segments.slice(0, first)]).reverse();

  // Match edge points monotonically so strands crossing each other never pair up.
  const middle = [];
  const widths = [];
  let match = 0;
  for (const point of edgeA) {
    let best = match;
    for (let j = match; j < Math.min(edgeB.length, match + 60); j++) {
      if (dist(point, edgeB[j]) < dist(point, edgeB[best])) best = j;
    }
    match = best;
    middle.push(scale(add(point, edgeB[best]), 0.5));
    widths.push(dist(point, edgeB[best]));
  }
  middle[middle.length - 1] = scale(add(edgeA[edgeA.length - 1], edgeB[edgeB.length - 1]), 0.5);

  const smooth = middle.map((point, index) => {
    if (index < 3 || index > middle.length - 4) return point;
    const window = middle.slice(index - 3, index + 4);
    return scale(window.reduce(add, [0, 0]), 1 / window.length);
  });

  const sortedWidths = [...widths].sort((a, b) => a - b);
  return {
    points: resample(smooth, 6),
    width: sortedWidths[Math.floor(sortedWidths.length / 2)],
  };
}

function polylineLength(points) {
  return points.slice(1).reduce((total, point, index) => total + dist(point, points[index]), 0);
}

function parseGradients(svg) {
  const gradients = {};
  for (const match of svg.matchAll(/<linearGradient([^>]*)>([\s\S]*?)<\/linearGradient>/g)) {
    const attr = (name) => Number(match[1].match(new RegExp(`${name}="([^"]+)"`))[1]);
    const id = match[1].match(/id="([^"]+)"/)[1];
    const stops = [...match[2].matchAll(/<stop([^>]*)\/>/g)].map(([, attrs]) => ({
      offset: Number(attrs.match(/offset="([^"]+)"/)?.[1] ?? 0),
      color: attrs.match(/stop-color="#([0-9a-f]{6})"/i)[1],
      opacity: Number(attrs.match(/stop-opacity="([^"]+)"/)?.[1] ?? 1),
    }));
    gradients[id] = {
      start: [attr('x1'), attr('y1')],
      end: [attr('x2'), attr('y2')],
      stops,
    };
  }
  return gradients;
}

function lottiePath(points) {
  const tangent = (index) => {
    const before = points[Math.max(index - 1, 0)];
    const after = points[Math.min(index + 1, points.length - 1)];
    const span = index === 0 || index === points.length - 1 ? 3 : 6;
    return scale(sub(after, before), 1 / span);
  };
  return {
    c: false,
    v: points.map((point) => point.map(round)),
    i: points.map((_, index) => scale(tangent(index), -1).map(round)),
    o: points.map((_, index) => tangent(index).map(round)),
  };
}

function extendEnds(points, startLength, endLength) {
  const extend = (end, neighbour, length) =>
    add(end, scale(sub(end, neighbour), length / dist(end, neighbour)));
  return [
    ...(startLength ? [extend(points[0], points[1], startLength)] : []),
    ...points,
    ...(endLength ? [extend(points.at(-1), points.at(-2), endLength)] : []),
  ];
}

const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

// The ribbon ends run past the canvas edges, so the easing only covers the
// visible stretch [enter, exit]; the hidden ends are drawn instantly.
function trimKeyframes(from, to, ribbon, enter, exit) {
  const values = [];
  for (let frame = 0; frame <= ribbon.endFrame; frame++) {
    const time = Math.max(frame - ribbon.startFrame, 0) / (ribbon.endFrame - ribbon.startFrame);
    const progress = frame === ribbon.endFrame ? 1 : enter + easeInOutCubic(time) * (exit - enter);
    const local = (progress - from) / (to - from);
    values.push(round(Math.min(Math.max(local, 0), 1) * 100));
  }
  // Keep only the frames where the value changes, plus the edges of each hold.
  const keyframes = values
    .map((value, frame) => ({ t: frame, s: [value], o: { x: [0], y: [0] }, i: { x: [1], y: [1] } }))
    .filter(
      ({ t, s: [value] }) =>
        t === 0 || t === values.length - 1 || value !== values[t - 1] || value !== values[t + 1]
    );
  const last = keyframes[keyframes.length - 1];
  delete last.o;
  delete last.i;
  return keyframes;
}

function gradientStroke(gradient, width) {
  const rgb = (color) => [0, 2, 4].map((at) => round(parseInt(color.slice(at, at + 2), 16) / 255));
  const colors = gradient.stops.flatMap((stop) => [stop.offset, ...rgb(stop.color)]);
  const alphas = gradient.stops.flatMap((stop) => [stop.offset, stop.opacity]);
  return {
    ty: 'gs',
    nm: 'Gradient Stroke',
    o: { a: 0, k: 100 },
    w: { a: 0, k: round(width) },
    g: { p: gradient.stops.length, k: { a: 0, k: [...colors, ...alphas] } },
    s: { a: 0, k: gradient.start },
    e: { a: 0, k: gradient.end },
    t: 1,
    lc: 1,
    lj: 2,
    ml: 4,
  };
}

const staticTransform = {
  ty: 'tr',
  p: { a: 0, k: [0, 0] },
  a: { a: 0, k: [0, 0] },
  s: { a: 0, k: [100, 100] },
  r: { a: 0, k: 0 },
  o: { a: 0, k: 100 },
};

function buildRibbon(ribbon) {
  const svg = readFileSync(join(root, ribbon.source), 'utf8');
  const [, width, height] = svg.match(/viewBox="0 0 (\d+) (\d+)"/).map(Number);
  const gradients = parseGradients(svg);
  const pieces = [...svg.matchAll(/<path d="([^"]+)" fill="url\(#([^)]+)\)"/g)].map(
    ([, d, gradientId], order) => ({
      order,
      gradient: gradients[gradientId],
      ...centerline(parsePath(d)),
    })
  );

  // Chain the pieces by their touching ends, starting from the light (lime) loose end.
  const isTouching = (point, other) =>
    pieces.some(
      (piece) =>
        piece !== other &&
        [piece.points[0], piece.points.at(-1)].some((end) => dist(end, point) < 4)
    );
  const loose = pieces.flatMap((piece) =>
    [0, 1]
      .filter((side) => !isTouching(side ? piece.points.at(-1) : piece.points[0], piece))
      .map((side) => ({ piece, side }))
  );
  const lightness = ({ piece }) =>
    parseInt(piece.gradient.stops.at(-1).color.slice(2, 4), 16) +
    parseInt(piece.gradient.stops[0].color.slice(2, 4), 16);
  let { piece: currentPiece, side } = loose.sort((a, b) => lightness(b) - lightness(a))[0];
  const chain = [];
  while (currentPiece) {
    const points = side === 0 ? currentPiece.points : [...currentPiece.points].reverse();
    chain.push({ ...currentPiece, points });
    const tail = points.at(-1);
    const next = pieces.find(
      (piece) =>
        !chain.some((done) => done.order === piece.order) &&
        [piece.points[0], piece.points.at(-1)].some((end) => dist(end, tail) < 4)
    );
    side = next && dist(next.points[0], tail) < 4 ? 0 : 1;
    currentPiece = next;
  }

  const total = chain.reduce((sum, piece) => sum + polylineLength(piece.points), 0);
  const margin = Math.max(...chain.map((piece) => piece.width));
  const isVisible = ([x, y]) =>
    x > -margin && y > -margin && x < width + margin && y < height + margin;
  const route = chain.flatMap((piece) => piece.points);
  const fractions = route.map((_, index) => polylineLength(route.slice(0, index + 1)) / total);
  const visible = route
    .map((point, index) => ({ visible: isVisible(point), fraction: fractions[index] }))
    .filter((entry) => entry.visible);
  const enter = visible[0].fraction;
  const exit = visible.at(-1).fraction;
  let travelled = 0;
  // The pieces meet at angled cuts. At each seam the piece drawn underneath runs a
  // little past the cut, so no hairline gap shows; the piece on top hides the overlap.
  const seamOverlap = (piece, neighbour) =>
    neighbour && neighbour.order > piece.order ? SEAM_OVERLAP : 0;
  const groups = chain.map((piece, index) => {
    const from = travelled / total;
    travelled += polylineLength(piece.points);
    return {
      order: piece.order,
      group: {
        ty: 'gr',
        nm: `Ribbon piece ${piece.order + 1}`,
        it: [
          {
            ty: 'sh',
            nm: 'Path',
            ks: {
              a: 0,
              k: lottiePath(
                extendEnds(
                  piece.points,
                  seamOverlap(piece, chain[index - 1]),
                  seamOverlap(piece, chain[index + 1])
                )
              ),
            },
          },
          {
            ty: 'tm',
            nm: 'Trim',
            s: { a: 0, k: 0 },
            e: { a: 1, k: trimKeyframes(from, travelled / total, ribbon, enter, exit) },
            o: { a: 0, k: 0 },
            m: 1,
          },
          gradientStroke(piece.gradient, piece.width),
          staticTransform,
        ],
      },
    };
  });

  // Lottie draws the first shape on top, SVG draws the last path on top.
  const shapes = groups.sort((a, b) => b.order - a.order).map(({ group }) => group);
  const animation = {
    v: '5.7.4',
    fr: FRAME_RATE,
    ip: 0,
    op: TOTAL_FRAMES,
    w: width,
    h: height,
    nm: ribbon.output.split('/').at(-1).replace('.json', ''),
    ddd: 0,
    assets: [],
    layers: [
      {
        ddd: 0,
        ind: 1,
        ty: 4,
        nm: 'Ribbon',
        sr: 1,
        ks: {
          o: { a: 0, k: 100 },
          r: { a: 0, k: 0 },
          p: { a: 0, k: [0, 0, 0] },
          a: { a: 0, k: [0, 0, 0] },
          s: { a: 0, k: [100, 100, 100] },
        },
        ao: 0,
        shapes,
        ip: 0,
        op: TOTAL_FRAMES,
        st: 0,
        bm: 0,
      },
    ],
  };
  writeFileSync(join(root, ribbon.output), `${JSON.stringify(animation)}\n`);
  console.log(
    `${ribbon.output}: ${chain.length} pieces, visible from ${Math.round(enter * 100)}% to ${Math.round(exit * 100)}%`
  );
}

RIBBONS.forEach(buildRibbon);
