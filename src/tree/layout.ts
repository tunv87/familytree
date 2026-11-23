/**
 * Family-tree layout ("tidy tree" by generation), shared by the on-screen SVG and the PDF.
 *
 * Each row is a generation. A blood-line person is drawn with the spouses who married
 * into the family beside them (a "unit"); the unit's children hang below, in birth
 * order. Every person is drawn once, even when two relatives married each other.
 */
import { childrenOf, spousesOf, type People } from '../data/people';
import type { Person } from '../data/types';

export const CARD_W = 150;
export const CARD_H = 66;
export const SPOUSE_GAP = 14;
export const SIBLING_GAP = 22;
export const ROW_GAP = 64;
export const MARGIN = 24;

export interface TreeNode {
  id: string;
  x: number;
  y: number;
  /** married into the family (drawn beside their spouse) */
  inLaw: boolean;
  /** has children (shown or collapsed) */
  hasChildren: boolean;
  collapsed: boolean;
  depth: number;
}

export interface TreeLayout {
  nodes: TreeNode[];
  /** polylines, each a list of [x, y] points */
  lines: [number, number][][];
  /** marriage links between spouses in the same row */
  marriages: [number, number, number, number][];
  width: number;
  height: number;
}

interface Unit {
  main: string;
  spouses: string[];
  children: Unit[];
  hasChildren: boolean;
  collapsed: boolean;
  /** computed */
  width: number;
}

/** People drawn as roots: no parents recorded and not married into a blood line. */
export function findRoots(people: People): string[] {
  const hasParent = (id: string) => {
    const p = people[id];
    return Boolean((p.fatherId && people[p.fatherId]) || (p.motherId && people[p.motherId]));
  };
  const isInLaw = (id: string) => !hasParent(id) && spousesOf(people, id).some(hasParent);
  const roots = Object.keys(people).filter((id) => !hasParent(id) && !isInLaw(id));
  // a founding couple has two parentless spouses: keep one (the husband) as the root
  const chosen: string[] = [];
  const taken = new Set<string>();
  for (const id of sortRoots(people, roots)) {
    if (taken.has(id)) continue;
    chosen.push(id);
    taken.add(id);
    for (const s of spousesOf(people, id)) taken.add(s);
  }
  return chosen;
}

function sortRoots(people: People, ids: string[]): string[] {
  const size = (id: string) => countDescendants(people, id);
  return [...ids].sort((a, b) => {
    const ga = people[a].generation ?? 99;
    const gb = people[b].generation ?? 99;
    if (ga !== gb) return ga - gb;
    const sa = size(a);
    const sb = size(b);
    if (sa !== sb) return sb - sa;
    // husband before wife for founding couples
    const ma = people[a].gender === 'm' ? 0 : 1;
    const mb = people[b].gender === 'm' ? 0 : 1;
    if (ma !== mb) return ma - mb;
    return a.localeCompare(b);
  });
}

export function countDescendants(people: People, id: string, seen = new Set<string>()): number {
  if (seen.has(id)) return 0;
  seen.add(id);
  let n = 0;
  const kids = new Set([id, ...spousesOf(people, id)].flatMap((x) => childrenOf(people, x)));
  for (const c of kids) if (!seen.has(c)) n += 1 + countDescendants(people, c, seen);
  return n;
}

function hasParents(people: People, id: string): boolean {
  const p = people[id];
  return Boolean((p.fatherId && people[p.fatherId]) || (p.motherId && people[p.motherId]));
}

function buildUnit(
  people: People,
  id: string,
  placed: Set<string>,
  collapsed: ReadonlySet<string>,
): Unit {
  placed.add(id);
  // spouses not already drawn elsewhere (a spouse who is also a blood relative stays in their own place)
  const spouses = spousesOf(people, id).filter((s) => {
    const sp = people[s];
    const hasOwnParents = Boolean(
      (sp.fatherId && people[sp.fatherId]) || (sp.motherId && people[sp.motherId]),
    );
    return !placed.has(s) && !hasOwnParents;
  });
  spouses.forEach((s) => placed.add(s));
  // children of this person and of the spouses drawn with them, grouped by spouse order
  const kidIds: string[] = [];
  for (const parent of [id, ...spouses]) {
    for (const c of childrenOf(people, parent)) if (!kidIds.includes(c)) kidIds.push(c);
  }
  const order = (c: string) => {
    const p = people[c];
    const other = p.fatherId === id ? p.motherId : p.fatherId;
    const i = other ? spouses.indexOf(other) : -1;
    return i < 0 ? spouses.length : i;
  };
  const sorted = kidIds
    .map((c, i) => ({ c, i }))
    .sort((a, b) => order(a.c) - order(b.c) || a.i - b.i)
    .map((x) => x.c);
  const isCollapsed = collapsed.has(id);
  const children: Unit[] = [];
  if (isCollapsed) {
    // hidden, but counted as placed so they don't pop up elsewhere as roots
    const hide = (x: string) => {
      if (placed.has(x)) return;
      placed.add(x);
      for (const s of spousesOf(people, x)) if (!hasParents(people, s)) placed.add(s);
      for (const parent of [x, ...spousesOf(people, x)]) childrenOf(people, parent).forEach(hide);
    };
    sorted.forEach(hide);
  } else {
    for (const c of sorted)
      if (!placed.has(c)) children.push(buildUnit(people, c, placed, collapsed));
  }
  return {
    main: id,
    spouses,
    children,
    hasChildren: sorted.length > 0,
    collapsed: isCollapsed && sorted.length > 0,
    width: 0,
  };
}

