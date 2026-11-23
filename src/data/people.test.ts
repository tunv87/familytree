import { describe, expect, it } from 'vitest';
import {
  addPersonUpdates,
  applyUpdates,
  byGeneration,
  childrenOf,
  deletePersonUpdates,
  editPersonUpdates,
  descendantsAndSelf,
  lifespan,
  relinkUpdates,
  normalize,
  parentsOf,
  searchPeople,
  siblingsOf,
  spousesOf,
  suggestGeneration,
  type People,
} from './people';
import type { Person } from './types';

const P = (name: string, gender: Person['gender'], extra: Partial<Person> = {}): Person => ({
  name,
  gender,
  ...extra,
});

// Ông An + bà Bình → Cường (con trưởng), Dung; Cường + Em → Giang
const base: People = {
  an: P('Nguyễn Văn An', 'm', { generation: 1, spouses: { binh: true } }),
  binh: P('Trần Thị Bình', 'f', { generation: 1, spouses: { an: true } }),
  dung: P('Nguyễn Thị Dung', 'f', { generation: 2, fatherId: 'an', motherId: 'binh', order: 2 }),
  cuong: P('Nguyễn Văn Cường', 'm', {
    generation: 2,
    fatherId: 'an',
    motherId: 'binh',
    order: 1,
    spouses: { em: true },
  }),
  em: P('Lê Thị Em', 'f', { generation: 2, spouses: { cuong: true } }),
  giang: P('Nguyễn Văn Giang', 'm', { generation: 3, fatherId: 'cuong', motherId: 'em' }),
};

describe('LG-04 LG-09 relationships', () => {
  it('children in birth order', () => {
    expect(childrenOf(base, 'an')).toEqual(['cuong', 'dung']);
    expect(childrenOf(base, 'binh')).toEqual(['cuong', 'dung']);
  });
  it('parents, spouses, siblings', () => {
    expect(parentsOf(base, 'giang')).toEqual(['cuong', 'em']);
    expect(spousesOf(base, 'cuong')).toEqual(['em']);
    expect(siblingsOf(base, 'dung')).toEqual(['cuong']);
    expect(siblingsOf(base, 'an')).toEqual([]);
  });
  it('tolerates one-sided spouse links', () => {
    const p = { ...base, em: P('Lê Thị Em', 'f') };
    expect(spousesOf(p, 'em')).toEqual(['cuong']);
  });
});

describe('LG-08 search', () => {
  it('ignores diacritics and case', () => {
    expect(normalize('Nguyễn Văn Đức')).toBe('nguyen van duc');
    expect(searchPeople(base, 'cuong')).toEqual(['cuong']);
    expect(searchPeople(base, 'NGUYỄN').length).toBe(4);
    expect(searchPeople(base, '  ')).toEqual([]);
  });
  it('groups by generation', () => {
    expect(byGeneration(base).map(([g, ids]) => [g, ids.length])).toEqual([
      [1, 2],
      [2, 3],
      [3, 1],
    ]);
  });
});

