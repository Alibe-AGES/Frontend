// Builds the splash Lottie files from the splash SVGs.
// - Ribbons and the logo symbol are filled outlines of single strokes: we recover each
//   piece's centerline, chain the pieces end to end and draw them with a trim path.
// - The wordmark letters keep their exact SVG shapes and are revealed by a matte that
//   follows the stroke guides in splash-wordmark-guides.json (traced from the letter
//   skeletons, one entry per pen stroke, in writing order).
// Usage: node scripts/build-splash-lottie.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// Every animation shares one 100-frame timeline so the splash can restart them together.
const FRAME_RATE = 60;
const SEAM_OVERLAP = 2;
const TOTAL_FRAMES = 100;

const RIBBONS = [
  {
    source: 'assets/images/splash-detail-top.svg',
    output: 'assets/animations/splash-ribbon-top.json',
    startNear: [10, -57],
    startFrame: 0,
    endFrame: 90,
  },
  {
    source: 'assets/images/splash-detail-bottom.svg',
    output: 'assets/animations/splash-ribbon-bottom.json',
    startNear: [-130, 69],
    startFrame: 10,
    endFrame: 100,
  },
];

// Symbol above the wordmark, as in the splash layout.
const LOGO = {
  output: 'assets/animations/splash-logo.json',
  stillOutput: 'assets/images/splash-logo.svg',
  width: 268,
  height: 273,
  symbol: {
    source: 'assets/images/splash-symbol.svg',
    offset: [82, 0],
    startNear: [1, 95],
    startFrame: 0,
    endFrame: 48,
    // Heads pop in once each body has been drawn, in SVG path order.
    headFrames: [44, 20],
  },
  wordmark: {
    source: 'assets/images/splash-wordmark.svg',
    guides: 'scripts/splash-wordmark-guides.json',
    offset: [0, 141],
    // One [start, end] per guide: A, A crossbar, l, ! stem, b stem, b bowl, e.
    strokeFrames: [
      [22, 40],
      [36, 48],
      [44, 56],
      [52, 62],
      [62, 72],
      [68, 82],
      [74, 100],
    ],
    // Paths that pop in instead of being drawn: the dot of the "!".
    pops: [{ path: 3, startFrame: 60 }],
  },
};

const POP_FRAMES = 16;

const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const scale = (a, k) => [a[0] * k, a[1] * k];
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const round = (value) => Math.round(value * 100) / 100;
const clamp = (value) => Math.min(Math.max(value, 0), 1);

const readSvg = (path) => readFileSync(join(root, path), 'utf8');
const svgPaths = (svg) =>
  [...svg.matchAll(/<path d="([^"]+)" fill="([^"]+)"/g)].map(([, d, fill]) => ({ d, fill }));

