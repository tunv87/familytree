import { describe, expect, it } from 'vitest';
import {
  addPersonUpdates,
  applyUpdates,
  byGeneration,
  childrenOf,
  deletePersonUpdates,
  editPersonUpdates,
  inverseUpdates,
  siblingOrder,
  descendantsAndSelf,
  lifespan,
  relinkUpdates,
  normalize,
  parentsOf,
  searchPeople,
  siblingsOf,
  spousesOf,
  type People,
} from './people';
import { computeGenerations } from './generations';
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
  it('groups by (computed) generation', () => {
    expect(byGeneration(base, computeGenerations(base)).map(([g, ids]) => [g, ids.length])).toEqual(
      [
        [1, 2],
        [2, 3],
        [3, 1],
      ],
    );
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

describe('UX-17 inverseUpdates (Hoàn tác)', () => {
  const fam = (): People => ({
    dad: { name: 'Ba', gender: 'm', spouses: { mom: true } },
    mom: { name: 'Má', gender: 'f', spouses: { dad: true } },
    kid: { name: 'Con', gender: 'm', fatherId: 'dad', motherId: 'mom' },
  });

  it('undoing a delete puts back the person and every link to them', () => {
    const before = fam();
    const del = deletePersonUpdates(before, 'dad');
    const undo = inverseUpdates(before, del);
    const after = applyUpdates(applyUpdates(before, del), undo);
    expect(after).toEqual(before);
  });

  it('undoing an edit restores the old values; a new path is removed again', () => {
    const before = fam();
    const edit = editPersonUpdates(before, 'kid', { name: 'Con Sửa', gender: 'm' }, 5);
    const undo = inverseUpdates(before, edit);
    expect(applyUpdates(applyUpdates(before, edit), undo)).toEqual(before);
    expect(inverseUpdates(before, { 'people/new': { name: 'Mới' } })).toEqual({
      'people/new': null,
    });
  });
});

describe('LG-19 thêm anh/chị/em: thứ tự con', () => {
  const fam = (): People => ({
    ba: { name: 'Ba', gender: 'm' },
    tu: { name: 'Tự', gender: 'm', fatherId: 'ba', order: 1 },
    lap: { name: 'Lập', gender: 'f', fatherId: 'ba', order: 2 },
    khongRo: { name: 'Không Rõ', gender: 'm', fatherId: 'ba' },
  });

  it('em of Lập goes right after her', () => {
    expect(siblingOrder(fam(), 'lap', false)).toEqual({ order: 3, updates: {} });
  });

  it('anh of Lập goes before her; she and those after move down one', () => {
    expect(siblingOrder(fam(), 'lap', true)).toEqual({
      order: 2,
      updates: { 'people/lap/order': 3 },
    });
  });

  it('anh of the eldest becomes number 1, everyone else moves down', () => {
    expect(siblingOrder(fam(), 'tu', true)).toEqual({
      order: 1,
      updates: { 'people/tu/order': 2, 'people/lap/order': 3 },
    });
  });

  it('someone with no order gets one after the ordered siblings; unknowns are left alone', () => {
    const r = siblingOrder(fam(), 'khongRo', false);
    expect(r).toEqual({ order: 4, updates: { 'people/khongRo/order': 3 } });
  });

  it('works with no other siblings', () => {
    const p: People = {
      ba: { name: 'Ba', gender: 'm' },
      x: { name: 'X', gender: 'm', fatherId: 'ba' },
    };
    expect(siblingOrder(p, 'x', true)).toEqual({ order: 1, updates: { 'people/x/order': 2 } });
  });
});
