/**
 * What goes where inside one tree card — shared by the on-screen tree (TreeSvg) and the PDF
 * (drawTree) so they always match. Two looks: text only (150 px), or a small round photo left
 * of the name (kiểu B, 190 px — chosen by the family on the mock).
 */
import { CARD_H, PHOTO_CARD_W, wrapName } from './layout';

export interface CardContent {
  /** the round photo / default avatar, or null for a text-only card */
  photo: { cx: number; cy: number; r: number } | null;
  textX: number;
  anchor: 'middle' | 'start';
  lines: string[];
  /** baseline of the first name line */
  nameY: number;
  /** baseline of the years line (when there are years) */
  yearsY: number;
}

export const LINE_H = 17;

export function cardContent(name: string, years: string, cardW: number): CardContent {
  const withPhoto = cardW >= PHOTO_CARD_W;
  const lines = withPhoto ? wrapName(name, 13) : wrapName(name);
  const nameY = years ? (lines.length === 1 ? 26 : 19) : lines.length === 1 ? 37 : 28;
  return {
    photo: withPhoto ? { cx: 32, cy: CARD_H / 2, r: 22 } : null,
    textX: withPhoto ? 62 : cardW / 2,
    anchor: withPhoto ? 'start' : 'middle',
    lines,
    nameY,
    yearsY: nameY + lines.length * LINE_H + 1,
  };
}