// Returns one list of segments per subpath (absolute M, L, H, V, C and Z only).
function parseSubpaths(d) {
  const tokens = d.match(/[MLHVCZ]|-?\d*\.?\d+(?:e-?\d+)?/gi);
  const subpaths = [];
  let index = 0;
  let current = null;
  let start = null;
  let command = null;
  const next = () => Number(tokens[index++]);
  const point = () => [next(), next()];
  const line = (end) => {
    subpaths.at(-1).push({ type: 'L', points: [current, end] });
    current = end;
  };

  while (index < tokens.length) {
    if (/[MLHVCZ]/i.test(tokens[index])) command = tokens[index++].toUpperCase();
    if (command === 'M') {
      current = point();
      start = current;
      subpaths.push([]);
      command = 'L';
    } else if (command === 'L') {
      line(point());
    } else if (command === 'H') {
      line([next(), current[1]]);
    } else if (command === 'V') {
      line([current[0], next()]);
    } else if (command === 'C') {
      const controls = [point(), point(), point()];
      subpaths.at(-1).push({ type: 'C', points: [current, ...controls] });
      current = controls[2];
    } else if (command === 'Z') {
      if (dist(current, start) > 1e-6) line(start);
      current = start;
    }
  }
  return subpaths;
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

// The outline of a stroke is: edge A, end cap, edge B, end cap.
function centerline(segments, spacing) {
  const caps = segments
    .map((segment, index) => ({ segment, index }))
    .filter(({ segment }) => segment.type === 'L' && segmentLength(segment) > 5);
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

  // Midpoints bunch up or spread out on tight curves; even them out before smoothing.
  const even = resample(middle, 1);
  const smooth = even.map((point, index) => {
    if (index < 3 || index > even.length - 4) return point;
    const window = even.slice(index - 3, index + 4);
    return scale(window.reduce(add, [0, 0]), 1 / window.length);
  });

  const sortedWidths = [...widths].sort((a, b) => a - b);
  return {
    points: resample(smooth, spacing),
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

// Opacity of a linear gradient at a point.
function opacityAt(gradient, point) {
  const axis = sub(gradient.end, gradient.start);
  const t = clamp(
    ((point[0] - gradient.start[0]) * axis[0] + (point[1] - gradient.start[1]) * axis[1]) /
      (axis[0] ** 2 + axis[1] ** 2)
  );
  const stops = gradient.stops;
  const after = stops.findIndex((stop) => stop.offset >= t);
  if (after <= 0) return stops[after === 0 ? 0 : stops.length - 1].opacity;
  const before = stops[after - 1];
  const span = (t - before.offset) / (stops[after].offset - before.offset);
  return before.opacity + (stops[after].opacity - before.opacity) * span;
}

const gradientOf = (fill, gradients) => gradients[fill.match(/url\(#([^)]+)\)/)[1]];

// Smooth open path through the points. before/after are the neighbouring points of
// the pieces it joins, so both sides of a seam leave it in the same direction.
function lottiePath(points, before, after) {
  const tangent = (index) => {
    const previous = points[index - 1] ?? before;
    const next = points[index + 1] ?? after;
    if (previous && next) return scale(sub(next, previous), 1 / 6);
    return scale(sub(next ?? points[index], previous ?? points[index]), 1 / 3);
  };
  return {
    c: false,
    v: points.map((point) => point.map(round)),
    i: points.map((_, index) => scale(tangent(index), -1).map(round)),
    o: points.map((_, index) => tangent(index).map(round)),
  };
}

// Exact closed path for one SVG subpath.
function lottieOutline(segments) {
  const count = segments.length;
  return {
    c: true,
    v: segments.map((segment) => segment.points[0].map(round)),
    o: segments.map((segment) =>
      segment.type === 'C' ? sub(segment.points[1], segment.points[0]).map(round) : [0, 0]
    ),
    i: segments.map((_, index) => {
      const previous = segments[(index - 1 + count) % count];
      return previous.type === 'C'
        ? sub(previous.points[2], previous.points[3]).map(round)
        : [0, 0];
    }),
  };
}

// Moves `length` from point along the direction from `from` to `to`.
const step = (point, from, to, length) => add(point, scale(sub(to, from), length / dist(to, from)));

const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const easeOutBack = (t) => 1 + 2.70158 * (t - 1) ** 3 + 1.70158 * (t - 1) ** 2;

// Bakes one keyframe per frame, keeping only the frames where the value changes plus
// the edges of each hold. valueAt returns an array for the frame.
function bake(valueAt) {
  const values = Array.from({ length: TOTAL_FRAMES + 1 }, (_, frame) => valueAt(frame).map(round));
  const same = (a, b) => b !== undefined && a.every((value, index) => value === b[index]);
  const linear = { o: { x: [0], y: [0] }, i: { x: [1], y: [1] } };
  const keyframes = values
    .map((value, frame) => ({ t: frame, s: value, ...linear }))
    .filter(
      ({ t, s }) =>
        t === 0 || t === TOTAL_FRAMES || !same(s, values[t - 1]) || !same(s, values[t + 1])
    );
  const last = keyframes[keyframes.length - 1];
  delete last.o;
  delete last.i;
  return keyframes;
}

// Trim end for a stretch [from, to] of a path drawn between startFrame and endFrame.
// enter/exit limit the easing to the visible part of paths that run off the canvas.
function trimKeyframes({ from = 0, to = 1, startFrame, endFrame, enter = 0, exit = 1 }) {
  return bake((frame) => {
    const time = clamp((frame - startFrame) / (endFrame - startFrame));
    const progress = frame >= endFrame ? 1 : enter + easeInOutCubic(time) * (exit - enter);
    return [clamp((progress - from) / (to - from)) * 100];
  });
}

function popKeyframes(startFrame) {
  return bake((frame) => {
    const time = clamp((frame - startFrame) / POP_FRAMES);
    const size = time === 0 ? 0 : easeOutBack(time) * 100;
    return [size, size];
  });
}

const rgb = (color) => [0, 2, 4].map((at) => round(parseInt(color.slice(at, at + 2), 16) / 255));

function gradientColors(gradient) {
  const colors = gradient.stops.flatMap((stop) => [stop.offset, ...rgb(stop.color)]);
  const alphas = gradient.stops.flatMap((stop) => [stop.offset, stop.opacity]);
  return {
    g: { p: gradient.stops.length, k: { a: 0, k: [...colors, ...alphas] } },
    s: { a: 0, k: gradient.start },
    e: { a: 0, k: gradient.end },
    t: 1,
  };
}

const gradientStroke = (gradient, width) => ({
  ty: 'gs',
  nm: 'Gradient Stroke',
  o: { a: 0, k: 100 },
  w: { a: 0, k: round(width) },
  ...gradientColors(gradient),
  lc: 1,
  lj: 2,
  ml: 4,
});

const transform = (anchor = [0, 0], scaleProperty = { a: 0, k: [100, 100] }) => ({
  ty: 'tr',
  p: { a: 0, k: anchor },
  a: { a: 0, k: anchor },
  s: scaleProperty,
  r: { a: 0, k: 0 },
  o: { a: 0, k: 100 },
});

const trim = (keyframes) => ({
  ty: 'tm',
  nm: 'Trim',
  s: { a: 0, k: 0 },
  e: { a: 1, k: keyframes },
  o: { a: 0, k: 0 },
  m: 1,
});

let layerIndex = 0;
function shapeLayer(name, shapes, { offset = [0, 0], matte } = {}) {
  layerIndex += 1;
  return {
    ddd: 0,
    ind: layerIndex,
    ty: 4,
    nm: name,
    sr: 1,
    ks: {
      o: { a: 0, k: 100 },
      r: { a: 0, k: 0 },
      p: { a: 0, k: [...offset, 0] },
      a: { a: 0, k: [0, 0, 0] },
      s: { a: 0, k: [100, 100, 100] },
    },
    ao: 0,
    shapes,
    ip: 0,
    // Past the composition's end, so players that stop on its last frame still show it.
    op: TOTAL_FRAMES + 1,
    st: 0,
    bm: 0,
    ...(matte === 'source' ? { td: 1 } : {}),
    ...(matte === 'target' ? { tt: 1 } : {}),
  };
}

function composition(name, width, height, layers) {
  return {
    v: '5.7.4',
    fr: FRAME_RATE,
    ip: 0,
    op: TOTAL_FRAMES,
    w: width,
    h: height,
    nm: name,
    ddd: 0,
    assets: [],
    layers,
  };
}

function write(path, animation) {
  writeFileSync(join(root, path), `${JSON.stringify(animation)}\n`);
}

// Chains the stroke pieces of an SVG end to end, starting at the loose end near startNear.
function chainStrokes(paths, gradients, startNear, spacing) {
  const pieces = paths.map(({ d, fill }, order) => ({
    order,
    gradient: gradientOf(fill, gradients),
    ...centerline(parseSubpaths(d)[0], spacing),
  }));
  const ends = (piece) => [piece.points[0], piece.points.at(-1)];
  const touches = (point, other) =>
    pieces.some((piece) => piece !== other && ends(piece).some((end) => dist(end, point) < 4));
  const loose = pieces.flatMap((piece) =>
    [0, 1]
      .filter((side) => !touches(ends(piece)[side], piece))
      .map((side) => ({ piece, side, distance: dist(ends(piece)[side], startNear) }))
  );
  let { piece: current, side } = loose.sort((a, b) => a.distance - b.distance)[0];
  const chain = [];
  while (current) {
    const points = side === 0 ? current.points : [...current.points].reverse();
    chain.push({ ...current, points });
    const tail = points.at(-1);
    const next = pieces.find(
      (piece) =>
        !chain.some((done) => done.order === piece.order) &&
        ends(piece).some((end) => dist(end, tail) < 4)
    );
    side = next && dist(next.points[0], tail) < 4 ? 0 : 1;
    current = next;
  }
  return chain;
}

// One drawn group per piece; the pieces are drawn one after another as a single stroke.
function strokeGroups(chain, timing) {
  const total = chain.reduce((sum, piece) => sum + polylineLength(piece.points), 0);
  // The pieces meet at angled cuts. At each seam the piece drawn underneath runs a
  // little past the cut, so no hairline gap shows, and the piece on top hides the
  // overlap. Where the piece on top is translucent the overlap would show, so skip it.
  const seamOverlap = (piece, neighbour, end) =>
    neighbour && neighbour.order > piece.order && opacityAt(neighbour.gradient, end) > 0.99
      ? SEAM_OVERLAP
      : 0;
  let travelled = 0;
  const groups = chain.map((piece, index) => {
    const from = travelled / total;
    travelled += polylineLength(piece.points);
    const { points } = piece;
    const before = chain[index - 1]?.points.at(-2);
    const after = chain[index + 1]?.points[1];
    const startOverlap = seamOverlap(piece, chain[index - 1], points[0]);
    const endOverlap = seamOverlap(piece, chain[index + 1], points.at(-1));
    const path = [
      ...(startOverlap ? [step(points[0], points[1], before, startOverlap)] : []),
      ...points,
      ...(endOverlap ? [step(points.at(-1), points.at(-2), after, endOverlap)] : []),
    ];
    return {
      order: piece.order,
      group: {
        ty: 'gr',
        nm: `Piece ${piece.order + 1}`,
        it: [
          { ty: 'sh', nm: 'Path', ks: { a: 0, k: lottiePath(path, before, after) } },
          trim(trimKeyframes({ ...timing, from, to: travelled / total })),
          gradientStroke(piece.gradient, piece.width),
          transform(),
        ],
      },
    };
  });
  // Lottie draws the first shape on top, SVG draws the last path on top.
  return groups.sort((a, b) => b.order - a.order).map(({ group }) => group);
}

function buildRibbon(ribbon) {
  const svg = readSvg(ribbon.source);
  const [, width, height] = svg.match(/viewBox="0 0 (\d+) (\d+)"/).map(Number);
  const chain = chainStrokes(svgPaths(svg), parseGradients(svg), ribbon.startNear, 6);

  // The ribbon ends run past the canvas edges, so the easing only covers the
  // visible stretch [enter, exit]; the hidden ends are drawn instantly.
  const margin = Math.max(...chain.map((piece) => piece.width));
  const isVisible = ([x, y]) =>
    x > -margin && y > -margin && x < width + margin && y < height + margin;
  const route = chain.flatMap((piece) => piece.points);
  const total = polylineLength(route);
  const visible = route
    .map((point, index) => ({ point, fraction: polylineLength(route.slice(0, index + 1)) / total }))
    .filter(({ point }) => isVisible(point));
  const timing = {
    startFrame: ribbon.startFrame,
    endFrame: ribbon.endFrame,
    enter: visible[0].fraction,
    exit: visible.at(-1).fraction,
  };

  const name = ribbon.output.split('/').at(-1).replace('.json', '');
  write(
    ribbon.output,
    composition(name, width, height, [shapeLayer('Ribbon', strokeGroups(chain, timing))])
  );
  console.log(`${ribbon.output}: ${chain.length} pieces`);
}

function fillShapes(d, fill) {
  return [
    ...parseSubpaths(d).map((segments, index) => ({
      ty: 'sh',
      nm: `Path ${index + 1}`,
      ks: { a: 0, k: lottieOutline(segments) },
    })),
    { ty: 'fl', nm: 'Fill', o: { a: 0, k: 100 }, c: { a: 0, k: [...rgb(fill.slice(1)), 1] }, r: 2 },
  ];
}

const centerOf = (d) => {
  const points = parseSubpaths(d)[0].map((segment) => segment.points[0]);
  return scale(points.reduce(add, [0, 0]), 1 / points.length).map(round);
};

function buildLogo() {
  const { symbol, wordmark } = LOGO;
  const layers = [];

  // Symbol: two bodies drawn as one stroke, then the heads pop in.
  const symbolSvg = readSvg(symbol.source);
  const gradients = parseGradients(symbolSvg);
  const symbolPaths = svgPaths(symbolSvg);
  const heads = symbolPaths.slice(0, symbol.headFrames.length);
  const bodies = symbolPaths.slice(symbol.headFrames.length);
  const headGroups = heads.map(({ d, fill }, index) => ({
    ty: 'gr',
    nm: `Head ${index + 1}`,
    it: [
      { ty: 'sh', nm: 'Path', ks: { a: 0, k: lottieOutline(parseSubpaths(d)[0]) } },
      {
        ty: 'gf',
        nm: 'Gradient Fill',
        o: { a: 0, k: 100 },
        r: 1,
        ...gradientColors(gradientOf(fill, gradients)),
      },
      transform(centerOf(d), { a: 1, k: popKeyframes(symbol.headFrames[index]) }),
    ],
  }));
  const bodyChain = chainStrokes(bodies, gradients, symbol.startNear, 3);
  layers.push(
    shapeLayer('Symbol', [...headGroups, ...strokeGroups(bodyChain, symbol)], {
      offset: symbol.offset,
    })
  );

  // Wordmark: exact letter shapes, each revealed by a matte along its pen strokes.
  const letters = svgPaths(readSvg(wordmark.source));
  const guides = JSON.parse(readFileSync(join(root, wordmark.guides), 'utf8'));
  letters.forEach(({ d, fill }, letter) => {
    const pop = wordmark.pops.find(({ path }) => path === letter);
    if (pop) {
      layers.push(
        shapeLayer(
          `Letter ${letter + 1}`,
          [
            {
              ty: 'gr',
              nm: 'Dot',
              it: [
                ...fillShapes(d, fill),
                transform(centerOf(d), { a: 1, k: popKeyframes(pop.startFrame) }),
              ],
            },
          ],
          { offset: wordmark.offset }
        )
      );
      return;
    }
    const strokes = guides
      .map((guide, index) => ({ ...guide, frames: wordmark.strokeFrames[index] }))
      .filter((guide) => guide.letter === letter);
    const matte = strokes.map((guide, index) => ({
      ty: 'gr',
      nm: `Stroke ${index + 1}`,
      it: [
        { ty: 'sh', nm: 'Path', ks: { a: 0, k: lottiePath(guide.points) } },
        trim(trimKeyframes({ startFrame: guide.frames[0], endFrame: guide.frames[1] })),
        {
          ty: 'st',
          nm: 'Stroke',
          o: { a: 0, k: 100 },
          w: { a: 0, k: round(guide.width * 1.4) },
          c: { a: 0, k: [1, 1, 1, 1] },
          lc: 2,
          lj: 2,
          ml: 4,
        },
        transform(),
      ],
    }));
    // The strokes trace the pen path, so they can leave a sliver of a corner uncovered;
    // the exact letter shape fills the matte in once the last stroke lands.
    const lastFrame = Math.min(
      Math.max(...strokes.map((guide) => guide.frames[1])),
      TOTAL_FRAMES - 1
    );
    matte.push({
      ty: 'gr',
      nm: 'Fill in',
      it: [
        ...fillShapes(d, '#FFFFFF').slice(0, -1),
        {
          ty: 'fl',
          nm: 'Fill',
          o: { a: 1, k: bake((frame) => [frame >= lastFrame ? 100 : 0]) },
          c: { a: 0, k: [1, 1, 1, 1] },
          r: 2,
        },
        transform(),
      ],
    });
    layers.push(
      shapeLayer(`Letter ${letter + 1} matte`, matte, { offset: wordmark.offset, matte: 'source' }),
      shapeLayer(
        `Letter ${letter + 1}`,
        [{ ty: 'gr', nm: 'Letter', it: [...fillShapes(d, fill), transform()] }],
        {
          offset: wordmark.offset,
          matte: 'target',
        }
      )
    );
  });

  write(LOGO.output, composition('splash-logo', LOGO.width, LOGO.height, layers));

  // Still version of the same layout, shown when the system asks to reduce motion.
  const inner = (svg) =>
    svg
      .replace(/^[\s\S]*?<svg[^>]*>/, '')
      .replace(/<\/svg>\s*$/, '')
      .trim();
  const place = (offset, svg) =>
    `<g transform="translate(${offset.join(' ')})">\n${inner(svg)}\n</g>`;
  writeFileSync(
    join(root, LOGO.stillOutput),
    `<svg width="${LOGO.width}" height="${LOGO.height}" viewBox="0 0 ${LOGO.width} ${LOGO.height}" fill="none" xmlns="http://www.w3.org/2000/svg">\n` +
      `${place(symbol.offset, symbolSvg)}\n${place(wordmark.offset, readSvg(wordmark.source))}\n</svg>\n`
  );
  console.log(`${LOGO.output}: ${bodyChain.length} symbol pieces, ${guides.length} letter strokes`);
}

RIBBONS.forEach(buildRibbon);
buildLogo();
