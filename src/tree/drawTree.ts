/** Draws a laid-out tree on a 2D canvas (used for the printable PDF). Mirrors TreeSvg. */
import type { People } from '../data/people';
import { GENDER_ICON } from '../ui/Avatar';
import { cardContent, cardSubtitle, LINE_H } from './card';
import { CARD_H, type TreeLayout } from './layout';

const C = {
  line: '#9b8b6e',
  marriage: '#c9952b',
  m: '#2f6fae',
  f: '#c0507a',
  u: '#9b8b6e',
  card: '#ffffff',
  dead: '#d9cfbd',
  deadText: '#2f2a24',
  deadAvatarBg: '#c8bda9',
  text: '#1f2937',
  muted: '#59606b',
  avatarBg: '#fdf1d6',
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

export function drawTree(
  ctx: CanvasRenderingContext2D,
  layout: TreeLayout,
  people: People,
  /** decoded small photos by person id (used when the cards have room for a photo) */
  photos: Record<string, CanvasImageSource> = {},
) {
  const CARD_W = layout.cardW;
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
    const years = cardSubtitle(p, CARD_W);
    const c = cardContent(p.name, years, CARD_W);
    if (c.photo) {
      const cx = n.x + c.photo.cx;
      const cy = n.y + c.photo.cy;
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, c.photo.r, 0, Math.PI * 2);
      ctx.fillStyle = p.deceased ? C.deadAvatarBg : C.avatarBg;
      ctx.fill();
      const img = photos[n.id];
      if (p.deceased) ctx.filter = 'grayscale(1)';
      if (img) {
        ctx.clip();
        const d = c.photo.r * 2;
        ctx.drawImage(img, cx - c.photo.r, cy - c.photo.r, d, d);
      } else {
        ctx.textAlign = 'center';
        ctx.font = `26px ${FONT}`;
        ctx.fillStyle = C.text;
        ctx.fillText(GENDER_ICON[p.gender], cx, cy + 9);
      }
      ctx.restore();
    }
    ctx.textAlign = c.anchor === 'start' ? 'left' : 'center';
    ctx.fillStyle = C.text;
    ctx.font = `800 15px ${FONT}`;
    c.lines.forEach((l, i) => ctx.fillText(l, n.x + c.textX, n.y + c.nameY + i * LINE_H));
    if (years) {
      ctx.fillStyle = p.deceased ? C.deadText : C.muted;
      ctx.font = `${p.deceased ? 700 : 400} 12px ${FONT}`;
      ctx.fillText(years, n.x + c.textX, n.y + c.yearsY);
    }
  }
}
