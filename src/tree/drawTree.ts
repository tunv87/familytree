/** Draws a laid-out tree on a 2D canvas (used for the printable PDF). Mirrors TreeSvg. */
import { lifespan, type People } from '../data/people';
import { CARD_H, CARD_W, wrapName, type TreeLayout } from './layout';

const C = {
  line: '#9b8b6e',
  marriage: '#c9952b',
  m: '#2f6fae',
  f: '#c0507a',
  u: '#9b8b6e',
  card: '#ffffff',
  dead: '#f1ece2',
  text: '#1f2937',
  muted: '#6b7280',
};
export const FONT = "'Nunito', 'Segoe UI', Arial, sans-serif";

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function drawTree(ctx: CanvasRenderingContext2D, layout: TreeLayout, people: People) {
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = C.line;
  ctx.lineWidth = 2;
  for (const pts of layout.lines) {
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.stroke();
  }
  ctx.strokeStyle = C.marriage;
  ctx.lineWidth = 3;
  for (const [x1, y1, x2, y2] of layout.marriages) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  for (const n of layout.nodes) {
    const p = people[n.id];
    roundRect(ctx, n.x, n.y, CARD_W, CARD_H, 12);
    ctx.fillStyle = p.deceased ? C.dead : C.card;
    ctx.fill();
    ctx.strokeStyle = C[p.gender];
    ctx.lineWidth = 2;
    ctx.setLineDash(n.inLaw ? [6, 4] : []);
    ctx.stroke();
    ctx.setLineDash([]);
    const lines = wrapName(p.name);
    const years = lifespan(p);
    const top = years ? (lines.length === 1 ? 26 : 19) : lines.length === 1 ? 37 : 28;
    ctx.fillStyle = C.text;
    ctx.font = `800 15px ${FONT}`;
    lines.forEach((l, i) => ctx.fillText(l, n.x + CARD_W / 2, n.y + top + i * 17));
    if (years) {
      ctx.fillStyle = C.muted;
      ctx.font = `400 12px ${FONT}`;
      ctx.fillText(years, n.x + CARD_W / 2, n.y + top + lines.length * 17 + 1);
    }
  }
}
