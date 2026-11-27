/**
 * Pure helpers over a family's people map: relationships, sorting, search, and the
 * multi-path updates that keep links consistent (both sides of a marriage, a deleted
 * person removed from parents/children/spouses).
 */
import type { Person } from './types';

export type People = Record<string, Person>;

/**
 * Spouses and children of everyone, built in one pass. The helpers below scan the whole family
 * on each call, which is fine for one person but O(n²) for whole-family work (tree roots,
 * generation numbers) on a 1,000-person family.
 */
export interface LinkIndex {
  spouses: Record<string, string[]>;
  children: Record<string, string[]>;
}

export function linkIndex(people: People): LinkIndex {
  const spouses: Record<string, Set<string>> = {};
  const children: Record<string, string[]> = {};
  for (const [id, p] of Object.entries(people)) {
    for (const s of Object.keys(p.spouses ?? {}))
      if (s !== id && people[s]) {
        (spouses[id] ??= new Set()).add(s);
        (spouses[s] ??= new Set()).add(id); // tolerate one-sided links
      }
    for (const par of new Set([p.fatherId, p.motherId]))
      if (par && par !== id && people[par]) (children[par] ??= []).push(id);
  }
  const out: LinkIndex = { spouses: {}, children };
  for (const [id, set] of Object.entries(spouses)) out.spouses[id] = [...set];
  return out;
}

export function spousesOf(people: People, id: string): string[] {
  const p = people[id];
  if (!p) return [];
  const ids = new Set(Object.keys(p.spouses ?? {}));
  // tolerate one-sided links
  for (const [oid, o] of Object.entries(people)) if (o.spouses?.[id]) ids.add(oid);
  ids.delete(id);
  return [...ids].filter((s) => people[s]);
}

export function childrenOf(people: People, id: string): string[] {
  return sortSiblings(
    people,
    Object.keys(people).filter((c) => people[c].fatherId === id || people[c].motherId === id),
  );
}

export function parentsOf(people: People, id: string): string[] {
  const p = people[id];
  if (!p) return [];
  return [p.fatherId, p.motherId].filter((x): x is string => Boolean(x && people[x]));
}

export function siblingsOf(people: People, id: string): string[] {
  const p = people[id];
  if (!p) return [];
  const parents = parentsOf(people, id);
  if (parents.length === 0) return [];
  return sortSiblings(
    people,
    Object.keys(people).filter(
      (s) =>
        s !== id && parents.some((par) => people[s].fatherId === par || people[s].motherId === par),
    ),
  );
}

/** Birth order: explicit order first, then birth year, then name. */
export function sortSiblings(people: People, ids: string[]): string[] {
  return [...ids].sort((a, b) => {
    const pa = people[a];
    const pb = people[b];
    const oa = pa.order ?? 999;
    const ob = pb.order ?? 999;
    if (oa !== ob) return oa - ob;
    const ya = pa.birth?.y ?? 9999;
    const yb = pb.birth?.y ?? 9999;
    if (ya !== yb) return ya - yb;
    return pa.name.localeCompare(pb.name, 'vi');
  });
}

/** Lowercase, no diacritics, đ→d: "Nguyễn Văn Đức" → "nguyen van duc". */
export function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

/** Ids whose name — or nơi ở — contains the query (diacritics optional). */
export function searchPeople(
  people: People,
  query: string,
  gens: Record<string, number> = {},
): string[] {
  const q = normalize(query);
  if (!q) return [];
  return Object.keys(people)
    .filter(
      (id) =>
        normalize(people[id].name).includes(q) || normalize(people[id].place ?? '').includes(q),
    )
    .sort((a, b) => (gens[a] ?? 999) - (gens[b] ?? 999));
}

/** People grouped by (computed) generation; those not connected to the tree last. */
export function byGeneration(
  people: People,
  gens: Record<string, number>,
): [number | null, string[]][] {
  const groups = new Map<number | null, string[]>();
  for (const id of Object.keys(people)) {
    const g = gens[id] ?? null;
    groups.set(g, [...(groups.get(g) ?? []), id]);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => (a ?? 999) - (b ?? 999))
    .map(([g, ids]) => [g, ids.sort((a, b) => people[a].name.localeCompare(people[b].name, 'vi'))]);
}

export type Updates = Record<string, unknown>;

/** Strips undefined values (RTDB rejects them). */
function clean<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

export interface NewPersonLinks {
  /** child of these parents */
  fatherId?: string;
  motherId?: string;
  /** spouse of this person */
  spouseId?: string;
  /** this new person is the father/mother of this child */
  childId?: string;
}

/**
 * Updates (relative to the family root) that add a new person and wire up the links.
 * When adding a parent to a child that already has the other parent, the two parents
 * are married to each other.
 */
export function addPersonUpdates(
  people: People,
  id: string,
  person: Person,
  links: NewPersonLinks,
  now: number,
): Updates {
  const p: Person = clean({ ...person, updatedAt: now });
  if (links.fatherId) p.fatherId = links.fatherId;
  if (links.motherId) p.motherId = links.motherId;
  const u: Updates = {};
  const marry = (a: string, b: string) => {
    p.spouses = { ...(p.spouses ?? {}), [b]: true };
    u[`people/${b}/spouses/${a}`] = true;
  };
  if (links.spouseId && people[links.spouseId]) marry(id, links.spouseId);
  if (links.childId && people[links.childId]) {
    const child = people[links.childId];
    const asFather = person.gender !== 'f' && !child.fatherId;
    const field = asFather ? 'fatherId' : 'motherId';
    u[`people/${links.childId}/${field}`] = id;
    const other = asFather ? child.motherId : child.fatherId;
    if (other && people[other]) marry(id, other);
  }
  u[`people/${id}`] = p;
  return u;
}

