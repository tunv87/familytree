import { describe, expect, it } from 'vitest';
import { cardContent } from '../tree/card';
import { CARD_W, layoutTree, PHOTO_CARD_W } from '../tree/layout';
import { randomFamily } from '../test/randomFamily';
import { searchPeople, type People } from './people';
import { isValidJpeg, PHOTO_MAX, squareCrop, THUMB_MAX } from './photos';
import { sanitizeFamily } from './sanitize';

describe('LG-15 ảnh đại diện: cắt vuông và kiểm dữ liệu', () => {
  it('crops the centred square of portrait, landscape and square pictures', () => {
    expect(squareCrop(3000, 4000)).toEqual({ sx: 0, sy: 500, side: 3000 });
    expect(squareCrop(4000, 3000)).toEqual({ sx: 500, sy: 0, side: 3000 });
    expect(squareCrop(512, 512)).toEqual({ sx: 0, sy: 0, side: 512 });
    expect(squareCrop(0, 0).side).toBe(1); // never divides by zero
  });

  it('accepts only JPEG data URLs within the size limit', () => {
    const jpeg = 'data:image/jpeg;base64,' + 'A'.repeat(100);
    expect(isValidJpeg(jpeg, THUMB_MAX)).toBe(true);
    expect(isValidJpeg('data:image/jpeg;base64,' + 'A'.repeat(THUMB_MAX), THUMB_MAX)).toBe(false);
    expect(isValidJpeg('data:image/svg+xml;base64,PHN2Zz4=', PHOTO_MAX)).toBe(false);
    expect(isValidJpeg('javascript:alert(1)', PHOTO_MAX)).toBe(false);
    expect(isValidJpeg(42, PHOTO_MAX)).toBe(false);
  });
});

describe('LG-15 ô trên cây kiểu B (ảnh bên trái tên)', () => {
  it('text-only cards centre the name; photo cards put it right of the photo', () => {
    const plain = cardContent('Nguyễn Văn An', '1950', CARD_W);
    expect(plain).toMatchObject({ photo: null, anchor: 'middle', textX: CARD_W / 2 });
    const photo = cardContent('Nguyễn Văn An', '1950', PHOTO_CARD_W);
    expect(photo.photo).not.toBeNull();
    expect(photo.anchor).toBe('start');
    expect(photo.textX).toBeGreaterThan(photo.photo!.cx + photo.photo!.r);
  });

  it('long names wrap to two lines that fit beside the photo', () => {
    const c = cardContent('Nguyễn Phúc Vĩnh Thụy Bảo Hoàng Nguyễn Thị Hồng Hạnh', '', PHOTO_CARD_W);
    expect(c.lines).toHaveLength(2);
    for (const l of c.lines) expect([...l.replace(/…$/, '')].length).toBeLessThanOrEqual(13);
  });

  it('wider cards never overlap and the tree just gets wider', () => {
    const people = randomFamily(300, 6);
    const narrow = layoutTree(people);
    const wide = layoutTree(people, { cardW: PHOTO_CARD_W });
    expect(wide.cardW).toBe(PHOTO_CARD_W);
    expect(wide.height).toBe(narrow.height);
    expect(wide.width).toBeGreaterThan(narrow.width);
    const rows = new Map<number, number[]>();
    for (const n of wide.nodes) rows.set(n.y, [...(rows.get(n.y) ?? []), n.x]);
    for (const xs of rows.values()) {
      xs.sort((a, b) => a - b);
      for (let i = 1; i < xs.length; i++)
        expect(xs[i] - xs[i - 1]).toBeGreaterThanOrEqual(PHOTO_CARD_W);
    }
  });
});

describe('LG-16 nơi ở', () => {
  it('is kept trimmed (max 120), dropped when not text', () => {
    const f = sanitizeFamily({
      meta: { name: 'Họ Võ', owner: 'u', createdAt: 1 },
      people: {
        a: { name: 'A', gender: 'm', place: '  Hoài Nhơn, Bình Định  ' },
        b: { name: 'B', gender: 'f', place: 'x'.repeat(300) },
        c: { name: 'C', gender: 'f', place: 12 },
        d: { name: 'D', gender: 'f', place: '   ' },
      },
    })!;
    expect(f.people!.a.place).toBe('Hoài Nhơn, Bình Định');
    expect(f.people!.b.place).toHaveLength(120);
    expect(f.people!.c.place).toBeUndefined();
    expect(f.people!.d.place).toBeUndefined();
  });

  it('search finds people by where they live, without diacritics', () => {
    const people: People = {
      a: { name: 'Võ Văn Hùng', gender: 'm', place: 'Hoài Nhơn, Bình Định' },
      b: { name: 'Võ Thị Lan', gender: 'f', place: 'TP. Hồ Chí Minh' },
      c: { name: 'Lê Văn Nhơn', gender: 'm' },
    };
    expect(searchPeople(people, 'binh dinh')).toEqual(['a']);
    expect(searchPeople(people, 'nhơn').sort()).toEqual(['a', 'c']); // name or place
    expect(searchPeople(people, 'ho chi minh')).toEqual(['b']);
  });
});
