/**
 * Gợi ý xưng hô: what I call a relative and what I call myself to them, worked out from the
 * family links. The rules are in docs/testing/XUNG_HO.md (default: miền Trung — Bình Định).
 *
 * 1. `relationPath` finds how two people are related: through their nearest common ancestor
 *    (up from me, down to them), allowing one marriage at each end (in-laws).
 * 2. `addressTerms` turns that into words for a region. What I call myself is simply what
 *    they call me, so it's computed from the reverse path, never written separately.
 */
import { linkIndex, type LinkIndex, type People } from './people';
import type { Gender, Person } from './types';

export type Region = 'trung' | 'bac' | 'nam';

const MAX_UP = 12;

/** Which line is senior at the common ancestor (vai): theirs compared with mine. */
export type Seniority = 'older' | 'younger' | 'unknown';

export interface BloodLink {
  /** generations from me up to the common ancestor */
  up: number;
  /** generations from the common ancestor down to them */
  down: number;
  /** first step up from me went through my father ('f') or my mother ('m') */
  side: 'f' | 'm' | null;
  senior: Seniority;
  /** the person on my line just below the common ancestor (my parent for an uncle, …) */
  myBranch: string | null;
  /** the person on their line just below the common ancestor */
  theirBranch: string | null;
  /** ids from me to them */
  path: string[];
  /** siblings who share only one parent */
  half: boolean;
}

export type Relation =
  | { kind: 'self'; path: string[] }
  | { kind: 'spouse'; path: string[] }
  | {
      kind: 'blood';
      blood: BloodLink;
      /** they are the spouse of this blood relative of mine (dâu, rể, thím, mợ, dượng…) */
      viaTheirSpouse: string | null;
      /** I reach them through my spouse (bên vợ / bên chồng) */
      viaMySpouse: string | null;
      path: string[];
    };

interface Up {
  dist: number;
  side: 'f' | 'm' | null;
  /** next person down toward the start */
  below: string | null;
}

const indexCache = new WeakMap<People, LinkIndex>();
function indexOf(people: People): LinkIndex {
  let idx = indexCache.get(people);
  if (!idx) indexCache.set(people, (idx = linkIndex(people)));
  return idx;
}

/** Everyone above `id` (and `id` itself at distance 0), nearest first. */
function ancestors(people: People, id: string): Map<string, Up> {
  const out = new Map<string, Up>([[id, { dist: 0, side: null, below: null }]]);
  let level = [id];
  for (let d = 1; d <= MAX_UP && level.length; d++) {
    const next: string[] = [];
    for (const x of level) {
      const p = people[x];
      for (const [par, s] of [
        [p.fatherId, 'f'],
        [p.motherId, 'm'],
      ] as const) {
        if (!par || !people[par] || out.has(par)) continue;
        out.set(par, { dist: d, side: d === 1 ? s : out.get(x)!.side, below: x });
        next.push(par);
      }
    }
    level = next;
  }
  return out;
}

/** Path from `id` up to ancestor `a` (inclusive), using the `below` links. */
function climb(map: Map<string, Up>, a: string): string[] {
  const path: string[] = [];
  for (let x: string | null = a; x !== null; x = map.get(x)!.below) path.unshift(x);
  return path; // starts at the person, ends at the ancestor
}

/** Elder/younger between two people who are children of the same ancestor. */
export function compareSiblings(a: Person, b: Person): Seniority {
  if (a.order && b.order && a.order !== b.order) return b.order < a.order ? 'older' : 'younger';
  const ya = a.birth?.y;
  const yb = b.birth?.y;
  if (ya && yb && ya !== yb) return yb < ya ? 'older' : 'younger';
  return 'unknown';
}