/**
 * "Thêm anh/chị/em": where a new brother or sister of `of` goes in the birth order, so that
 * seniority (vai) is right straight away. The siblings that already have an order, and `of`,
 * are renumbered 1…n with the new one just before `of` (older) or just after (younger);
 * siblings with no order stay as they are. Returns the new one's order and the updates.
 */
export function siblingOrder(
  people: People,
  of: string,
  older: boolean,
): { order: number; updates: Updates } {
  const ordered = sortSiblings(
    people,
    siblingsOf(people, of).filter((s) => people[s].order),
  );
  // where `of` stands: by their order if they have one, otherwise after the ordered ones
  const ofOrder = people[of]?.order;
  let at = ofOrder ? ordered.findIndex((s) => (people[s].order ?? 0) > ofOrder) : -1;
  if (at < 0) at = ordered.length;
  const line = [...ordered.slice(0, at), of, ...ordered.slice(at)];
  const i = line.indexOf(of);
  const NEW = '\u0000new';
  line.splice(older ? i : i + 1, 0, NEW);
  const updates: Updates = {};
  let order = 0;
  line.forEach((id, n) => {
    if (id === NEW) order = n + 1;
    else if (people[id].order !== n + 1) updates[`people/${id}/order`] = n + 1;
  });
  return { order, updates };
}

/** Updates that save edits to an existing person, keeping their links. */
export function editPersonUpdates(
  people: People,
  id: string,
  person: Person,
  now: number,
): Updates {
  const old = people[id];
  const p: Person = clean({
    ...person,
    fatherId: old?.fatherId,
    motherId: old?.motherId,
    spouses: old?.spouses,
    // older data: keep the typed-in "đời thứ" (only used to keep the family's numbering)
    generation: old?.generation,
    updatedAt: now,
  });
  return { [`people/${id}`]: p };
}

/**
 * The updates that put back what `updates` is about to change (for "Hoàn tác"): for each path,
 * the value it has now in `people`, or null where there was nothing.
 */
export function inverseUpdates(people: People, updates: Updates): Updates {
  const out: Updates = {};
  for (const path of Object.keys(updates)) {
    const [root, ...keys] = path.split('/');
    let v: unknown = root === 'people' ? people : undefined;
    for (const k of keys)
      v = v && typeof v === 'object' ? (v as Record<string, unknown>)[k] : undefined;
    out[path] = v === undefined ? null : clean(v);
  }
  return out;
}

/** Updates that delete a person and every link pointing at them. */
export function deletePersonUpdates(people: People, id: string): Updates {
  const u: Updates = { [`people/${id}`]: null };
  for (const [oid, o] of Object.entries(people)) {
    if (oid === id) continue;
    if (o.fatherId === id) u[`people/${oid}/fatherId`] = null;
    if (o.motherId === id) u[`people/${oid}/motherId`] = null;
    if (o.spouses?.[id]) u[`people/${oid}/spouses/${id}`] = null;
  }
  return u;
}

/** Updates that link two existing people as spouses. */
export function marryUpdates(a: string, b: string): Updates {
  return { [`people/${a}/spouses/${b}`]: true, [`people/${b}/spouses/${a}`]: true };
}

export function unmarryUpdates(a: string, b: string): Updates {
  return { [`people/${a}/spouses/${b}`]: null, [`people/${b}/spouses/${a}`]: null };
}

export interface Relations {
  fatherId?: string;
  motherId?: string;
  spouses: string[];
}

/** Ids that can't be someone's parent without creating a loop: the person and their descendants. */
export function descendantsAndSelf(people: People, id: string): Set<string> {
  const out = new Set<string>();
  const walk = (x: string) => {
    if (out.has(x)) return;
    out.add(x);
    for (const c of Object.keys(people))
      if (people[c].fatherId === x || people[c].motherId === x) walk(c);
  };
  walk(id);
  return out;
}

/** Updates that change a person's parents and spouses (both sides of each marriage). */
export function relinkUpdates(people: People, id: string, rel: Relations): Updates {
  const p = people[id];
  const u: Updates = {};
  if ((rel.fatherId ?? null) !== (p.fatherId ?? null))
    u[`people/${id}/fatherId`] = rel.fatherId || null;
  if ((rel.motherId ?? null) !== (p.motherId ?? null))
    u[`people/${id}/motherId`] = rel.motherId || null;
  const before = new Set(spousesOf(people, id));
  const after = new Set(rel.spouses.filter((s) => s !== id && people[s]));
  for (const s of after) if (!before.has(s)) Object.assign(u, marryUpdates(id, s));
  for (const s of before) if (!after.has(s)) Object.assign(u, unmarryUpdates(id, s));
  return u;
}

/** "1920 – 1995", "s. 1985", "" */
export function lifespan(p: Person): string {
  const b = p.birth?.y;
  const d = p.death?.y;
  if (b && d) return `${b} – ${d}`;
  if (b) return p.deceased ? `${b} – ?` : `s. ${b}`;
  if (d) return `? – ${d}`;
  return '';
}

/** Applies updates to a local copy — mirrors what RTDB does, used by tests and optimistic UI. */
export function applyUpdates(people: People, updates: Updates): People {
  const root: Record<string, unknown> = { people: structuredClone(people) };
  for (const [path, value] of Object.entries(updates)) {
    const keys = path.split('/');
    let node = root as Record<string, unknown>;
    for (const k of keys.slice(0, -1)) {
      if (typeof node[k] !== 'object' || node[k] === null) node[k] = {};
      node = node[k] as Record<string, unknown>;
    }
    const last = keys[keys.length - 1];
    if (value === null) delete node[last];
    else node[last] = structuredClone(value);
  }
  return root.people as People;
}
