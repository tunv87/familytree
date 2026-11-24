/**
 * What goes where inside one tree card — shared by the on-screen tree (TreeSvg) and the PDF
 * (drawTree) so they always match. Two looks: text only (150 px), or a small round photo left
 * of the name (kiểu B, 190 px — chosen by the family on the mock).
 */
import { deathAnniversaryKey } from '../data/dates';
import type { Kinship } from '../data/kinship';
import type { Person } from '../data/types';
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

/** Cuts a line to `max` characters with "…" (cards are fixed size). */
export function fit(s: string, max: number): string {
  const chars = [...s];
  return chars.length <= max
    ? s
    : `${chars
        .slice(0, max - 1)
        .join('')
        .trimEnd()}…`;
}

/** Characters that fit on the small line of a card. */
export function subtitleRoom(cardW: number): number {
  return cardW >= PHOTO_CARD_W ? 20 : 24;
}

/**
 * The small line under the name (chosen by the family on the mock):
 *  - passed away: "(1960–2022), 20/8 ÂL" — years and the lunar giỗ date, whatever is known;
 *  - living: "1987 · TP. Hồ Chí Minh" — birth year and where they live (no "Sinh").
 */
export function cardSubtitle(p: Person, cardW: number): string {
  let text: string;
  if (p.deceased) {
    const b = p.birth?.y;
    const d = p.death?.y;
    const years = b || d ? `(${b ?? '?'}–${d ?? '?'})` : '';
    const key = deathAnniversaryKey(p.death);
    const gio = key ? `${key.d}/${key.m} ÂL` : '';
    text = [years, gio].filter(Boolean).join(', ') || 'Đã mất';
  } else {
    text = [p.birth?.y, p.place].filter(Boolean).join(' · ');
  }
  return fit(text, subtitleRoom(cardW));
}

/**
 * The red label on the edge of a card when the viewer has said who they are (K1):
 * what they call this person. Plain words like "em" or "con" become the precise relation
 * ("Em gái", "Vợ", "Con trai") so the label says something on its own.
 */
export function kinBadge(k: Kinship | null): string | null {
  if (!k) return null;
  const generic = /^(anh|chị|em|con|anh\/chị hoặc em|chị hoặc em|anh hoặc em)$/;
  const relation = k.relation
    .replace(/\s*\(.*\)$/, '') // "(bên vợ)", "(3 đời trên)"
    .replace(/ ruột$/, '')
    .trim();
  const word = generic.test(k.call) && relation ? relation : k.call;
  if (!word) return null;
  return fit(word.charAt(0).toUpperCase() + word.slice(1), 14);
}