/** Blood relation through the nearest common ancestor, or null. Ties prefer my father's side. */
export function bloodLink(people: People, me: string, them: string): BloodLink | null {
  if (!people[me] || !people[them] || me === them) return null;
  const mine = ancestors(people, me);
  const theirs = ancestors(people, them);
  let best: { a: string; total: number; sideRank: number } | null = null;
  for (const [a, m] of mine) {
    const t = theirs.get(a);
    if (!t) continue;
    const total = m.dist + t.dist;
    const sideRank = m.side === 'm' ? 1 : 0;
    if (!best || total < best.total || (total === best.total && sideRank < best.sideRank))
      best = { a, total, sideRank };
  }
  if (!best) return null;
  const up = mine.get(best.a)!.dist;
  const down = theirs.get(best.a)!.dist;
  const myLine = climb(mine, best.a); // me … ancestor
  const theirLine = climb(theirs, best.a); // them … ancestor
  const myBranch = up > 0 ? myLine[myLine.length - 2] : null;
  const theirBranch = down > 0 ? theirLine[theirLine.length - 2] : null;
  const senior =
    myBranch && theirBranch ? compareSiblings(people[myBranch], people[theirBranch]) : 'unknown';
  let half = false;
  if (up === 1 && down === 1) {
    const a = people[me];
    const b = people[them];
    half = !(a.fatherId === b.fatherId && a.motherId === b.motherId);
  }
  return {
    up,
    down,
    side: mine.get(best.a)!.side,
    senior,
    myBranch,
    theirBranch,
    path: [...myLine, ...theirLine.slice(0, -1).reverse()],
    half,
  };
}

/** How `me` is related to `them`: by blood, as the spouse of a blood relative, or through my
 *  spouse (one marriage at each end at most). Null when no link is found. */
export function relationPath(people: People, me: string, them: string): Relation | null {
  if (!people[me] || !people[them]) return null;
  if (me === them) return { kind: 'self', path: [me] };
  const spouses = (id: string) => indexOf(people).spouses[id] ?? [];
  if (spouses(me).includes(them)) return { kind: 'spouse', path: [me, them] };

  const blood = (a: string, b: string) => (a === b ? null : bloodLink(people, a, b));
  const pick = (
    list: { blood: BloodLink; viaTheirSpouse: string | null; viaMySpouse: string | null }[],
  ) => list.sort((x, y) => x.blood.path.length - y.blood.path.length)[0];

  const direct = blood(me, them);
  if (direct)
    return {
      kind: 'blood',
      blood: direct,
      viaTheirSpouse: null,
      viaMySpouse: null,
      path: direct.path,
    };

  // they married one of my blood relatives
  const theirs = spouses(them)
    .map((s) => ({ s, b: blood(me, s) }))
    .filter((x): x is { s: string; b: BloodLink } => Boolean(x.b))
    .map((x) => ({ blood: x.b, viaTheirSpouse: x.s, viaMySpouse: null }));
  if (theirs.length) {
    const r = pick(theirs);
    return { kind: 'blood', ...r, path: [...r.blood.path, them] };
  }

  // they are a relative of my spouse (and possibly married to one: e.g. the husband of my
  // wife's sister)
  const mineViaSpouse = spouses(me).flatMap((ms) => {
    const own = blood(ms, them);
    const viaTheirs = spouses(them)
      .map((s) => ({ s, b: blood(ms, s) }))
      .filter((x): x is { s: string; b: BloodLink } => Boolean(x.b));
    return [
      ...(own ? [{ blood: own, viaTheirSpouse: null, viaMySpouse: ms }] : []),
      ...viaTheirs.map((x) => ({ blood: x.b, viaTheirSpouse: x.s, viaMySpouse: ms })),
    ];
  });
  if (mineViaSpouse.length) {
    const r = pick(mineViaSpouse);
    return {
      kind: 'blood',
      ...r,
      path: [me, ...r.blood.path, ...(r.viaTheirSpouse ? [them] : [])],
    };
  }
  return null;
}

// ---------------------------------------------------------------------------------------
// Words

export interface Terms {
  /** what I call them */
  call: string;
  /** how they are related to me, e.g. "em trai của bố" */
  relation: string;
}

