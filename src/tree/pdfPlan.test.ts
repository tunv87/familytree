import { describe, expect, it } from 'vitest';
import {
  HEADER_MM,
  MARGIN_MM,
  PAPER_MM,
  planPdf,
  SCALE_COMFORT,
  SCALE_MIN_ONE_PAGE,
} from './pdfPlan';

describe('LG-07 planPdf', () => {
  it('a small tree goes on one sheet, not blown up too much', () => {
    const p = planPdf(800, 400, 'a4', 'auto');
    expect(p.pages).toHaveLength(1);
    expect(p.scale).toBeLessThanOrEqual(SCALE_COMFORT * 1.6);
    expect(800 * p.scale).toBeLessThanOrEqual(PAPER_MM.a4[0] - 2 * MARGIN_MM + 0.01);
  });

  it('a medium tree still fits one sheet while it stays legible', () => {
    const p = planPdf(1500, 600, 'a4', 'auto');
    expect(p.pages).toHaveLength(1);
    expect(p.scale).toBeGreaterThanOrEqual(SCALE_MIN_ONE_PAGE);
  });

  it('a big tree is tiled so that every part is covered', () => {
    const W = 6000;
    const H = 900;
    const p = planPdf(W, H, 'a4', 'auto');
    expect(p.pages.length).toBeGreaterThan(1);
    expect(p.scale).toBe(SCALE_COMFORT);
    // every point of the tree is on at least one sheet
    for (let x = 0; x <= W; x += 50)
      for (let y = 0; y <= H; y += 50)
        expect(
          p.pages.some((pg) => x >= pg.x && x <= pg.x + pg.w && y >= pg.y && y <= pg.y + pg.h),
        ).toBe(true);
    // no useless sheet completely outside the tree
    for (const pg of p.pages) {
      expect(pg.x).toBeLessThan(W);
      expect(pg.y).toBeLessThan(H);
    }
    expect(p.pages.map((pg) => `${pg.row}-${pg.col}`)).toContain(`1-${p.cols}`);
  });

  it('A3 needs fewer sheets than A4', () => {
    const a4 = planPdf(6000, 1500, 'a4', 'tiles');
    const a3 = planPdf(6000, 1500, 'a3', 'tiles');
    expect(a3.pages.length).toBeLessThan(a4.pages.length);
  });

  it('"one" forces a single sheet even if tiny', () => {
    const p = planPdf(20000, 3000, 'a4', 'one');
    expect(p.pages).toHaveLength(1);
    expect(3000 * p.scale).toBeLessThanOrEqual(PAPER_MM.a4[1] - 2 * MARGIN_MM - HEADER_MM + 0.01);
  });
});
