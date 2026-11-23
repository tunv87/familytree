import { describe, expect, it } from 'vitest';
import { randomFamily } from '../test/randomFamily';
import { computeGenerations } from './generations';
import { bloodLink, kinship, type Region } from './kinship';
import type { People } from './people';
import type { Person } from './types';

const P = (name: string, gender: Person['gender'], extra: Partial<Person> = {}): Person => ({
  name,
  gender,
  ...extra,
});
const y = (year: number) => ({ birth: { cal: 's' as const, y: year } });
const kids = (father: string, mother: string) => ({ fatherId: father, motherId: mother });
const wed = (id: string) => ({ spouses: { [id]: true as const } });

/**
 * "tôi" (sinh 1995) and five generations around him:
 * kỵ → cụ ông → ông nội (+ ông chú) → bố & anh chị em của bố → tôi → con → cháu → chắt → chút.
 * Bên mẹ: ông bà ngoại → dì (chị của mẹ), mẹ, cậu. Bên vợ: bố mẹ vợ, chị vợ + chồng.
 */
const F: People = {
  ky: P('Kỵ', 'm'),
  cuOng: P('Cụ Ông', 'm', { fatherId: 'ky' }),
  ongNoi: P('Ông Nội', 'm', { fatherId: 'cuOng', order: 1, ...wed('baNoi') }),
  ongChu: P('Ông Chú', 'm', { fatherId: 'cuOng', order: 2 }),
  baNoi: P('Bà Nội', 'f', wed('ongNoi')),
  // children of ông bà nội, in birth order
  coLon: P('Cô Lớn', 'f', { ...kids('ongNoi', 'baNoi'), order: 1, ...wed('duongLon') }),
  bacTrai: P('Bác Trai', 'm', { ...kids('ongNoi', 'baNoi'), order: 2, ...wed('bacGai') }),
  bo: P('Bố', 'm', { ...kids('ongNoi', 'baNoi'), order: 3, ...wed('me') }),
  chu: P('Chú', 'm', { ...kids('ongNoi', 'baNoi'), order: 4, ...wed('thim') }),
  coUt: P('Cô Út', 'f', { ...kids('ongNoi', 'baNoi'), order: 5, ...wed('duongUt') }),
  duongLon: P('Dượng Lớn', 'm', wed('coLon')),
  bacGai: P('Bác Gái', 'f', wed('bacTrai')),
  thim: P('Thím', 'f', wed('chu')),
  duongUt: P('Dượng Út', 'm', wed('coUt')),
  // bên ngoại
  ongNgoai: P('Ông Ngoại', 'm', wed('baNgoai')),
  baNgoai: P('Bà Ngoại', 'f', wed('ongNgoai')),
  diLon: P('Dì Lớn', 'f', { ...kids('ongNgoai', 'baNgoai'), order: 1, ...wed('duongNgoai') }),
  me: P('Mẹ', 'f', { ...kids('ongNgoai', 'baNgoai'), order: 2, ...wed('bo') }),
  cau: P('Cậu', 'm', { ...kids('ongNgoai', 'baNgoai'), order: 3, ...wed('mo') }),
  duongNgoai: P('Dượng Ngoại', 'm', wed('diLon')),
  mo: P('Mợ', 'f', wed('cau')),
  // anh chị em
  anhRuot: P('Anh Ruột', 'm', { ...kids('bo', 'me'), order: 1, ...wed('chiDau') }),
  toi: P('Tôi', 'm', { ...kids('bo', 'me'), order: 2, ...y(1995), ...wed('vo') }),
  emGai: P('Em Gái', 'f', { ...kids('bo', 'me'), order: 3, ...wed('emRe') }),
  chuaRo: P('Chưa Rõ', 'u', kids('bo', 'me')), // no order, no birth year
  chiDau: P('Chị Dâu', 'f', wed('anhRuot')),
  emRe: P('Em Rể', 'm', wed('emGai')),
  // anh chị em họ: vai beats age
  conBac: P('Con Bác', 'm', { fatherId: 'bacTrai', ...y(2000) }), // younger, but anh
  conChu: P('Con Chú', 'm', { fatherId: 'chu', ...y(1990) }), // older, but em
  // bên vợ
  boVo: P('Bố Vợ', 'm', wed('meVo')),
  meVo: P('Mẹ Vợ', 'f', wed('boVo')),
  chiVo: P('Chị Vợ', 'f', { ...kids('boVo', 'meVo'), order: 1, ...wed('anhCotCheo') }),
  vo: P('Vợ', 'f', { ...kids('boVo', 'meVo'), order: 2, ...wed('toi') }),
  emVo: P('Em Gái Vợ', 'f', { ...kids('boVo', 'meVo'), order: 3 }),
  emTraiVo: P('Em Trai Vợ', 'm', { ...kids('boVo', 'meVo'), order: 4 }),
  anhCotCheo: P('Chồng Chị Vợ', 'm', wed('chiVo')),
  // đời dưới
  conTrai: P('Con Trai', 'm', { ...kids('toi', 'vo'), ...wed('conDau') }),
  conDau: P('Con Dâu', 'f', wed('conTrai')),
  conGai: P('Con Gái', 'f', kids('toi', 'vo')),
  chauNoi: P('Cháu Nội', 'm', { fatherId: 'conTrai', motherId: 'conDau' }),
  chauNgoai: P('Cháu Ngoại', 'f', { motherId: 'conGai' }),
  chat: P('Chắt', 'm', { fatherId: 'chauNoi' }),
  chut: P('Chút', 'f', { motherId: 'chat' }),
  chauRuot: P('Cháu (con anh)', 'm', { fatherId: 'anhRuot' }),
  lac: P('Người Lạ', 'm'),
};

