import { describe, expect, it } from 'vitest';
import { kinship } from './kinship';
import { computeGenerations } from './generations';
import {
  addPersonUpdates,
  applyUpdates,
  deletePersonUpdates,
  editPersonUpdates,
  siblingOrder,
  siblingsOf,
  type People,
} from './people';
import { sanitizeFamily } from './sanitize';
import { isVirtual, siblingGroups, withSiblingLinks } from './siblings';
import { layoutTree } from '../tree/layout';
import type { Person } from './types';

const P = (name: string, gender: 'm' | 'f', extra: Partial<Person> = {}): Person => ({
  name,
  gender,
  ...extra,
});

/** Like the real family: ông Thận married bà Thanh (whose parents aren't known); his younger
 *  brother Hai is added straight onto him. */
const fam = (): People => ({
  than: P('Nguyễn Thận', 'm', { spouses: { thanh: true }, order: 1, siblings: { hai: true } }),
  thanh: P('Nguyễn Thị Thanh', 'f', { spouses: { than: true } }),
  hai: P('Nguyễn Văn Hai', 'm', { order: 2, siblings: { than: true }, spouses: { ba: true } }),
  ba: P('Trần Thị Ba', 'f', { spouses: { hai: true } }),
  conHai: P('Nguyễn Văn Con', 'm', { fatherId: 'hai', motherId: 'ba' }),
  thanhB: P('Nguyễn Văn Thành', 'm', { fatherId: 'than', motherId: 'thanh' }),
  tu: P('Nguyễn Văn Tự', 'm', { fatherId: 'thanhB' }),
});

describe('LG-19 anh chị em nối thẳng (không có ba má trong gia phả)', () => {
  it('groups follow the links both ways and through each other', () => {
    const p = fam();
    p.ut = P('Út', 'f', { siblings: { hai: true } });
    expect(siblingGroups(p)).toEqual([['hai', 'than', 'ut']]);
  });

  it('they are listed as brothers and sisters', () => {
    expect(siblingsOf(fam(), 'than')).toEqual(['hai']);
    expect(siblingsOf(fam(), 'hai')).toEqual(['than']);
  });

  it('xưng hô works out from the person they were linked to', () => {
    const p = fam();
    expect(kinship(p, 'than', 'hai')).toMatchObject({
      call: 'em',
      self: 'anh',
      relation: 'em trai ruột',
    });
    expect(kinship(p, 'hai', 'than')).toMatchObject({ call: 'anh', self: 'em' });
    // Thận's son calls his father's younger brother chú; his grandson calls him ông chú
    expect(kinship(p, 'thanhB', 'hai')).toMatchObject({ call: 'chú', self: 'cháu' });
    expect(kinship(p, 'tu', 'hai')).toMatchObject({ call: 'ông', relation: 'ông chú' });
    // and the two sides' children are cousins: Thành is the son of the elder brother
    expect(kinship(p, 'conHai', 'thanhB')).toMatchObject({ call: 'anh', relation: 'anh họ' });
    // Hai's wife is thím to Thành
    expect(kinship(p, 'thanhB', 'ba')).toMatchObject({ call: 'thím' });
    // the made-up parent never shows in "đường quan hệ"
    expect(kinship(p, 'tu', 'hai')!.path.some(isVirtual)).toBe(false);
  });

  it('same đời as the person they were linked to, and their families follow', () => {
    const g = computeGenerations(fam());
    expect(g.than).toBe(1);
    expect(g.hai).toBe(1);
    expect(g.ba).toBe(1);
    expect(g.conHai).toBe(2);
    expect(g.tu).toBe(3);
  });

  it('once one of them gets parents, the others share them (and stand with them on the tree)', () => {
    const p = fam();
    p.cu = P('Cụ Nguyễn', 'm');
    p.than = { ...p.than, fatherId: 'cu' };
    const v = withSiblingLinks(p, false);
    expect(v.hai.fatherId).toBe('cu');
    expect(kinship(p, 'hai', 'cu')).toMatchObject({ call: 'ba' });
    const ids = layoutTree(p).nodes.map((n) => n.id);
    expect(ids).toContain('hai');
    expect(ids.some(isVirtual)).toBe(false);
  });

  it('the tree never draws the made-up parent', () => {
    const ids = layoutTree(fam()).nodes.map((n) => n.id);
    expect(ids.some(isVirtual)).toBe(false);
    expect(new Set(ids)).toEqual(new Set(Object.keys(fam())));
  });

  it('adding, editing and deleting keep the links on both sides', () => {
    const p: People = { a: P('A', 'm') };
    const added = applyUpdates(p, addPersonUpdates(p, 'b', P('B', 'f'), { siblingId: 'a' }, 1));
    expect(added.a.siblings).toEqual({ b: true });
    expect(added.b.siblings).toEqual({ a: true });
    const edited = applyUpdates(added, editPersonUpdates(added, 'b', P('B2', 'f'), 2));
    expect(edited.b.siblings).toEqual({ a: true });
    const gone = applyUpdates(edited, deletePersonUpdates(edited, 'b'));
    expect(gone.a.siblings ?? {}).toEqual({}); // the database drops the empty node
  });

  it('birth order includes the directly linked ones', () => {
    expect(siblingOrder(fam(), 'hai', false)).toEqual({ order: 3, updates: {} });
    expect(siblingOrder(fam(), 'than', true)).toEqual({
      order: 1,
      updates: { 'people/than/order': 2, 'people/hai/order': 3 },
    });
  });

  it('damaged links are cleaned when loading', () => {
    const f = sanitizeFamily({
      meta: { name: 'x', owner: 'o', createdAt: 1 },
      admins: { o: true },
      people: {
        a: { name: 'A', gender: 'm', siblings: { b: true, gone: true, a: true } },
        b: { name: 'B', gender: 'f', siblings: { a: 'yes' } },
      },
    })!;
    expect(f.people!.a.siblings).toEqual({ b: true });
    expect(f.people!.b.siblings).toEqual({ a: true });
  });
});
