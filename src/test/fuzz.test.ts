/** CR-07 fuzz: thousands of random inputs must never throw or break invariants. */
import { describe, expect, it } from 'vitest';
import { eventsInYear, monthGrid } from '../calendar/events';
import {
  dateError,
  formatFamilyDate,
  nextDeathAnniversary,
  otherCalendarText,
  toLunar,
  toSolar,
} from '../data/dates';
import {
  childrenOf,
  deletePersonUpdates,
  applyUpdates,
  searchPeople,
  type People,
} from '../data/people';
import type { FamilyDate, Person } from '../data/types';
import { jdFromDate, jdToDate, lunarToSolar, solarToLunar } from '../lib/lunar';
import { CARD_W, layoutTree } from '../tree/layout';
import { planPdf } from '../tree/pdfPlan';

function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

/** a random (sometimes weird) family graph */
function randomPeople(rand: () => number, n: number): People {
  const ids = Array.from({ length: n }, (_, i) => `p${i}`);
  const pick = () => ids[Math.floor(rand() * ids.length)];
  const people: People = {};
  for (const id of ids) {
    const p: Person = { name: `Người ${id}`, gender: rand() < 0.5 ? 'm' : 'f' };
    if (rand() < 0.7) p.fatherId = pick();
    if (rand() < 0.5) p.motherId = pick();
    if (rand() < 0.3) p.spouses = { [pick()]: true };
    if (rand() < 0.1) p.fatherId = 'missing';
    if (rand() < 0.4) p.order = Math.floor(rand() * 5);
    people[id] = p;
  }
  return people;
}

describe('CR-07 fuzz: tree layout', () => {
  it('1,000 random graphs (loops, self-links, dangling ids): no throw, each person once, no overlaps', () => {
    const rand = rng(42);
    for (let t = 0; t < 1000; t++) {
      const people = randomPeople(rand, 1 + Math.floor(rand() * 25));
      const layout = layoutTree(people);
      const ids = layout.nodes.map((n) => n.id);
      expect(new Set(ids).size).toBe(ids.length);
      expect(ids.sort()).toEqual(Object.keys(people).sort());
      const rows = new Map<number, number[]>();
      for (const n of layout.nodes) rows.set(n.y, [...(rows.get(n.y) ?? []), n.x]);
      for (const xs of rows.values()) {
        xs.sort((a, b) => a - b);
        for (let i = 1; i < xs.length; i++)
          expect(xs[i] - xs[i - 1]).toBeGreaterThanOrEqual(CARD_W);
      }
      expect(Number.isFinite(layout.width) && Number.isFinite(layout.height)).toBe(true);
    }
  });

  it('random collapse sets and branch roots never throw', () => {
    const rand = rng(7);
    for (let t = 0; t < 300; t++) {
      const people = randomPeople(rand, 15);
      const ids = Object.keys(people);
      const collapsed = new Set(ids.filter(() => rand() < 0.3));
      expect(() => layoutTree(people, { collapsed, rootId: ids[t % ids.length] })).not.toThrow();
    }
  });

  it('deleting random people keeps the graph consistent', () => {
    const rand = rng(99);
    for (let t = 0; t < 200; t++) {
      let people = randomPeople(rand, 12);
      const victim = `p${Math.floor(rand() * 12)}`;
      people = applyUpdates(people, deletePersonUpdates(people, victim));
      for (const p of Object.values(people)) {
        expect(p.fatherId).not.toBe(victim);
        expect(p.motherId).not.toBe(victim);
        expect(p.spouses?.[victim]).toBeUndefined();
      }
      expect(childrenOf(people, victim)).toEqual([]);
    }
  });
});

describe('CR-07 fuzz: dates and lunar calendar', () => {
  it('random partial / invalid dates never throw', () => {
    const rand = rng(2027);
    const pickNum = (max: number) =>
      rand() < 0.2 ? undefined : Math.floor(rand() * max) - (rand() < 0.05 ? max : 0);
    for (let t = 0; t < 5000; t++) {
      const d: FamilyDate = {
        cal: rand() < 0.5 ? 's' : 'l',
        d: pickNum(35),
        m: pickNum(15),
        y: pickNum(2300),
        leap: rand() < 0.1 ? true : undefined,
      };
      expect(() => {
        dateError(d);
        formatFamilyDate(d);
        toSolar(d);
        toLunar(d);
        otherCalendarText(d);
        nextDeathAnniversary(d, { day: 1, month: 1, year: 2027 });
      }).not.toThrow();
    }
  });

  it('every valid lunar date converts back to itself (random sample 1800–2199)', () => {
    const rand = rng(5);
    for (let t = 0; t < 3000; t++) {
      const jd = jdFromDate(1, 1, 1800) + Math.floor(rand() * 146_000);
      const s = jdToDate(jd);
      const l = solarToLunar(s.day, s.month, s.year);
      expect(lunarToSolar(l.day, l.month, l.year, l.leap)).toEqual(s);
    }
  });

  it('random families: yearly events, month grids and search never throw', () => {
    const rand = rng(11);
    for (let t = 0; t < 200; t++) {
      const people = randomPeople(rand, 10);
      for (const p of Object.values(people)) {
        p.deceased = rand() < 0.5;
        p.death = {
          cal: rand() < 0.5 ? 'l' : 's',
          d: Math.floor(rand() * 31) + 1,
          m: Math.floor(rand() * 12) + 1,
        };
        p.birth = {
          cal: 's',
          d: Math.floor(rand() * 31) + 1,
          m: Math.floor(rand() * 12) + 1,
          y: 1950,
        };
      }
      const year = 1990 + Math.floor(rand() * 60);
      expect(() => eventsInYear(people, year)).not.toThrow();
      expect(monthGrid(year, (t % 12) + 1).length % 7).toBe(0);
      expect(() =>
        searchPeople(
          people,
          String.fromCharCode(...Array.from({ length: 5 }, () => 32 + Math.floor(rand() * 9000))),
        ),
      ).not.toThrow();
    }
  });
});

describe('CR-07 fuzz: PDF pages', () => {
  it('random tree sizes always produce a sane plan that covers the tree', () => {
    const rand = rng(3);
    for (let t = 0; t < 2000; t++) {
      const w = 100 + rand() * 30000;
      const h = 100 + rand() * 4000;
      const paper = rand() < 0.5 ? 'a4' : 'a3';
      const mode = (['auto', 'one', 'tiles'] as const)[t % 3];
      const plan = planPdf(w, h, paper, mode);
      expect(plan.pages.length).toBeGreaterThan(0);
      expect(plan.pages.length).toBeLessThan(500);
      expect(plan.scale).toBeGreaterThan(0);
      const last = plan.pages[plan.pages.length - 1];
      expect(last.x + last.w).toBeGreaterThanOrEqual(w - 0.5);
      expect(last.y + last.h).toBeGreaterThanOrEqual(h - 0.5);
    }
  });
});
