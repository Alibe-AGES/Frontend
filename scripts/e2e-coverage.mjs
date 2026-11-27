#!/usr/bin/env node
// Static coverage of the Maestro flows: which testIDs in src are used by at least one flow,
// which screens and routes the flows reach, and which flow selectors match nothing in src.
// It reads the code and the flow files only; it does not run the app or Maestro.
//
// Usage: node scripts/e2e-coverage.mjs [--include-tags ci,auth] [--details] [--json <file>] [--check]
//   --include-tags  only count flows with one of these tags, like `maestro test --include-tags`
//   --details       list every testID with the flows that use it
//   --json <file>   also write the full result as JSON
//   --check         exit with code 1 when a flow uses an id that matches no testID in src
//
// Limits: only `id:` selectors are mapped; text selectors are counted but not traced to src.
// A testID built from runtime data (`calendar-day-button-${dateString}`) counts as used when any
// value of it is. Ids passed through a prop are traced through `testID={...}` only, not `{...props}`.

import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC_DIR = path.join(ROOT, 'src');
const APP_DIR = path.join(SRC_DIR, 'app');
const FLOWS_DIR = path.join(ROOT, '.maestro', 'flows');

// Development-only code and tests never run in the e2e app.
const EXCLUDED_SOURCES = [
  /\.test\.tsx?$/,
  /\/__tests__\//,
  /\/__mocks__\//,
  /ComponentGallery/,
  /component-gallery/,
];
// Ids that belong to Android, not to the app.
const EXTERNAL_IDS = [/inputmethod/];
// Cap on the ids one template can expand to, so a widely reused component cannot explode the report.
const MAX_EXPANSIONS = 200;

// ---------------------------------------------------------------------------------------------
// Arguments

function parseArgs(argv) {
  const options = { tags: null, details: false, json: null, check: false };
  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index];
    if (arg === '--details') options.details = true;
    else if (arg === '--check') options.check = true;
    else if (arg === '--json') options.json = argv[++index];
    else if (arg === '--include-tags')
      options.tags = argv[++index].split(',').map((tag) => tag.trim());
    else if (arg.startsWith('--include-tags='))
      options.tags = arg
        .slice(15)
        .split(',')
        .map((tag) => tag.trim());
    else if (arg === '--help' || arg === '-h') {
      console.log(
        readFileSync(fileURLToPath(import.meta.url), 'utf8')
          .split('\n')
          .slice(1, 14)
          .join('\n')
      );
      process.exit(0);
    } else {
      console.error(`Unknown option: ${arg}`);
      process.exit(2);
    }
  }
  return options;
}

// ---------------------------------------------------------------------------------------------
// Files

function toRelative(file) {
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function listFiles(dir, extensions) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) files.push(...listFiles(full, extensions));
    else if (extensions.some((extension) => entry.endsWith(extension))) files.push(full);
  }
  return files;
}

function lineOf(text, offset) {
  let line = 1;
  for (let index = 0; index < offset; index++) if (text[index] === '\n') line++;
  return line;
}

// ---------------------------------------------------------------------------------------------
// Small JS scanner: enough to read testID expressions without a parser dependency.

// text[start] is a quote or backtick; returns the index after the closing one.
function skipString(text, start) {
  const quote = text[start];
  let index = start + 1;
  while (index < text.length) {
    const char = text[index];
    if (char === '\\') {
      index += 2;
      continue;
    }
    if (quote === '`' && char === '$' && text[index + 1] === '{') {
      index = readBraces(text, index + 1);
      continue;
    }
    if (char === quote) return index + 1;
    index++;
  }
  return index;
}

// text[start] is '{'; returns the index after the matching '}'.
function readBraces(text, start) {
  let depth = 0;
  let index = start;
  while (index < text.length) {
    const char = text[index];
    if (char === "'" || char === '"' || char === '`') {
      index = skipString(text, index);
      continue;
    }
    if (char === '{') depth++;
    else if (char === '}') {
      depth--;
      if (depth === 0) return index + 1;
    }
    index++;
  }
  return index;
}

const TEST_ID_REF = /^(?:props\.)?testID$/;