type Row = [them: string, call: string, self: string, relation?: string];

/** Miền Trung — Bình Định (default). */
const TRUNG: Row[] = [
  // the four pairs the family settled on (cô–dượng, dì–dượng, chú–thím, cậu–mợ)
  ['coUt', 'cô', 'cháu', 'em gái của bố'],
  ['duongUt', 'dượng', 'cháu', 'chồng của cô'],
  ['diLon', 'dì', 'cháu', 'chị của mẹ'],
  ['duongNgoai', 'dượng', 'cháu', 'chồng của dì'],
  ['chu', 'chú', 'cháu', 'em trai của bố'],
  ['thim', 'thím', 'cháu', 'vợ của chú'],
  ['cau', 'cậu', 'cháu', 'em trai của mẹ'],
  ['mo', 'mợ', 'cháu', 'vợ của cậu'],
  // the rest of the cô chú bác row
  ['bacTrai', 'bác', 'cháu', 'anh của bố'],
  ['bacGai', 'bác', 'cháu', 'vợ của bác'],
  ['coLon', 'cô', 'cháu', 'chị của bố'],
  ['duongLon', 'dượng', 'cháu'],
  // direct line up
  ['bo', 'ba', 'con', 'bố'],
  ['me', 'má', 'con', 'mẹ'],
  ['ongNoi', 'ông nội', 'cháu', 'ông nội'],
  ['baNoi', 'bà nội', 'cháu'],
  ['ongNgoai', 'ông ngoại', 'cháu', 'ông ngoại'],
  ['baNgoai', 'bà ngoại', 'cháu'],
  ['cuOng', 'ông cố', 'chắt'],
  ['ky', 'ông kỵ', 'chút'], // gia đình duyệt: ông kỵ / bà kỵ
  ['ongChu', 'ông', 'cháu', 'ông chú'],
  // same generation
  ['anhRuot', 'anh', 'em', 'anh ruột'],
  ['emGai', 'em', 'anh', 'em gái ruột'],
  ['chiDau', 'chị', 'em', 'chị dâu'],
  ['emRe', 'em', 'anh', 'em rể'],
  ['conBac', 'anh', 'em', 'anh họ'],
  ['conChu', 'em', 'anh', 'em trai họ'],
  ['chuaRo', 'anh/chị hoặc em', 'anh hoặc em'],
  ['vo', 'em', 'anh', 'vợ'],
  // bên vợ: called the way my wife calls them
  ['boVo', 'ba', 'con', 'bố (bên vợ)'],
  ['meVo', 'má', 'con'],
  ['chiVo', 'chị', 'em', 'chị ruột (bên vợ)'],
  ['anhCotCheo', 'anh', 'em'],
  // em của vợ / chồng: gọi thay con (gia đình duyệt)
  ['emVo', 'cô', 'anh', 'em gái ruột (bên vợ)'],
  ['emTraiVo', 'chú', 'anh'],
  // down
  ['conTrai', 'con', 'ba', 'con trai'],
  ['conGai', 'con', 'ba', 'con gái'],
  ['conDau', 'con', 'ba', 'con dâu'],
  ['chauNoi', 'cháu', 'ông', 'cháu nội'],
  ['chauNgoai', 'cháu', 'ông', 'cháu ngoại'],
  ['chat', 'chắt', 'ông cố'],
  ['chut', 'chút', 'ông kỵ'],
  ['chauRuot', 'cháu', 'chú', 'cháu ruột'],
];

