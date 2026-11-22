/**
 * How to split a laid-out tree over sheets of paper.
 *
 * Sizes: the layout is in "tree px" (a card is 150 × 66). On paper we want a card about
 * 38 mm wide (names ≈ 9 pt) — readable for grandparents. If the whole tree fits on one
 * sheet at a still-legible size we use one sheet; otherwise we tile it over several
 * sheets that are glued together, each labelled with its row and column.
 */

export type Paper = 'a4' | 'a3';
export type PdfMode = 'auto' | 'one' | 'tiles';

export const PAPER_MM: Record<Paper, [number, number]> = { a4: [297, 210], a3: [420, 297] }; // landscape

/** mm per tree px: comfortable (card ≈ 38 mm) and the smallest still legible (card ≈ 22 mm). */
export const SCALE_COMFORT = 0.25;
export const SCALE_MIN_ONE_PAGE = 0.15;

export const MARGIN_MM = 10;
export const HEADER_MM = 12;
/** tiles overlap a little so nothing is lost at the cut */
export const OVERLAP_MM = 8;

export interface PageArea {
  /** sheet position (1-based) */
  row: number;
  col: number;
  /** region of the tree, in tree px */
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface PdfPlan {
  paper: Paper;
  /** mm per tree px */
  scale: number;
  rows: number;
  cols: number;
  pages: PageArea[];
  /** drawable area on each sheet, mm */
  areaW: number;
  areaH: number;
}

export function planPdf(treeW: number, treeH: number, paper: Paper, mode: PdfMode): PdfPlan {
  const [pw, ph] = PAPER_MM[paper];
  const areaW = pw - 2 * MARGIN_MM;
  const areaH = ph - 2 * MARGIN_MM - HEADER_MM;
  const fitScale = Math.min(areaW / treeW, areaH / treeH);
  const one = mode === 'one' || (mode === 'auto' && fitScale >= SCALE_MIN_ONE_PAGE);
  if (one) {
    const scale = Math.min(fitScale, SCALE_COMFORT * 1.6);
    return {
      paper,
      scale,
      rows: 1,
      cols: 1,
      pages: [{ row: 1, col: 1, x: 0, y: 0, w: treeW, h: treeH }],
      areaW,
      areaH,
    };
  }
  const scale = SCALE_COMFORT;
  const stepW = (areaW - OVERLAP_MM) / scale;
  const stepH = (areaH - OVERLAP_MM) / scale;
  const tileW = areaW / scale;
  const tileH = areaH / scale;
  const cols = Math.max(1, Math.ceil((treeW - tileW) / stepW) + 1);
  const rows = Math.max(1, Math.ceil((treeH - tileH) / stepH) + 1);
  const pages: PageArea[] = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      pages.push({ row: r + 1, col: c + 1, x: c * stepW, y: r * stepH, w: tileW, h: tileH });
  return { paper, scale, rows, cols, pages, areaW, areaH };
}