function unitCardsWidth(u: Unit): number {
  const n = 1 + u.spouses.length;
  return n * CARD_W + (n - 1) * SPOUSE_GAP;
}

function measure(u: Unit): number {
  const kids = u.children.map(measure);
  const kidsWidth = kids.length
    ? kids.reduce((a, b) => a + b, 0) + SIBLING_GAP * (kids.length - 1)
    : 0;
  u.width = Math.max(unitCardsWidth(u), kidsWidth);
  return u.width;
}

export function layoutTree(
  people: People,
  opts: { collapsed?: ReadonlySet<string>; rootId?: string } = {},
): TreeLayout {
  const collapsed = opts.collapsed ?? new Set<string>();
  const placed = new Set<string>();
  const roots = opts.rootId && people[opts.rootId] ? [opts.rootId] : findRoots(people);
  const units: Unit[] = [];
  for (const r of roots) if (!placed.has(r)) units.push(buildUnit(people, r, placed, collapsed));
  if (!opts.rootId) {
    // anyone still unplaced (e.g. a loop in the data) becomes a root of their own
    for (const id of Object.keys(people))
      if (!placed.has(id)) units.push(buildUnit(people, id, placed, collapsed));
  }

  const nodes: TreeNode[] = [];
  const lines: [number, number][][] = [];
  const marriages: [number, number, number, number][] = [];
  let maxDepth = 0;

  const place = (u: Unit, left: number, depth: number) => {
    maxDepth = Math.max(maxDepth, depth);
    const y = MARGIN + depth * (CARD_H + ROW_GAP);
    const cards = unitCardsWidth(u);
    const startX = left + (u.width - cards) / 2;
    const ids = [u.main, ...u.spouses];
    ids.forEach((id, i) => {
      const x = startX + i * (CARD_W + SPOUSE_GAP);
      nodes.push({
        id,
        x,
        y,
        inLaw: i > 0,
        hasChildren: i === 0 && u.hasChildren,
        collapsed: i === 0 && u.collapsed,
        depth,
      });
      if (i > 0) marriages.push([x - SPOUSE_GAP, y + CARD_H / 2, x, y + CARD_H / 2]);
    });
    if (u.children.length === 0) return;
    // children first, so we know where their tops are
    let cx =
      left +
      (u.width -
        (u.children.reduce((a, c) => a + c.width, 0) + SIBLING_GAP * (u.children.length - 1))) /
        2;
    const tops: number[] = [];
    for (const c of u.children) {
      place(c, cx, depth + 1);
      const childCards = unitCardsWidth(c);
      tops.push(cx + (c.width - childCards) / 2 + CARD_W / 2);
      cx += c.width + SIBLING_GAP;
    }
    // connector: from under the couple down to a bar, then down to each child
    const fromX = u.spouses.length ? startX + CARD_W + SPOUSE_GAP / 2 : startX + CARD_W / 2;
    const fromY = u.spouses.length ? y + CARD_H / 2 : y + CARD_H;
    const barY = y + CARD_H + ROW_GAP / 2;
    const childY = barY + ROW_GAP / 2;
    lines.push([
      [fromX, fromY],
      [fromX, barY],
    ]);
    const minX = Math.min(fromX, ...tops);
    const maxX = Math.max(fromX, ...tops);
    if (maxX > minX)
      lines.push([
        [minX, barY],
        [maxX, barY],
      ]);
    for (const tx of tops)
      lines.push([
        [tx, barY],
        [tx, childY],
      ]);
  };

  let left = MARGIN;
  for (const u of units) {
    measure(u);
    place(u, left, 0);
    left += u.width + SIBLING_GAP * 2;
  }
  return {
    nodes,
    lines,
    marriages,
    width: Math.max(left - SIBLING_GAP * 2 + MARGIN, 2 * MARGIN + CARD_W),
    height: MARGIN * 2 + (maxDepth + 1) * CARD_H + maxDepth * ROW_GAP,
  };
}

/** Splits a name into at most `maxLines` lines of about `perLine` characters. */
export function wrapName(name: string, perLine = 17, maxLines = 2): string[] {
  // a "word" longer than a line (name typed without spaces) is cut into line-sized pieces
  const words = name
    .trim()
    .split(/\s+/)
    .flatMap((w) =>
      [...w].length <= perLine ? [w] : (w.match(new RegExp(`.{1,${perLine}}`, 'gu')) ?? [w]),
    );
  const out: string[] = [];
  let line = '';
  for (const w of words) {
    if (!line) line = w;
    else if ((line + ' ' + w).length <= perLine) line += ' ' + w;
    else {
      out.push(line);
      line = w;
    }
  }
  if (line) out.push(line);
  if (out.length <= maxLines) return out;
  const kept = out.slice(0, maxLines);
  kept[maxLines - 1] = `${kept[maxLines - 1]}…`;
  return kept;
}

/** Card colour key for a person. */
export function cardKind(p: Person): 'm' | 'f' | 'u' {
  return p.gender;
}