/** Where miền Bắc differs. */
const BAC: Row[] = [
  ['bo', 'bố', 'con'],
  ['me', 'mẹ', 'con'],
  ['coLon', 'bác', 'cháu'], // chị của bố
  ['duongLon', 'bác', 'cháu'],
  ['diLon', 'bác', 'cháu'], // chị của mẹ
  ['duongNgoai', 'bác', 'cháu'],
  ['coUt', 'cô', 'cháu'],
  ['duongUt', 'chú', 'cháu'],
  ['cau', 'cậu', 'cháu'],
  ['mo', 'mợ', 'cháu'],
  ['cuOng', 'cụ', 'chắt'],
  ['ky', 'kỵ', 'chút'],
  ['emVo', 'em', 'anh'],
  ['conTrai', 'con', 'bố'],
];

/** Miền Nam: like Trung for the family above. */
const NAM: Row[] = [
  ['bo', 'ba', 'con'],
  ['coLon', 'cô', 'cháu'],
  ['duongUt', 'dượng', 'cháu'],
  ['diLon', 'dì', 'cháu'],
  ['thim', 'thím', 'cháu'],
  ['mo', 'mợ', 'cháu'],
  ['cuOng', 'ông cố', 'chắt'],
  ['ky', 'ông sơ', 'chút'],
  ['emVo', 'em', 'anh'],
];

function check(region: Region, rows: Row[]) {
  it.each(rows)(`tôi → %s: gọi "%s", xưng "%s"`, (them, call, self, relation) => {
    const k = kinship(F, 'toi', them, region);
    expect(k, `no relation found for ${them}`).not.toBeNull();
    expect({ call: k!.call, self: k!.self }).toEqual({ call, self });
    if (relation) expect(k!.relation).toBe(relation);
  });
}

describe('LG-13 xưng hô — miền Trung (Bình Định, mặc định)', () => check('trung', TRUNG));
describe('LG-13 xưng hô — miền Bắc', () => check('bac', BAC));
describe('LG-13 xưng hô — miền Nam', () => check('nam', NAM));

