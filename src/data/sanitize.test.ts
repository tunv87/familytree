import { describe, expect, it } from 'vitest';
import { layoutTree } from '../tree/layout';
import { NO_NAME, sanitizeDate, sanitizeFamily } from './sanitize';

describe('CR-02 sanitizeFamily: damaged data becomes safe to show (B-02)', () => {
  it('returns null for nothing usable', () => {
    for (const v of [null, undefined, 5, 'x', [], true]) expect(sanitizeFamily(v)).toBeNull();
  });

  it('fills a missing meta and keeps only true admin flags', () => {
    const f = sanitizeFamily({ admins: { a: true, b: 'token', c: 1 }, people: 'chuỗi' })!;
    expect(f.meta).toEqual({ name: 'Gia phả', owner: '', createdAt: 0 });
    expect(f.admins).toEqual({ a: true });
    expect(f.people).toEqual({});
  });

  it('drops entries that are not people, names the nameless, fixes fields', () => {
    const f = sanitizeFamily({
      meta: { name: 'Họ A', owner: 'x', createdAt: 1 },
      people: {
        junk1: 5,
        junk2: 'chữ',
        junk3: null,
        noname: { gender: 'm' },
        weird: { name: 12345, gender: 'x', generation: 'hai', order: -3, deceased: 'yes' },
        ok: { name: 'Bình Thường', gender: 'f', generation: 3, order: 2, deceased: true },
      },
    })!;
    expect(Object.keys(f.people!).sort()).toEqual(['noname', 'ok', 'weird']);
    expect(f.people!.noname.name).toBe(NO_NAME);
    expect(f.people!.weird).toEqual({ name: NO_NAME, gender: 'u' });
    expect(f.people!.ok).toMatchObject({ generation: 3, order: 2, deceased: true });
  });

  it('accepts people stored as an array (numeric keys)', () => {
    const f = sanitizeFamily({ meta: { name: 'Họ B' }, people: [{ name: 'Một', gender: 'm' }] })!;
    expect(f.people!['0'].name).toBe('Một');
  });

  it('removes links to missing people, to oneself, and parent loops', () => {
    const f = sanitizeFamily({
      meta: { name: 'Họ C' },
      people: {
        a: { name: 'A', gender: 'm', fatherId: 'b', spouses: { a: true, ghost: true, c: true } },
        b: { name: 'B', gender: 'm', fatherId: 'a' },
        c: { name: 'C', gender: 'f', fatherId: 'c', motherId: 'ghost', spouses: { a: true } },
      },
    })!;
    const p = f.people!;
    expect(p.a.spouses).toEqual({ c: true });
    expect(p.c.fatherId).toBeUndefined();
    expect(p.c.motherId).toBeUndefined();
    // exactly one of the two links of the loop was cut
    expect([p.a.fatherId, p.b.fatherId].filter(Boolean)).toHaveLength(1);
    expect(() => layoutTree(p)).not.toThrow();
  });

  it('cleans dates', () => {
    expect(sanitizeDate({ cal: 's', d: 45, m: 13, y: -5 })).toBeUndefined();
    expect(sanitizeDate({ d: 1, m: 1 })).toEqual({ cal: 's', d: 1, m: 1 });
    expect(sanitizeDate({ cal: 'l', d: 31, m: 2, y: 1990, leap: true })).toEqual({
      cal: 'l',
      m: 2,
      y: 1990,
      leap: true,
    });
    expect(sanitizeDate({ cal: 's', d: 5, y: 2000 })).toEqual({ cal: 's', y: 2000 });
    expect(sanitizeDate('1/1/1990')).toBeUndefined();
  });

  it('leaves good data unchanged', () => {
    const good = {
      meta: { name: 'Họ D', owner: 'u', createdAt: 5 },
      admins: { u: true as const },
      people: {
        a: {
          name: 'A',
          gender: 'm' as const,
          spouses: { b: true as const },
          birth: { cal: 's' as const, d: 1, m: 2, y: 1950 },
        },
        b: { name: 'B', gender: 'f' as const, spouses: { a: true as const } },
        c: { name: 'C', gender: 'm' as const, fatherId: 'a', motherId: 'b', order: 1 },
      },
    };
    expect(sanitizeFamily(good)).toEqual(good);
  });
});