const g3 = (g: Gender, m: string, f: string, u = `${m}/${f}`) =>
  g === 'm' ? m : g === 'f' ? f : u;

function parentWord(region: Region, g: Gender) {
  return region === 'bac' ? g3(g, 'bố', 'mẹ') : g3(g, 'ba', 'má');
}

/** Words for an ancestor `up` generations above me (direct line). */
function ancestorWord(region: Region, up: number, g: Gender, side: 'f' | 'm' | null): Terms {
  if (up === 1) {
    const call = parentWord(region, g);
    return { call, relation: g3(g, 'bố', 'mẹ', 'bố/mẹ') };
  }
  if (up === 2) {
    const s = side === 'm' ? 'ngoại' : 'nội';
    const call = `${g3(g, 'ông', 'bà')} ${s}`;
    return { call, relation: call };
  }
  if (up === 3) {
    const call = region === 'bac' ? 'cụ' : g3(g, 'ông cố', 'bà cố');
    return { call, relation: `${g3(g, 'ông', 'bà')} cố (3 đời trên)` };
  }
  if (up === 4) {
    // Bình Định: ông kỵ / bà kỵ (gia đình duyệt); Nam: ông sơ / bà sơ; Bắc: kỵ
    const call =
      region === 'bac'
        ? 'kỵ'
        : region === 'trung'
          ? g3(g, 'ông kỵ', 'bà kỵ')
          : g3(g, 'ông sơ', 'bà sơ');
    return { call, relation: '4 đời trên' };
  }
  return { call: 'cụ tổ', relation: `${up} đời trên` };
}

function descendantWord(down: number, g: Gender, viaSon: boolean | null): Terms {
  if (down === 1) return { call: 'con', relation: g3(g, 'con trai', 'con gái', 'con') };
  if (down === 2)
    return {
      call: 'cháu',
      relation: viaSon === null ? 'cháu' : viaSon ? 'cháu nội' : 'cháu ngoại',
    };
  const call = down === 3 ? 'chắt' : down === 4 ? 'chút' : 'chít';
  return { call, relation: `${call} (${down} đời dưới)` };
}

/** Hàng cô chú bác: one generation above me, not my parent. */
function uncleWord(region: Region, g: Gender, side: 'f' | 'm' | null, senior: Seniority): string {
  const maternal = side === 'm';
  if (g === 'u') return maternal ? 'cậu/dì' : 'chú/cô';
  if (region === 'bac') {
    if (senior === 'older') return 'bác';
    const young = maternal ? g3(g, 'cậu', 'dì') : g3(g, 'chú', 'cô');
    return senior === 'younger' ? young : `bác/${young}`;
  }
  // Trung (Bình Định) and Nam: only the father's brothers are split by seniority
  if (maternal) return g3(g, 'cậu', 'dì');
  if (g === 'f') return 'cô';
  return senior === 'older' ? 'bác' : senior === 'younger' ? 'chú' : 'bác/chú';
}

/** What I call the spouse of someone I call `word` (one generation above me). */
function uncleSpouseWord(region: Region, word: string): string {
  const one = (w: string) => {
    switch (w) {
      case 'bác':
        return 'bác';
      case 'chú':
        return 'thím';
      case 'cô':
      case 'dì':
        return region === 'bac' ? 'chú' : 'dượng';
      case 'cậu':
        return 'mợ';
      default:
        return w;
    }
  };
  return word.split('/').map(one).join('/');
}

function sameGenWord(g: Gender, senior: Seniority): string {
  if (senior === 'older') return g3(g, 'anh', 'chị');
  if (senior === 'younger') return 'em';
  return `${g3(g, 'anh', 'chị')} hoặc em`;
}