// A pattern is a list of parts: { lit } fixed text, { ref } the owner's testID prop, { wild } runtime data.
function parseTemplate(body) {
  const parts = [];
  let literal = '';
  let index = 0;
  while (index < body.length) {
    if (body[index] === '\\') {
      literal += body[index + 1];
      index += 2;
      continue;
    }
    if (body[index] === '$' && body[index + 1] === '{') {
      const end = readBraces(body, index + 1);
      const inner = body.slice(index + 2, end - 1).trim();
      if (literal) parts.push({ lit: literal });
      literal = '';
      parts.push(TEST_ID_REF.test(inner) ? { ref: true } : { wild: inner });
      index = end;
      continue;
    }
    literal += body[index];
    index++;
  }
  if (literal) parts.push({ lit: literal });
  return parts;
}

// Reads the inside of `testID={...}`. `pass` means the prop's own testID is forwarded as is.
function parseExpression(expression) {
  const concatenation = expression.trim().match(/^(?:props\.)?testID\s*\+\s*(['"])(.*)\1$/);
  if (concatenation) return { patterns: [[{ ref: true }, { lit: concatenation[2] }]], pass: false };

  const patterns = [];
  let rest = '';
  let index = 0;
  while (index < expression.length) {
    const char = expression[index];
    if (char === "'" || char === '"' || char === '`') {
      const end = skipString(expression, index);
      const body = expression.slice(index + 1, end - 1);
      patterns.push(char === '`' ? parseTemplate(body) : [{ lit: body }]);
      rest += ' ';
      index = end;
      continue;
    }
    rest += char;
    index++;
  }
  return { patterns, pass: /(?<![\w.])(?:props\.)?testID\b/.test(rest) };
}

// Name of the JSX element whose props contain the attribute at `offset`.
// Walks back over other props, skipping `{...}` values that may hold JSX themselves.
function findTag(text, offset) {
  let depth = 0;
  for (let index = offset - 1; index >= 0; index--) {
    const char = text[index];
    if (char === '}') depth++;
    else if (char === '{') depth--;
    else if (char === '<' && depth === 0) {
      const match = /^<([A-Za-z][\w.]*)/.exec(text.slice(index, index + 80));
      if (match) return match[1];
    }
  }
  return null;
}

// Top-level components of a file, in source order.
function findComponents(text) {
  const pattern =
    /^(?:export\s+)?(?:default\s+)?(?:function\s+([A-Z][a-z]\w*)|const\s+([A-Z][a-z]\w*)\b)/gm;
  return [...text.matchAll(pattern)].map((match) => ({
    name: match[1] ?? match[2],
    offset: match.index,
  }));
}

function ownerAt(components, offset) {
  let owner = null;
  for (const component of components) {
    if (component.offset < offset) owner = component.name;
    else break;
  }
  return owner;
}

function scanSource(file) {
  const text = readFileSync(file, 'utf8');
  const relative = toRelative(file);
  const components = findComponents(text);
  const occurrences = [];
  const add = (offset, kind, value) => {
    occurrences.push({
      file: relative,
      line: lineOf(text, offset),
      owner: ownerAt(components, offset),
      kind,
      ...value,
    });
  };

  for (const match of text.matchAll(/(?<![\w.])testID=(?=["'{])/g)) {
    const valueStart = match.index + match[0].length;
    const tag = findTag(text, match.index);
    if (text[valueStart] === '{') {
      const end = readBraces(text, valueStart);
      add(match.index, 'attr', { tag, ...parseExpression(text.slice(valueStart + 1, end - 1)) });
    } else {
      const end = skipString(text, valueStart);
      add(match.index, 'attr', {
        tag,
        patterns: [[{ lit: text.slice(valueStart + 1, end - 1) }]],
        pass: false,
      });
    }
  }
  // Prop default in a destructuring: `testID = 'alibe-back-button'`.
  for (const match of text.matchAll(/(?<![\w.])testID\s+=\s+(['"])(.*?)\1/g)) {
    add(match.index, 'default', { patterns: [[{ lit: match[2] }]], pass: false });
  }
  // Ids kept in objects: `{ testID: 'x' }`.
  for (const match of text.matchAll(/(?<![\w.])testID:\s*(['"])(.*?)\1/g)) {
    add(match.index, 'object', { patterns: [[{ lit: match[2] }]], pass: false });
  }

  return { file: relative, components: components.map((component) => component.name), occurrences };
}

// ---------------------------------------------------------------------------------------------
// Patterns

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function patternKey(parts) {
  return parts.map((part) => (part.lit !== undefined ? part.lit : '\u0000')).join('');
}

function displayPattern(parts) {
  return parts.map((part) => (part.lit !== undefined ? part.lit : `\${${part.wild}}`)).join('');
}

function literalLength(parts) {
  return parts.reduce((total, part) => total + (part.lit?.length ?? 0), 0);
}

// Merges neighbour literals so equal ids get the same key.
function normalize(parts) {
  const merged = [];
  for (const part of parts) {
    const last = merged[merged.length - 1];
    if (part.lit !== undefined && last?.lit !== undefined)
      merged[merged.length - 1] = { lit: last.lit + part.lit };
    else merged.push(part);
  }
  return merged;
}

// ---------------------------------------------------------------------------------------------
// testIDs in src

function collectTestIds() {
  const sources = listFiles(SRC_DIR, ['.tsx', '.ts'])
    .filter((file) => !EXCLUDED_SOURCES.some((pattern) => pattern.test(toRelative(file))))
    .map(scanSource);

  const componentKeys = new Map(); // component name -> keys `file#Name`
  for (const source of sources) {
    for (const name of source.components) {
      const keys = componentKeys.get(name) ?? [];
      keys.push(`${source.file}#${name}`);
      componentKeys.set(name, keys);
    }
  }
  const resolveTag = (tag, file) => {
    if (!tag || !/^[A-Z]/.test(tag)) return [];
    const local = `${file}#${tag}`;
    const keys = componentKeys.get(tag) ?? [];
    return keys.includes(local) ? [local] : keys;
  };

  const occurrences = sources.flatMap((source) => source.occurrences);
  const ownerKey = (occurrence) =>
    occurrence.owner ? `${occurrence.file}#${occurrence.owner}` : null;

  // The ids each component can receive through its testID prop, found by following callers until nothing changes.
  const bases = new Map();
  const basesOf = (key) => [...(bases.get(key)?.values() ?? [])];

  const expand = (parts, owner) => {
    let results = [{ parts: [], unresolved: false }];
    for (const part of parts) {
      if (!part.ref) {
        results = results.map((result) => ({ ...result, parts: [...result.parts, part] }));
        continue;
      }
      const values = owner ? basesOf(owner) : [];
      if (values.length === 0) {
        results = results.map((result) => ({
          parts: [...result.parts, { wild: 'testID' }],
          unresolved: true,
        }));
        continue;
      }
      results = results
        .flatMap((result) =>
          values.map((value) => ({
            parts: [...result.parts, ...value.parts],
            unresolved: result.unresolved || value.unresolved,
          }))
        )
        .slice(0, MAX_EXPANSIONS);
    }
    return results.map((result) => ({ ...result, parts: normalize(result.parts) }));
  };

  const addBase = (key, value) => {
    const values = bases.get(key) ?? new Map();
    bases.set(key, values);
    const id = patternKey(value.parts);
    if (values.has(id) || values.size >= MAX_EXPANSIONS) return false;
    values.set(id, value);
    return true;
  };

  for (let iteration = 0; iteration < 20; iteration++) {
    let changed = false;
    for (const occurrence of occurrences) {
      const owner = ownerKey(occurrence);
      if (occurrence.kind === 'default' && owner) {
        for (const parts of occurrence.patterns)
          changed = addBase(owner, { parts, unresolved: false }) || changed;
      }
      if (occurrence.kind !== 'attr') continue;
      const targets = resolveTag(occurrence.tag, occurrence.file);
      if (targets.length === 0) continue;
      const values = [
        ...occurrence.patterns.flatMap((parts) => expand(parts, owner)),
        ...(occurrence.pass && owner ? basesOf(owner) : []),
      ];
      for (const target of targets) {
        for (const value of values) changed = addBase(target, value) || changed;
      }
    }
    if (!changed) break;
  }

  // One entry per testID written in src (forwarded props count where they are written). A template that
  // uses the component's own testID (`${testID}-error`) stays one entry; its values per caller are only
  // used to match selectors.
  const ids = new Map();
  for (const occurrence of occurrences) {
    for (const parts of occurrence.patterns) {
      const id = displayPattern(parts.map((part) => (part.ref ? { wild: 'testID' } : part)));
      const key = `${occurrence.file}:${occurrence.line}:${id}`;
      if (ids.has(key)) continue;
      const values = expand(parts, ownerKey(occurrence)).map((expansion) => ({
        id: displayPattern(expansion.parts),
        unresolved: expansion.unresolved,
        regex: new RegExp(
          `^${expansion.parts.map((part) => (part.lit !== undefined ? escapeRegex(part.lit) : '.+')).join('')}$`
        ),
        sample: expansion.parts.map((part) => (part.lit !== undefined ? part.lit : 'X')).join(''),
        literalLength: literalLength(expansion.parts),
      }));
      ids.set(key, {
        file: occurrence.file,
        line: occurrence.line,
        id,
        unresolved: values.every((value) => value.unresolved),
        values,
        matched: new Set(),
        flows: new Set(),
      });
    }
  }
  return [...ids.values()];
}

// ---------------------------------------------------------------------------------------------
// Maestro flows

const flowCache = new Map();

function unquote(value) {
  return value
    .replace(/\s+#.*$/, '')
    .trim()
    .replace(/^(['"])(.*)\1$/, '$2');
}

function parseFlow(file) {
  if (flowCache.has(file)) return flowCache.get(file);
  const text = readFileSync(file, 'utf8');
  const lines = text.split(/\r?\n/);
  const separator = lines.findIndex((line) => line.trim() === '---');
  const header = separator >= 0 ? lines.slice(0, separator) : [];

  const tags = [];
  header.forEach((line, index) => {
    const inline = line.match(/^tags:\s*\[(.*)\]/);
    if (inline) tags.push(...inline[1].split(',').map(unquote).filter(Boolean));
    else if (/^tags:\s*$/.test(line)) {
      for (const item of header.slice(index + 1)) {
        const entry = item.match(/^\s+-\s*(.+)$/);
        if (!entry) break;
        tags.push(unquote(entry[1]));
      }
    }
  });

  const selectors = [];
  const includes = [];
  let textSelectors = 0;
  lines.forEach((line, index) => {
    if (index <= separator) return;
    const id = line.match(/^\s*(?:-\s*)?id:\s*(.+)$/);
    if (id) selectors.push({ file: toRelative(file), line: index + 1, id: unquote(id[1]) });
    const include = line.match(/^\s*(?:-\s*)?(?:runFlow|file):\s*(\S+\.ya?ml)/);
    if (include) includes.push(path.resolve(path.dirname(file), unquote(include[1])));
    if (
      /^\s*(?:-\s*)?(?:tapOn|assertVisible|assertNotVisible|visible|notVisible|text|element):\s*['"]/.test(
        line
      )
    ) {
      textSelectors++;
    }
  });

  const flow = {
    file: toRelative(file),
    name: path.basename(file).replace(/\.ya?ml$/, ''),
    tags,
    selectors,
    includes,
    textSelectors,
  };
  flowCache.set(file, flow);
  return flow;
}

// Selectors of a flow and of every subflow it runs.
function selectorsOf(file, seen = new Set()) {
  if (seen.has(file)) return { selectors: [], textSelectors: 0 };
  seen.add(file);
  const flow = parseFlow(file);
  let { textSelectors } = flow;
  const selectors = [...flow.selectors];
  for (const include of flow.includes) {
    const nested = selectorsOf(include, seen);
    selectors.push(...nested.selectors);
    textSelectors += nested.textSelectors;
  }
  return { selectors, textSelectors };
}

function compileSelector(id) {
  const withVariables = id.replace(/\$\{[^}]*\}/g, '.+');
  let regex;
  try {
    regex = new RegExp(`^(?:${withVariables})$`);
  } catch {
    regex = new RegExp(`^${escapeRegex(id)}$`);
  }
  const sample = id.replace(/\$\{[^}]*\}/g, 'X').replace(/\.[*+]/g, 'X');
  return { regex, sample };
}

// testIDs a selector can select. When the selector is a literal value of a dynamic id
// (`calendar-day-button-2026-10-03`), only the most specific dynamic id counts, so
// `calendar-day-${date}` does not claim it too.
// Returns [testId, value] pairs.
function matchSelector(id, testIds) {
  const { regex, sample } = compileSelector(id);
  const values = testIds.flatMap((testId) => testId.values.map((value) => [testId, value]));
  const direct = values.filter(([, value]) => regex.test(value.sample));
  if (direct.length > 0) return direct;
  const dynamic = values.filter(([, value]) => value.regex.test(sample));
  const best = Math.max(0, ...dynamic.map(([, value]) => value.literalLength));
  return dynamic.filter(([, value]) => value.literalLength === best);
}

// ---------------------------------------------------------------------------------------------
// Routes and grouping

function collectRoutes() {
  return listFiles(APP_DIR, ['.tsx', '.ts'])
    .filter((file) => !EXCLUDED_SOURCES.some((pattern) => pattern.test(toRelative(file))))
    .filter((file) => !/^[_+]/.test(path.basename(file)))
    .map((file) => {
      const segments = path
        .relative(APP_DIR, file)
        .replace(/\.tsx?$/, '')
        .split(path.sep)
        .filter((segment) => !/^\(.*\)$/.test(segment));
      if (segments[segments.length - 1] === 'index') segments.pop();
      const screen =
        readFileSync(file, 'utf8').match(/from\s+['"]@\/screens\/([^/'"]+)/)?.[1] ?? null;
      return { route: `/${segments.join('/')}`, file: toRelative(file), screen };
    })
    .sort((a, b) => a.route.localeCompare(b.route));
}

function groupOf(file) {
  const match = file.match(/^src\/(screens|components)\/([^/]+)\//);
  return match
    ? { kind: match[1], name: match[2] }
    : { kind: 'other', name: file.replace(/^src\//, '') };
}

function summarize(testIds) {
  const groups = new Map();
  for (const testId of testIds) {
    const { kind, name } = groupOf(testId.file);
    const key = `${kind}/${name}`;
    const group = groups.get(key) ?? { kind, name, used: 0, total: 0 };
    group.total++;
    if (testId.flows.size > 0) group.used++;
    groups.set(key, group);
  }
  return [...groups.values()].sort((a, b) => a.name.localeCompare(b.name));
}

// ---------------------------------------------------------------------------------------------
// Report

function percent(used, total) {
  return total === 0 ? '  -' : `${String(Math.round((used / total) * 100)).padStart(3)}%`;
}

function mark(used) {
  return used ? '[x]' : '[ ]';
}

function printTable(title, rows, nameWidth) {
  console.log(`\n${title}`);
  for (const row of rows) {
    console.log(
      `  ${mark(row.used > 0)} ${row.name.padEnd(nameWidth)} ${`${row.used}/${row.total}`.padStart(7)} ${percent(row.used, row.total)}`
    );
  }
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const testIds = collectTestIds();

  const flows = listFiles(FLOWS_DIR, ['.yaml', '.yml'])
    .map(parseFlow)
    .filter((flow) => !options.tags || flow.tags.some((tag) => options.tags.includes(tag)))
    .sort((a, b) => a.name.localeCompare(b.name));

  // One entry per selector line, with the flows that reach it (a subflow line is shared by many flows).
  const selectorUses = new Map();
  let textSelectors = 0;
  for (const flow of flows) {
    const collected = selectorsOf(path.join(ROOT, flow.file));
    textSelectors += collected.textSelectors;
    for (const selector of collected.selectors) {
      const key = `${selector.file}:${selector.line}`;
      const use = selectorUses.get(key) ?? { ...selector, flows: new Set() };
      use.flows.add(flow.name);
      selectorUses.set(key, use);
    }
  }

  const unmatched = [];
  for (const use of selectorUses.values()) {
    if (EXTERNAL_IDS.some((pattern) => pattern.test(use.id))) continue;
    const matches = matchSelector(use.id, testIds);
    if (matches.length === 0) unmatched.push(use);
    for (const [testId, value] of matches) {
      testId.matched.add(value.id);
      for (const flow of use.flows) testId.flows.add(flow);
    }
  }

  const groups = summarize(testIds);
  const screens = groups.filter((group) => group.kind === 'screens');
  const components = groups.filter((group) => group.kind === 'components');
  const reachedScreens = new Set(
    screens.filter((screen) => screen.used > 0).map((screen) => screen.name)
  );
  const routes = collectRoutes().map((route) => {
    const screen = screens.find((group) => group.name === route.screen);
    return {
      ...route,
      used: screen?.used ?? 0,
      total: screen?.total ?? 0,
      reached: reachedScreens.has(route.screen),
    };
  });
  const usedIds = testIds.filter((testId) => testId.flows.size > 0).length;

  console.log('Maestro e2e coverage (static: testIDs in src that the flows select)');
  console.log(
    `Flows: ${flows.length}${options.tags ? ` tagged ${options.tags.join(', ')}` : ''} | id selectors: ${selectorUses.size} | text selectors: ${textSelectors} (not traced to src)`
  );

  const routeWidth = Math.max(...routes.map((route) => route.route.length));
  console.log('\nRoutes (reached when a flow uses any testID of the screen)');
  for (const route of routes) {
    const counts = route.screen
      ? `${route.screen.padEnd(20)} ${`${route.used}/${route.total}`.padStart(7)}`
      : '(no screen found)';
    console.log(`  ${mark(route.reached)} ${route.route.padEnd(routeWidth)}  ${counts}`);
  }

  const width = Math.max(...groups.map((group) => group.name.length));
  printTable('Screens (src/screens)            used/total', screens, width);
  printTable('Components (src/components)      used/total', components, width);
  const others = groups.filter((group) => group.kind === 'other');
  if (others.length > 0) printTable('Other files', others, width);

  if (options.details) {
    console.log('\ntestIDs ([x] used, ~ id prefix comes from a prop no caller sets)');
    let currentFile = null;
    for (const testId of [...testIds].sort(
      (a, b) => a.file.localeCompare(b.file) || a.line - b.line
    )) {
      if (testId.file !== currentFile) {
        currentFile = testId.file;
        console.log(`  ${currentFile}`);
      }
      // For a template, show which of its values the flows selected.
      const matched = [...testId.matched].filter((value) => value !== testId.id).sort();
      const matchedText = matched.length > 0 ? ` = ${matched.join(', ')}` : '';
      const flowsText = testId.flows.size > 0 ? `  <- ${[...testId.flows].sort().join(', ')}` : '';
      console.log(
        `    ${mark(testId.flows.size > 0)}${testId.unresolved ? '~' : ' '}${String(testId.line).padStart(4)}  ${testId.id}${matchedText}${flowsText}`
      );
    }
  }

  if (unmatched.length > 0) {
    console.log(
      '\nSelectors that match no testID in src (renamed or removed ids break these flows):'
    );
    for (const use of unmatched.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line)) {
      console.log(`  ${use.file}:${use.line}  ${use.id}  (${[...use.flows].sort().join(', ')})`);
    }
  }

  console.log(
    `\nTotal: ${usedIds}/${testIds.length} testIDs (${percent(usedIds, testIds.length).trim()})` +
      ` | screens reached ${reachedScreens.size}/${screens.length}` +
      ` | routes reached ${routes.filter((route) => route.reached).length}/${routes.length}` +
      ` | unmatched selectors ${unmatched.length}`
  );
  if (!options.details)
    console.log('Run with --details to list every testID and the flows that use it.');

  if (options.json) {
    const result = {
      flows: flows.map((flow) => ({ name: flow.name, file: flow.file, tags: flow.tags })),
      totals: {
        testIds: testIds.length,
        usedTestIds: usedIds,
        screens: screens.length,
        reachedScreens: reachedScreens.size,
        routes: routes.length,
        reachedRoutes: routes.filter((route) => route.reached).length,
        idSelectors: selectorUses.size,
        textSelectors,
      },
      routes,
      screens,
      components,
      testIds: testIds.map(({ file, line, id, unresolved, matched, flows: used }) => ({
        file,
        line,
        id,
        unresolved,
        matched: [...matched].sort(),
        flows: [...used].sort(),
      })),
      unmatchedSelectors: unmatched.map(({ file, line, id, flows: used }) => ({
        file,
        line,
        id,
        flows: [...used].sort(),
      })),
    };
    writeFileSync(path.resolve(options.json), `${JSON.stringify(result, null, 2)}\n`);
    console.log(`JSON written to ${options.json}`);
  }

  if (options.check && unmatched.length > 0) process.exit(1);
}

main();
