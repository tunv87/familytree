/**
 * "Đời thứ" (generation number) is worked out from the relationships instead of being typed
 * in for every person: the top of the main line is generation `top` (1 unless the family says
 * otherwise, e.g. a branch whose oldest known ancestor is the 8th generation of the clan),
 * children are one more, spouses share their partner's generation.
 *
 * Adding an ancestor above the current top simply moves the top, so every number shifts by
 * itself. People not connected to the main line get no number ("chưa nối vào cây").
 */
import { findRoots } from '../tree/layout';
import { linkIndex, type People } from './people';
import { siblingGroups } from './siblings';
import type { Family } from './types';

export type Generations = Record<string, number>;

/** Breadth-first from the main root. Down and sideways first, so the main line wins over
 *  in-laws' own parents when relatives married across generations. */
export function computeGenerations(people: People, top = 1): Generations {
  const gens: Generations = {};
  const index = linkIndex(people);
  const root = findRoots(people, index)[0];
  if (!root) return gens;
  const parents = (id: string) =>
    [people[id].fatherId, people[id].motherId].filter((x): x is string =>
      Boolean(x && people[x] && x !== id),
    );
  gens[root] = top;
  let queue = [root];
  let later: [string, number][] = []; // parents of people already placed (in-laws' families)
  while (queue.length || later.length) {
    if (!queue.length) {
      // only climb to someone's parents when the main line is exhausted
      const next: string[] = [];
      for (const [id, g] of later)
        if (gens[id] === undefined) {
          gens[id] = g;
          next.push(id);
        }
      later = [];
      queue = next;
      continue;
    }
    const next: string[] = [];
    for (const id of queue) {
      const g = gens[id];
      for (const s of index.spouses[id] ?? [])
        if (gens[s] === undefined) {
          gens[s] = g;
          next.push(s);
        }
      for (const c of index.children[id] ?? [])
        if (gens[c] === undefined) {
          gens[c] = g + 1;
          next.push(c);
        }
      for (const p of parents(id)) if (gens[p] === undefined) later.push([p, g - 1]);
    }
    queue = next;
  }
  // brothers and sisters linked directly share a generation, and so do their own families
  let more = true;
  while (more) {
    more = false;
    for (const group of siblingGroups(people)) {
      const known = group.find((id) => gens[id] !== undefined);
      if (!known) continue;
      let wave = group.filter((id) => gens[id] === undefined);
      if (wave.length) more = true;
      for (const id of wave) gens[id] = gens[known];
      while (wave.length) {
        const next: string[] = [];
        for (const id of wave) {
          for (const s of index.spouses[id] ?? [])
            if (gens[s] === undefined) {
              gens[s] = gens[id];
              next.push(s);
            }
          for (const c of index.children[id] ?? [])
            if (gens[c] === undefined) {
              gens[c] = gens[id] + 1;
              next.push(c);
            }
        }
        wave = next;
      }
    }
  }
  // an in-law's own family can reach above generation 1: leave those people unnumbered
  for (const id of Object.keys(gens)) if (gens[id] < 1) delete gens[id];
  return gens;
}

/**
 * Number of the top of the main line: the family setting; else, for older data where "đời thứ"
 * was typed in, the numbering those people used (the most common offset between the typed and
 * the computed numbers, so an ancestor added above the old top doesn't renumber everyone);
 * else 1.
 */
export function topGenerationOf(family: Pick<Family, 'meta' | 'people'>): number {
  if (family.meta.topGeneration) return family.meta.topGeneration;
  const people = family.people ?? {};
  const rel = computeGenerations(people, 1);
  const votes = new Map<number, number>();
  for (const [id, g] of Object.entries(rel)) {
    const typed = people[id].generation;
    if (typed) votes.set(typed - g, (votes.get(typed - g) ?? 0) + 1);
  }
  let best = 0;
  let bestVotes = 0;
  for (const [offset, n] of votes)
    if (n > bestVotes || (n === bestVotes && offset < best)) [best, bestVotes] = [offset, n];
  return Math.min(60, Math.max(1, 1 + best));
}

export function familyGenerations(family: Pick<Family, 'meta' | 'people'> | null): Generations {
  if (!family) return {};
  return computeGenerations(family.people ?? {}, topGenerationOf(family));
}