describe('LG-13 xưng hô — other directions and edge cases', () => {
  it('the uncle side: chú calls me cháu and calls himself chú; thím calls herself thím', () => {
    expect(kinship(F, 'chu', 'toi')).toMatchObject({ call: 'cháu', self: 'chú' });
    expect(kinship(F, 'thim', 'toi')).toMatchObject({ call: 'cháu', self: 'thím' });
    expect(kinship(F, 'mo', 'toi')).toMatchObject({ call: 'cháu', self: 'mợ' });
    expect(kinship(F, 'duongUt', 'toi')).toMatchObject({ call: 'cháu', self: 'dượng' });
  });

  it('vai beats age: con nhà chú (older) still calls con nhà bác (younger) anh', () => {
    expect(kinship(F, 'conChu', 'conBac')).toMatchObject({ call: 'anh', self: 'em' });
  });

  it('the wife calls her husband’s younger sister cô (Trung), em (Bắc); the sister still calls her chị and says em', () => {
    expect(kinship(F, 'vo', 'emGai')).toMatchObject({ call: 'cô', self: 'chị' });
    expect(kinship(F, 'vo', 'emGai', 'bac')).toMatchObject({ call: 'em', self: 'chị' });
    expect(kinship(F, 'emGai', 'vo')).toMatchObject({ call: 'chị', self: 'em' });
  });

  it('the default region is Trung', () => {
    expect(kinship(F, 'toi', 'duongUt')!.call).toBe('dượng');
  });

  it('myself and strangers', () => {
    expect(kinship(F, 'toi', 'toi')).toMatchObject({ call: '', relation: 'chính bạn' });
    expect(kinship(F, 'toi', 'lac')).toBeNull();
    expect(kinship(F, 'toi', 'khong-co')).toBeNull();
  });

  it('the path goes through the common ancestor', () => {
    expect(kinship(F, 'toi', 'conBac')!.path).toEqual(['toi', 'bo', 'ongNoi', 'bacTrai', 'conBac']);
  });

  it('unknown gender gets a neutral word', () => {
    const people: People = { ...F, x: P('X', 'u', { ...kids('ongNoi', 'baNoi'), order: 6 }) };
    expect(kinship(people, 'toi', 'x')!.call).toBe('chú/cô');
  });

  it('missing order and birth year at the common ancestor → seniority unknown', () => {
    const people: People = {
      ...F,
      bacTrai: { ...F.bacTrai, order: undefined },
      bo: { ...F.bo, order: undefined },
    };
    expect(kinship(people, 'toi', 'bacTrai')!.call).toBe('bác/chú');
  });
});

describe('LG-13 properties on random families', () => {
  const people = randomFamily(300, 4);
  const ids = Object.keys(people);
  const gens = computeGenerations(people);
  const pairs: [string, string][] = [];
  for (let i = 0; i < 400; i++)
    pairs.push([ids[(i * 7919) % ids.length], ids[(i * 104729 + 13) % ids.length]]);

  it('blood links are mirror images, and the generation gap matches the computed "đời"', () => {
    for (const [a, b] of pairs) {
      const ab = bloodLink(people, a, b);
      const ba = bloodLink(people, b, a);
      expect(Boolean(ab)).toBe(Boolean(ba));
      if (!ab || !ba) continue;
      expect([ab.up, ab.down]).toEqual([ba.down, ba.up]);
      if (gens[a] !== undefined && gens[b] !== undefined)
        expect(gens[b] - gens[a]).toBe(ab.down - ab.up);
    }
  });

  it('every pair gets words or "unrelated", never a crash or an empty word', () => {
    for (const [a, b] of pairs) {
      const k = kinship(people, a, b);
      if (k && a !== b) {
        expect(k.call.length).toBeGreaterThan(0);
        expect(k.self.length).toBeGreaterThan(0);
        expect(k.path[0]).toBe(a);
        expect(k.path[k.path.length - 1]).toBe(b);
      }
    }
  });

  it('one person page on a 1,000-person family is fast', () => {
    const big = randomFamily(1000, 5);
    const ids2 = Object.keys(big);
    kinship(big, ids2[0], ids2[1]); // build the index once (cached per family)
    const t0 = performance.now();
    for (let i = 0; i < 20; i++) kinship(big, ids2[i * 37], ids2[999 - i * 11]);
    expect((performance.now() - t0) / 20).toBeLessThan(50);
  });
});
