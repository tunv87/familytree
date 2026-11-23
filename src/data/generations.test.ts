import { describe, expect, it } from 'vitest';
import { findRoots, layoutTree } from '../tree/layout';
import { computeGenerations, familyGenerations, topGenerationOf } from './generations';
import { addPersonUpdates, applyUpdates, type People } from './people';
import type { FamilyMeta, Person } from './types';

const P = (name: string, gender: Person['gender'], extra: Partial<Person> = {}): Person => ({
  name,
  gender,
  ...extra,
});
const meta = (extra: Partial<FamilyMeta> = {}): FamilyMeta => ({
  name: 'Họ Nguyễn',
  owner: 'u',
  createdAt: 1,
  ...extra,
});

// Ông An + bà Bình → Cường (+ vợ Em, có bố mẹ riêng: Ông Phúc + bà Gấm) → Giang;
// An còn con với vợ hai Hạnh → Khôi (cùng cha khác mẹ); Lạc là người chưa nối vào ai
const family: People = {
  an: P('An', 'm', { spouses: { binh: true, hanh: true } }),
  binh: P('Bình', 'f', { spouses: { an: true } }),
  hanh: P('Hạnh', 'f', { spouses: { an: true } }),
  cuong: P('Cường', 'm', { fatherId: 'an', motherId: 'binh', spouses: { em: true } }),
  khoi: P('Khôi', 'm', { fatherId: 'an', motherId: 'hanh' }),
  em: P('Em', 'f', { fatherId: 'phuc', motherId: 'gam', spouses: { cuong: true } }),
  phuc: P('Phúc', 'm', { spouses: { gam: true } }),
  gam: P('Gấm', 'f', { spouses: { phuc: true } }),
  giang: P('Giang', 'm', { fatherId: 'cuong', motherId: 'em' }),
  lac: P('Lạc', 'u'),
};

describe('LG-14 generation numbers are computed from the relationships', () => {
  const g = computeGenerations(family);

  it('numbers the main line from the top, spouses share their partner’s number', () => {
    expect(g).toMatchObject({ an: 1, binh: 1, hanh: 1, cuong: 2, khoi: 2, em: 2, giang: 3 });
  });

  it('a daughter-in-law’s own parents sit one generation above her', () => {
    expect(g).toMatchObject({ phuc: 1, gam: 1 });
  });

  it('someone not connected to the tree has no number', () => {
    expect(g.lac).toBeUndefined();
  });

  it('adding a father above the top renumbers everyone by itself', () => {
    const after = applyUpdates(
      family,
      addPersonUpdates(family, 'to', P('Tổ', 'm'), { childId: 'an' }, 1),
    );
    const g2 = computeGenerations(after);
    expect(g2).toMatchObject({ to: 1, an: 2, cuong: 3, giang: 4, em: 3 });
  });

  it('a branch of a bigger clan starts from its own top number', () => {
    const g8 = familyGenerations({ meta: meta({ topGeneration: 8 }), people: family });
    expect(g8).toMatchObject({ an: 8, cuong: 9, giang: 10 });
  });

  it('empty family, loops and self-links do not hang or throw', () => {
    expect(computeGenerations({})).toEqual({});
    const loop: People = {
      a: P('A', 'm', { fatherId: 'b' }),
      b: P('B', 'm', { fatherId: 'a' }),
      c: P('C', 'm', { fatherId: 'c', spouses: { c: true } }),
    };
    expect(() => computeGenerations(loop)).not.toThrow();
  });
});

describe('LG-14 older data with typed-in numbers keeps its numbering', () => {
  it('uses the number typed for the top person', () => {
    const typed = { ...family, an: { ...family.an, generation: 8 } };
    expect(topGenerationOf({ meta: meta(), people: typed })).toBe(8);
  });

  it('still keeps it after an ancestor is added above the old top', () => {
    const typed: People = {
      ...family,
      an: { ...family.an, generation: 8 },
      cuong: { ...family.cuong, generation: 9 },
      giang: { ...family.giang, generation: 10 },
    };
    const after = applyUpdates(
      typed,
      addPersonUpdates(typed, 'to', P('Tổ', 'm'), { childId: 'an' }, 1),
    );
    const g = familyGenerations({ meta: meta(), people: after });
    expect(g).toMatchObject({ to: 7, an: 8, giang: 10 });
  });

  it('a single wrong typed number is outvoted', () => {
    const typed: People = {
      ...family,
      an: { ...family.an, generation: 3 },
      cuong: { ...family.cuong, generation: 4 },
      giang: { ...family.giang, generation: 9 },
    };
    expect(topGenerationOf({ meta: meta(), people: typed })).toBe(3);
  });

  it('the family setting wins over typed numbers', () => {
    const typed = { ...family, an: { ...family.an, generation: 8 } };
    expect(topGenerationOf({ meta: meta({ topGeneration: 2 }), people: typed })).toBe(2);
  });
});

/** Random family: a founding couple, then children, in-laws (some with their own parents). */
function randomFamily(size: number, seed: number): People {
  let s = seed;
  const rnd = () => (s = (s * 1103515245 + 12345) % 2147483648) / 2147483648;
  const people: People = {
    p0: P('Tổ', 'm', { spouses: { p1: true } }),
    p1: P('Bà Tổ', 'f', { spouses: { p0: true } }),
  };
  const blood = ['p0'];
  let n = 2;
  while (n < size) {
    const parent = blood[Math.floor(rnd() * blood.length)];
    const id = `p${n++}`;
    const male = rnd() < 0.5;
    const spouse = Object.keys(people[parent].spouses ?? {})[0];
    people[id] = P(id, male ? 'm' : 'f', {
      fatherId: people[parent].gender === 'm' ? parent : spouse,
      motherId: people[parent].gender === 'm' ? spouse : parent,
    });
    blood.push(id);
    if (rnd() < 0.6 && n < size) {
      const w = `p${n++}`;
      people[w] = P(w, male ? 'f' : 'm', { spouses: { [id]: true } });
      people[id].spouses = { [w]: true };
      if (rnd() < 0.3 && n + 1 < size) {
        // the in-law's own parents are recorded too
        const f = `p${n++}`;
        people[f] = P(f, 'm');
        people[w].fatherId = f;
      }
    }
  }
  return people;
}

describe('LG-14 the number always matches the row on the tree', () => {
  it.each([
    [40, 1],
    [300, 2],
    [1000, 3],
  ])('%i people (seed %i)', (size, seed) => {
    const people = randomFamily(size, seed);
    const top = 5;
    const g = computeGenerations(people, top);
    const root = findRoots(people)[0];
    const rows = layoutTree(people, { rootId: root }).nodes;
    const wrong = rows.filter((node) => g[node.id] !== node.depth + top).map((node) => node.id);
    expect(wrong).toEqual([]);
    // and every blood relative of the top is numbered
    expect(rows.every((node) => g[node.id] !== undefined)).toBe(true);
  });

  it('1,000 people are numbered quickly', () => {
    const people = randomFamily(1000, 9);
    const t0 = performance.now();
    computeGenerations(people);
    expect(performance.now() - t0).toBeLessThan(200);
  });
});