/** Words for a blood relative (no marriage in between). */
function bloodTerms(people: People, b: BloodLink, them: string, region: Region): Terms {
  const g = people[them].gender;
  const gap = b.up - b.down;
  if (b.down === 0) return ancestorWord(region, b.up, g, b.side);
  if (b.up === 0) {
    const viaSon = b.down >= 2 && b.theirBranch ? people[b.theirBranch].gender === 'm' : null;
    return descendantWord(b.down, g, viaSon);
  }
  // collateral relatives
  if (gap === 0) {
    const call = sameGenWord(g, b.senior);
    const ruot = b.up === 1 ? (b.half ? ' (cùng bố hoặc cùng mẹ)' : ' ruột') : ' họ';
    const who =
      call === 'em'
        ? g3(g, 'em trai', 'em gái', 'em')
        : b.senior === 'unknown'
          ? call
          : g3(g, 'anh', 'chị');
    return { call, relation: `${who}${ruot}` };
  }
  if (gap === 1) {
    const call = uncleWord(region, g, b.side, b.senior);
    const parent = b.side === 'm' ? 'mẹ' : 'bố';
    if (b.up === 2) {
      const rank =
        b.senior === 'older'
          ? g3(g, 'anh', 'chị')
          : b.senior === 'younger'
            ? g3(g, 'em trai', 'em gái', 'em')
            : g3(g, 'anh/em trai', 'chị/em gái', 'anh chị em');
      return { call, relation: `${rank} của ${parent}` };
    }
    return { call, relation: `${call} họ (bên ${parent})` };
  }
  if (gap >= 2) {
    const anc = ancestorWord(region, gap, g, b.side);
    const call = gap === 2 ? g3(g, 'ông', 'bà') : anc.call;
    const uncle = uncleWord(region, g, b.side, b.senior);
    return { call, relation: gap === 2 ? `${g3(g, 'ông', 'bà')} ${uncle}` : anc.relation };
  }
  // they are of a younger generation, not my descendant
  return {
    call: gap <= -3 ? descendantWord(-gap, g, null).call : 'cháu',
    relation: b.up === 1 ? 'cháu ruột' : 'cháu họ',
  };
}

/** What I call the spouse of a blood relative I call `rel`. */
function spouseOfRelative(region: Region, rel: Terms, b: BloodLink, spouseGender: Gender): Terms {
  const gap = b.up - b.down;
  const husbandOrWife = g3(spouseGender, 'chồng', 'vợ', 'vợ/chồng');
  const relation = `${husbandOrWife} của ${rel.call}`;
  if (b.down === 0) {
    // spouse of my parent / grandparent who is not my own parent (kế)
    if (b.up === 1) return { call: g3(spouseGender, 'dượng', 'dì', 'dượng/dì'), relation };
    return { call: ancestorWord(region, b.up, spouseGender, b.side).call, relation };
  }
  if (b.up === 0) {
    // con dâu, con rể, cháu dâu…
    const word = g3(spouseGender, 'rể', 'dâu', 'dâu/rể');
    return { call: rel.call, relation: `${rel.call === 'con' ? 'con' : rel.call} ${word}` };
  }
  if (gap === 0) {
    if (b.senior === 'older')
      return {
        call: g3(spouseGender, 'anh', 'chị'),
        relation: g3(spouseGender, 'anh rể', 'chị dâu', 'anh rể/chị dâu'),
      };
    if (b.senior === 'younger')
      return { call: 'em', relation: g3(spouseGender, 'em rể', 'em dâu', 'em dâu/rể') };
    return { call: `${g3(spouseGender, 'anh', 'chị')} hoặc em`, relation };
  }
  if (gap === 1) return { call: uncleSpouseWord(region, rel.call), relation };
  if (gap >= 2) return { call: g3(spouseGender, 'ông', 'bà'), relation };
  return { call: 'cháu', relation: g3(spouseGender, 'cháu rể', 'cháu dâu', 'cháu dâu/rể') };
}

