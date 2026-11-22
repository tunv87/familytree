/**
 * Pure helpers over a family's people map: relationships, sorting, search, and the
 * multi-path updates that keep links consistent (both sides of a marriage, a deleted
 * person removed from parents/children/spouses).
 */
import type { Person } from './types';

export type People = Record<string, Person>;

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

/** Ids whose name contains the query (diacritics optional). */
export function searchPeople(people: People, query: string): string[] {
  const q = normalize(query);
  if (!q) return [];
  return Object.keys(people)
    .filter((id) => normalize(people[id].name).includes(q))
    .sort((a, b) => (people[a].generation ?? 99) - (people[b].generation ?? 99));
}

/** People grouped by generation (unknown generation last). */
export function byGeneration(people: People): [number | null, string[]][] {
  const groups = new Map<number | null, string[]>();
  for (const id of Object.keys(people)) {
    const g = people[id].generation ?? null;
    groups.set(g, [...(groups.get(g) ?? []), id]);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => (a ?? 999) - (b ?? 999))
    .map(([g, ids]) => [g, ids.sort((a, b) => people[a].name.localeCompare(people[b].name, 'vi'))]);
}

/** Suggested generation for a new person from their relatives. */
export function suggestGeneration(
  people: People,
  rel: { parentId?: string; childId?: string; spouseId?: string },
): number | undefined {
  const g = (id?: string) => (id ? people[id]?.generation : undefined);
  if (g(rel.parentId)) return g(rel.parentId)! + 1;
  if (g(rel.spouseId)) return g(rel.spouseId);
  if (g(rel.childId) && g(rel.childId)! > 1) return g(rel.childId)! - 1;
  return undefined;
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
    updatedAt: now,
  });
  return { [`people/${id}`]: p };
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
