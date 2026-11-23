import { describe, expect, it } from 'vitest';
import type { People } from '../data/people';
import type { Person } from '../data/types';
import { CARD_W, countDescendants, findRoots, layoutTree, wrapName } from './layout';

const P = (name: string, gender: Person['gender'], extra: Partial<Person> = {}): Person => ({
  name,
  gender,
  ...extra,
});

// An + Bình → Cường (+ Em → Giang, Hoa), Dung (+ Khánh, in-law → Lan)
const family: People = {
  an: P('An', 'm', { generation: 1, spouses: { binh: true } }),
  binh: P('Bình', 'f', { generation: 1, spouses: { an: true } }),
  cuong: P('Cường', 'm', { fatherId: 'an', motherId: 'binh', order: 1, spouses: { em: true } }),
  dung: P('Dung', 'f', { fatherId: 'an', motherId: 'binh', order: 2, spouses: { khanh: true } }),
  em: P('Em', 'f', { spouses: { cuong: true } }),
  khanh: P('Khánh', 'm', { spouses: { dung: true } }),
  giang: P('Giang', 'm', { fatherId: 'cuong', motherId: 'em', order: 1 }),
  hoa: P('Hoa', 'f', { fatherId: 'cuong', motherId: 'em', order: 2 }),
  lan: P('Lan', 'f', { fatherId: 'khanh', motherId: 'dung' }),
};

function overlaps(layout: ReturnType<typeof layoutTree>) {
  const bad: string[] = [];
  const byRow = new Map<number, typeof layout.nodes>();
  for (const n of layout.nodes) byRow.set(n.y, [...(byRow.get(n.y) ?? []), n]);
  for (const row of byRow.values()) {
    const sorted = [...row].sort((a, b) => a.x - b.x);
    for (let i = 1; i < sorted.length; i++)
      if (sorted[i].x < sorted[i - 1].x + CARD_W) bad.push(`${sorted[i - 1].id}/${sorted[i].id}`);
  }
  return bad;
}

describe('LG-05 roots', () => {
  it('a founding couple is one root (the husband)', () => {
    expect(findRoots(family)).toEqual(['an']);
  });
  it('in-laws are not roots', () => {
    expect(findRoots(family)).not.toContain('em');
    expect(findRoots(family)).not.toContain('khanh');
  });
  it('unrelated people become separate roots, biggest family first', () => {
    const people = { ...family, x: P('X', 'm', { generation: 1 }) };
    expect(findRoots(people)).toEqual(['an', 'x']);
  });
  it('counts descendants', () => {
    expect(countDescendants(family, 'an')).toBe(5);
  });
});

describe('LG-05 layout', () => {
  const layout = layoutTree(family);
  const at = (id: string) => layout.nodes.find((n) => n.id === id)!;

  it('draws everyone exactly once', () => {
    const ids = layout.nodes.map((n) => n.id).sort();
    expect(ids).toEqual(Object.keys(family).sort());
  });

  it('puts each generation on its own row', () => {
    expect(at('an').y).toBe(at('binh').y);
    expect(at('cuong').y).toBeGreaterThan(at('an').y);
    expect(at('giang').y).toBeGreaterThan(at('cuong').y);
    expect(at('em').y).toBe(at('cuong').y);
  });

  it('draws in-laws beside their spouse', () => {
    expect(at('em').inLaw).toBe(true);
    expect(at('em').x).toBeGreaterThan(at('cuong').x);
    expect(at('khanh').x).toBeGreaterThan(at('dung').x);
  });

  it('keeps siblings in birth order', () => {
    expect(at('cuong').x).toBeLessThan(at('dung').x);
    expect(at('giang').x).toBeLessThan(at('hoa').x);
  });

  it('never overlaps cards', () => {
    expect(overlaps(layout)).toEqual([]);
  });

  it('centres parents over their children', () => {
    const kids = [at('giang'), at('hoa')];
    const kidsMid = (kids[0].x + kids[1].x + CARD_W) / 2;
    const coupleMid = (at('cuong').x + at('em').x + CARD_W) / 2;
    expect(Math.abs(kidsMid - coupleMid)).toBeLessThan(1);
  });

  it('collapsing a branch hides its descendants', () => {
    const l = layoutTree(family, { collapsed: new Set(['cuong']) });
    const ids = l.nodes.map((n) => n.id);
    expect(ids).not.toContain('giang');
    expect(ids).toContain('em');
    expect(l.nodes.find((n) => n.id === 'cuong')!.collapsed).toBe(true);
  });

  it('can start from any person (branch view)', () => {
    const l = layoutTree(family, { rootId: 'dung' });
    expect(l.nodes.map((n) => n.id).sort()).toEqual(['dung', 'khanh', 'lan']);
  });

  it('handles a large generated family without overlaps', () => {
    const big: People = { r: P('Root', 'm') };
    let n = 0;
    const grow = (id: string, depth: number) => {
      if (depth === 5) return;
      const wife = `w${n++}`;
      big[wife] = P('Wife', 'f', { spouses: { [id]: true } });
      big[id].spouses = { [wife]: true };
      for (let i = 0; i < 3; i++) {
        const c = `c${n++}`;
        big[c] = P(`Child ${c}`, i % 2 ? 'f' : 'm', { fatherId: id, motherId: wife, order: i + 1 });
        grow(c, depth + 1);
      }
    };
    grow('r', 0);
    const l = layoutTree(big);
    expect(l.nodes.length).toBe(Object.keys(big).length);
    expect(overlaps(l)).toEqual([]);
  });

  it('survives a cousin marriage (both blood relatives) and drawing each once', () => {
    const p: People = {
      ...family,
      giang: { ...family.giang, spouses: { lan: true } },
      lan: { ...family.lan, spouses: { giang: true } },
    };
    const l = layoutTree(p);
    expect(l.nodes.map((n) => n.id).sort()).toEqual(Object.keys(p).sort());
  });
});

describe('LG-05 wrapName', () => {
  it('wraps long Vietnamese names into two lines', () => {
    expect(wrapName('Nguyễn Văn An')).toEqual(['Nguyễn Văn An']);
    expect(wrapName('Nguyễn Thị Minh Khai Phương')).toEqual(['Nguyễn Thị Minh', 'Khai Phương']);
    const long = wrapName('Tôn Nữ Thị Hồng Hạnh Phúc Lâm Kim Ngọc Bích');
    expect(long).toHaveLength(2);
    expect(long[1]).toMatch(/…$/);
  });
});
