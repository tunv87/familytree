/**
 * Makes family data safe to display, whatever is stored (B-02).
 *
 * The rules only let well-formed data in, but data can still be odd: written by an older
 * version, edited by hand in the Firebase console, a damaged copy in local storage, or links
 * left pointing at someone who was deleted on another phone. Screens assume clean data, so
 * everything goes through here first: bad entries are dropped or repaired, never crash.
 */
import type { People } from './people';
import type { Family, FamilyDate, Gender, Person } from './types';

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const int = (v: unknown, min: number, max: number): number | undefined =>
  typeof v === 'number' && Number.isInteger(v) && v >= min && v <= max ? v : undefined;

export const NO_NAME = 'Chưa có tên';

export function sanitizeDate(v: unknown): FamilyDate | undefined {
  if (!isObj(v)) return undefined;
  const cal = v.cal === 'l' ? 'l' : 's';
  const d: FamilyDate = { cal };
  const day = int(v.d, 1, cal === 'l' ? 30 : 31);
  const month = int(v.m, 1, 12);
  const year = int(v.y, 1, 3000);
  if (month !== undefined) d.m = month;
  if (day !== undefined && month !== undefined) d.d = day;
  if (year !== undefined) d.y = year;
  if (cal === 'l' && v.leap === true) d.leap = true;
  return d.d || d.m || d.y ? d : undefined;
}

function sanitizePerson(v: Record<string, unknown>): Person {
  const name = typeof v.name === 'string' && v.name.trim() ? v.name.slice(0, 100) : NO_NAME;
  const gender: Gender = v.gender === 'm' || v.gender === 'f' ? v.gender : 'u';
  const p: Person = { name, gender };
  const generation = int(v.generation, 1, 60);
  if (generation !== undefined) p.generation = generation;
  const order = int(v.order, 0, 99);
  if (order !== undefined) p.order = order;
  if (v.deceased === true) p.deceased = true;
  const birth = sanitizeDate(v.birth);
  if (birth) p.birth = birth;
  const death = sanitizeDate(v.death);
  if (death) p.death = death;
  if (typeof v.note === 'string' && v.note) p.note = v.note.slice(0, 2000);
  if (typeof v.fatherId === 'string') p.fatherId = v.fatherId;
  if (typeof v.motherId === 'string') p.motherId = v.motherId;
  if (isObj(v.spouses)) {
    const s = Object.keys(v.spouses).filter((k) => (v.spouses as Record<string, unknown>)[k]);
    if (s.length) p.spouses = Object.fromEntries(s.map((k) => [k, true as const]));
  }
  if (typeof v.updatedAt === 'number') p.updatedAt = v.updatedAt;
  return p;
}

/** Repairs links: drops ones to missing people, to oneself, and parent loops. */
function repairLinks(people: People): People {
  for (const [id, p] of Object.entries(people)) {
    for (const key of ['fatherId', 'motherId'] as const) {
      const par = p[key];
      if (par && (par === id || !people[par])) delete p[key];
    }
    if (p.spouses) {
      for (const s of Object.keys(p.spouses)) if (s === id || !people[s]) delete p.spouses[s];
      if (Object.keys(p.spouses).length === 0) delete p.spouses;
    }
  }
  // parent loops (A is B's father and B is A's father): cut the link that closes the loop
  const isAncestor = (start: string, target: string): boolean => {
    const seen = new Set<string>();
    const stack = [start];
    while (stack.length) {
      const x = stack.pop()!;
      if (x === target) return true;
      if (seen.has(x)) continue;
      seen.add(x);
      const q = people[x];
      if (q?.fatherId) stack.push(q.fatherId);
      if (q?.motherId) stack.push(q.motherId);
    }
    return false;
  };
  for (const [id, p] of Object.entries(people))
    for (const key of ['fatherId', 'motherId'] as const) {
      const par = p[key];
      if (par && isAncestor(par, id)) delete p[key];
    }
  return people;
}

/** Clean copy of a family, or null if there's nothing usable at all. */
export function sanitizeFamily(raw: unknown): Family | null {
  if (!isObj(raw)) return null;
  const m = isObj(raw.meta) ? raw.meta : {};
  const meta = {
    name: typeof m.name === 'string' && m.name.trim() ? m.name.slice(0, 80) : 'Gia phả',
    owner: typeof m.owner === 'string' ? m.owner : '',
    createdAt: typeof m.createdAt === 'number' ? m.createdAt : 0,
  } as Family['meta'];
  const top = int(m.topGeneration, 1, 60);
  if (top !== undefined) meta.topGeneration = top;
  const admins: Record<string, true> = {};
  if (isObj(raw.admins))
    for (const [k, v] of Object.entries(raw.admins)) if (v === true) admins[k] = true;
  const people: People = {};
  // the database turns objects with numeric keys into arrays, so accept both
  const src = isObj(raw.people) || Array.isArray(raw.people) ? Object.entries(raw.people) : [];
  for (const [id, v] of src) if (isObj(v) && id) people[id] = sanitizePerson(v);
  return { meta, admins, people: repairLinks(people) };
}