/** What I call `them`, given how we are related. */
export function addressTerms(
  people: People,
  rel: Relation,
  them: string,
  region: Region = 'trung',
): Terms {
  if (rel.kind === 'self') return { call: '', relation: 'chính bạn' };
  const me = rel.path[0];
  if (rel.kind === 'spouse') {
    const g = people[them].gender;
    const call = g === 'm' ? 'anh' : g === 'f' ? 'em' : people[me].gender === 'f' ? 'anh' : 'em';
    return { call, relation: g3(g, 'chồng', 'vợ', 'vợ/chồng') };
  }
  const b = rel.blood;
  // the blood relative at the far end (them, or the one they married)
  const far = rel.viaTheirSpouse ?? them;
  let terms = bloodTerms(people, b, far, region);
  if (rel.viaTheirSpouse) terms = spouseOfRelative(region, terms, b, people[them].gender);
  if (rel.viaMySpouse) {
    const side = people[rel.viaMySpouse].gender === 'f' ? 'vợ' : 'chồng';
    // my spouse's grandparents and above: "bà nội của vợ" (not "bà nội (bên vợ)")
    const ancestor = !rel.viaTheirSpouse && b.down === 0 && b.up >= 2;
    terms = {
      call: terms.call,
      relation: ancestor ? `${terms.relation} của ${side}` : `${terms.relation} (bên ${side})`,
    };
  }
  // the relation reads in the region's own words: "em gái của ba" in the Trung and the Nam
  if (region !== 'bac')
    terms = {
      ...terms,
      relation: terms.relation
        .replace(/(^|[\s(/])bố(?=$|[\s)/])/g, '$1ba')
        .replace(/(^|[\s(/])mẹ(?=$|[\s)/])/g, '$1má'),
    };
  return terms;
}

/**
 * Gọi thay con (gia đình duyệt 27/11): an in-law of my own generation (the younger sister of my
 * husband, the husband of my younger sister, my wife's older brother…) is called anh / chị /
 * em as usual; in front of the children people often call them the way the children do. Returns that word —
 * what a child of mine (and my spouse) would call them — or null when it doesn't apply.
 */
function childCall(people: People, rel: Relation, call: string, them: string, region: Region) {
  if (rel.kind !== 'blood' || !['em', 'anh', 'chị'].includes(call)) return null;
  if (!rel.viaMySpouse && !rel.viaTheirSpouse) return null;
  if (rel.blood.up !== rel.blood.down) return null;
  const me = rel.path[0];
  const spouse = rel.viaMySpouse ?? indexOf(people).spouses[me]?.[0] ?? null;
  const mine = people[me].gender;
  const child: Person = {
    name: '',
    gender: 'u',
    ...(mine === 'f'
      ? { motherId: me, ...(spouse ? { fatherId: spouse } : {}) }
      : { fatherId: me, ...(spouse ? { motherId: spouse } : {}) }),
  };
  const withChild: People = { ...people, [CHILD]: child };
  const there = relationPath(withChild, CHILD, them);
  if (!there) return null;
  const word = addressTerms(withChild, there, them, region).call;
  return word && word !== call ? word : null;
}
const CHILD = '__child_for_goi_thay_con__';

export interface Kinship {
  /** I call them … */
  call: string;
  /** … and call myself … (what they call me) */
  self: string;
  relation: string;
  path: string[];
  /** gọi thay con: in front of the children, people may call them this instead */
  childCall: string | null;
}

/** Everything the person page and the "Gọi nhau thế nào" screen show; null if unrelated. */
export function kinship(
  people: People,
  me: string,
  them: string,
  region: Region = 'trung',
): Kinship | null {
  const there = relationPath(people, me, them);
  const back = relationPath(people, them, me);
  if (!there || !back) return null;
  const t = addressTerms(people, there, them, region);
  const s = addressTerms(people, back, me, region);
  // "ông nội" calls himself "ông", not "ông nội"
  const self = s.call.replace(/ (nội|ngoại)$/, '');
  return {
    call: t.call,
    self,
    relation: t.relation,
    path: there.path,
    childCall: childCall(people, there, t.call, them, region),
  };
}