describe('LG-04 LG-08 adding people', () => {
  it('adds a child with both parents', () => {
    const u = addPersonUpdates(
      base,
      'hoa',
      P('Hoa', 'f'),
      { fatherId: 'cuong', motherId: 'em' },
      1,
    );
    const after = applyUpdates(base, u);
    expect(childrenOf(after, 'cuong')).toContain('hoa');
    expect(after.hoa.updatedAt).toBe(1);
  });

  it('adds a spouse on both sides', () => {
    const u = addPersonUpdates(base, 'khanh', P('Khánh', 'm'), { spouseId: 'dung' }, 1);
    const after = applyUpdates(base, u);
    expect(spousesOf(after, 'dung')).toEqual(['khanh']);
    expect(after.khanh.spouses).toEqual({ dung: true });
    expect(after.dung.spouses).toEqual({ khanh: true });
  });

  it('adds a father to a child and marries him to the existing mother', () => {
    const people: People = { con: P('Con', 'm', { motherId: 'me' }), me: P('Mẹ', 'f') };
    const after = applyUpdates(
      people,
      addPersonUpdates(people, 'bo', P('Bố', 'm'), { childId: 'con' }, 1),
    );
    expect(after.con.fatherId).toBe('bo');
    expect(spousesOf(after, 'bo')).toEqual(['me']);
    expect(spousesOf(after, 'me')).toEqual(['bo']);
  });

  it('adds a mother when the father is already set', () => {
    const people: People = { con: P('Con', 'm', { fatherId: 'bo' }), bo: P('Bố', 'm') };
    const after = applyUpdates(
      people,
      addPersonUpdates(people, 'me', P('Mẹ', 'f'), { childId: 'con' }, 1),
    );
    expect(after.con.motherId).toBe('me');
  });

  it('suggests a generation from relatives', () => {
    expect(suggestGeneration(base, { parentId: 'cuong' })).toBe(3);
    expect(suggestGeneration(base, { spouseId: 'dung' })).toBe(2);
    expect(suggestGeneration(base, { childId: 'giang' })).toBe(2);
    expect(suggestGeneration(base, { childId: 'an' })).toBeUndefined();
  });
});

describe('LG-04 editing and deleting', () => {
  it('editing keeps links even if the form does not send them', () => {
    const u = editPersonUpdates(
      base,
      'cuong',
      P('Nguyễn Văn Cường (Cả)', 'm', { generation: 2 }),
      5,
    );
    const after = applyUpdates(base, u);
    expect(after.cuong.name).toBe('Nguyễn Văn Cường (Cả)');
    expect(after.cuong.fatherId).toBe('an');
    expect(after.cuong.spouses).toEqual({ em: true });
  });

  it('removes undefined fields (RTDB rejects them)', () => {
    const u = editPersonUpdates(base, 'dung', { name: 'Dung', gender: 'f', note: undefined }, 5);
    expect(Object.keys(u['people/dung'] as object)).not.toContain('note');
  });

  it('deleting removes every link to the person', () => {
    const after = applyUpdates(base, deletePersonUpdates(base, 'cuong'));
    expect(after.cuong).toBeUndefined();
    expect(after.giang.fatherId).toBeUndefined();
    expect(after.giang.motherId).toBe('em');
    expect(after.em.spouses).toEqual({});
  });
});

describe('LG-10 lifespan', () => {
  it('formats known years', () => {
    expect(
      lifespan(P('a', 'm', { birth: { cal: 's', y: 1920 }, death: { cal: 'l', y: 1995 } })),
    ).toBe('1920 – 1995');
    expect(lifespan(P('a', 'm', { birth: { cal: 's', y: 1985 } }))).toBe('s. 1985');
    expect(lifespan(P('a', 'm', { deceased: true, birth: { cal: 's', y: 1900 } }))).toBe(
      '1900 – ?',
    );
    expect(lifespan(P('a', 'm'))).toBe('');
  });
});

describe('LG-04 relinking', () => {
  it('changes parents and spouses on both sides', () => {
    const u = relinkUpdates(base, 'dung', {
      fatherId: 'an',
      motherId: undefined,
      spouses: ['giang'],
    });
    const after = applyUpdates(base, u);
    expect(after.dung.motherId).toBeUndefined();
    expect(after.dung.fatherId).toBe('an');
    expect(spousesOf(after, 'giang')).toEqual(['dung']);
  });

  it('removes a marriage on both sides', () => {
    const after = applyUpdates(
      base,
      relinkUpdates(base, 'cuong', { fatherId: 'an', motherId: 'binh', spouses: [] }),
    );
    expect(spousesOf(after, 'cuong')).toEqual([]);
    expect(spousesOf(after, 'em')).toEqual([]);
  });

  it('writes nothing when nothing changed', () => {
    expect(
      relinkUpdates(base, 'cuong', { fatherId: 'an', motherId: 'binh', spouses: ['em'] }),
    ).toEqual({});
  });

  it('knows who cannot be a parent (no loops)', () => {
    expect([...descendantsAndSelf(base, 'an')].sort()).toEqual(['an', 'cuong', 'dung', 'giang']);
  });
});
