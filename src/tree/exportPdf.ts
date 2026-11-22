import { jsPDF } from 'jspdf';
import type { People } from '../data/people';
import { createLogger } from '../lib/logger';
import { drawTree, FONT } from './drawTree';
import { layoutTree } from './layout';
import { HEADER_MM, MARGIN_MM, PAPER_MM, planPdf, type Paper, type PdfMode } from './pdfPlan';

const log = createLogger('pdf');
const DPI = 200;
const PX_PER_MM = DPI / 25.4;

export interface PdfOptions {
  people: People;
  rootId?: string;
  title: string;
  paper: Paper;
  mode: PdfMode;
  onProgress?: (done: number, total: number) => void;
}

/** Renders the whole tree (ignoring collapsed branches) to a printable PDF. */
export async function exportTreePdf(o: PdfOptions): Promise<{ blob: Blob; pages: number }> {
  // the canvas only draws with fonts that are already loaded
  await Promise.all([
    document.fonts.load(`800 15px Nunito`, 'Nguyễn Việt'),
    document.fonts.load(`400 12px Nunito`, 'Nguyễn Việt'),
  ]);
  const layout = layoutTree(o.people, { rootId: o.rootId });
  const plan = planPdf(layout.width, layout.height, o.paper, o.mode);
  const [pw, ph] = PAPER_MM[o.paper];
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: o.paper, compress: true });
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(pw * PX_PER_MM);
  canvas.height = Math.round(ph * PX_PER_MM);
  const ctx = canvas.getContext('2d')!;
  const printed = new Date().toLocaleDateString('vi-VN');
  const total = plan.pages.length;
  log.info('export', { paper: o.paper, pages: total, scale: plan.scale.toFixed(3) });

  for (const [i, pg] of plan.pages.entries()) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // header: name on the left, date and sheet number on the right
    ctx.setTransform(PX_PER_MM, 0, 0, PX_PER_MM, 0, 0);
    ctx.fillStyle = '#1f2937';
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';
    ctx.font = `800 6px ${FONT}`;
    ctx.fillText(o.title, MARGIN_MM, MARGIN_MM + 6);
    ctx.textAlign = 'right';
    ctx.font = `400 3.6px ${FONT}`;
    ctx.fillStyle = '#6b7280';
    const sheet =
      total > 1 ? ` · Tờ ${i + 1}/${total} (hàng ${pg.row}, cột ${pg.col} — ghép chồng mép)` : '';
    ctx.fillText(`In ngày ${printed}${sheet}`, pw - MARGIN_MM, MARGIN_MM + 6);
    // tree area
    const ax = MARGIN_MM;
    const ay = MARGIN_MM + HEADER_MM;
    ctx.save();
    ctx.beginPath();
    ctx.rect(ax, ay, plan.areaW, plan.areaH);
    ctx.clip();
    // centre a single-sheet tree horizontally
    const offX = total === 1 ? (plan.areaW - layout.width * plan.scale) / 2 : 0;
    ctx.translate(ax + offX, ay);
    ctx.scale(plan.scale, plan.scale);
    ctx.translate(-pg.x, -pg.y);
    drawTree(ctx, layout, o.people);
    ctx.restore();

    if (i > 0) pdf.addPage(o.paper, 'landscape');
    pdf.addImage(canvas.toDataURL('image/jpeg', 0.9), 'JPEG', 0, 0, pw, ph, undefined, 'FAST');
    o.onProgress?.(i + 1, total);
    // let the UI breathe between sheets
    await new Promise((r) => setTimeout(r, 0));
  }
  return { blob: pdf.output('blob'), pages: total };
}
