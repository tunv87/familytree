/**
 * Anh chị em nối thẳng (user, 27/11/2026: "Nối thẳng. Suy luận danh xưng … dựa vào người được
 * nối vào"). Usually brothers and sisters are linked through their parents; when the parents
 * aren't in the family, two people can be linked as siblings directly (`siblings` on both).
 *
 * Everything else (xưng hô, đời, the tree) still works from parents, so here the direct links
 * are turned into parent links on a copy of the family:
 *  - if anyone in a group of linked siblings has parents, the others (who have none) get the
 *    same parents — e.g. after "Thêm cha" for one of them;
 *  - otherwise, with `virtual`, they share a made-up parent (id starting "~sib:") that is never
 *    shown: it only lets xưng hô find that they are brothers and sisters.
 */
import type { People } from './people';
import type { Person } from './types';

const VIRTUAL = '~sib:';
export const isVirtual = (id: string) => id.startsWith(VIRTUAL);

const cache = { true: new WeakMap<People, People>(), false: new WeakMap<People, People>() };

/** Groups of people linked as siblings directly (only groups of 2 or more). */
export function siblingGroups(people: People): string[][] {
  const up: Record<string, string> = {};
  const find = (x: string): string => {
    while (up[x] !== x) {
      up[x] = up[up[x]];
      x = up[x];
    }
    return x;
  };
  for (const [id, p] of Object.entries(people))
    for (const s of Object.keys(p.siblings ?? {}))
      if (s !== id && people[s]) {
        up[id] ??= id;
        up[s] ??= s;
        const a = find(id);
        const b = find(s);
        if (a !== b) up[a < b ? b : a] = a < b ? a : b;
      }
  const groups: Record<string, string[]> = {};
  for (const id of Object.keys(up)) (groups[find(id)] ??= []).push(id);
  return Object.values(groups)
    .filter((g) => g.length > 1)
    .map((g) => g.sort());
}

const hasParents = (people: People, p: Person) =>
  Boolean((p.fatherId && people[p.fatherId]) || (p.motherId && people[p.motherId]));

/** The family with direct sibling links turned into parent links (see the top of the file). */
export function withSiblingLinks(people: People, virtual = true): People {
  const memo = cache[virtual ? 'true' : 'false'];
  const hit = memo.get(people);
  if (hit) return hit;
  const groups = siblingGroups(people);
  if (groups.length === 0) {
    memo.set(people, people);
    return people;
  }
  const out: People = { ...people };
  for (const group of groups) {
    const withParents = group.find((id) => hasParents(people, people[id]));
    let fatherId: string | undefined;
    let motherId: string | undefined;
    if (withParents) {
      fatherId = people[withParents].fatherId;
      motherId = people[withParents].motherId;
    } else if (virtual) {
      fatherId = VIRTUAL + group[0];
      out[fatherId] = { name: '', gender: 'u' };
    } else continue;
    for (const id of group)
      if (!hasParents(people, people[id])) {
        const copy: Person = { ...people[id] };
        if (fatherId) copy.fatherId = fatherId;
        if (motherId) copy.motherId = motherId;
        out[id] = copy;
      }
  }
  memo.set(people, out);
  return out;
}
